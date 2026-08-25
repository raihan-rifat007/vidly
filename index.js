"use strict";

const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { execSync } = require('child_process');

const CONFIG = {
  DEFAULT_OUTPUT: 'video.mp4',
  DEFAULT_AUDIO_OUTPUT: 'audio.mp3',
  AUDIO_FORMATS: ['mp3', 'm4a', 'aac', 'flac', 'wav', 'opus'],
  VIDEO_FORMATS: ['mp4', 'webm', 'mkv', 'avi']
};

class VideoDownloader {
  constructor(url, outputPath = CONFIG.DEFAULT_OUTPUT) {
    this.url = url;
    this.outputPath = path.resolve(outputPath);
    this.metadata = null;
  }

  async fetchMetadata() {
    try {
      const info = await ytdl.getInfo(this.url);
      this.metadata = {
        title: info.videoDetails.title || "Downloaded Video",
        duration: parseInt(info.videoDetails.lengthSeconds) || 0,
        channel: info.videoDetails.author?.name || "Unknown",
        views: parseInt(info.videoDetails.viewCount) || 0,
        likes: parseInt(info.videoDetails.likes) || 0,
        thumbnail: info.videoDetails.thumbnails?.[0]?.url || null
      };
      return this.metadata;
    } catch (error) {
      throw new Error(`Failed to fetch video metadata: ${error.message}`);
    }
  }

  async download(options = {}) {
    const { quality = 'highest', format = 'mp4' } = options;
    const outputDir = path.dirname(this.outputPath);
    await fs.ensureDir(outputDir);

    return new Promise((resolve, reject) => {
      const stream = ytdl(this.url, {
        quality: quality,
        filter: 'audioandvideo'
      });

      const writeStream = fs.createWriteStream(this.outputPath);
      stream.pipe(writeStream);

      let downloaded = 0;
      let total = 0;

      stream.on('progress', (chunkLength, downloadedBytes, totalBytes) => {
        downloaded = downloadedBytes;
        total = totalBytes;
        const percent = (downloaded / total) * 100;
        if (options.progress) {
          console.log(`Downloading: ${percent.toFixed(1)}% - ${(downloaded / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB`);
        }
      });

      writeStream.on('finish', () => {
        if (fs.existsSync(this.outputPath)) {
          resolve({
            title: this.metadata?.title || "Downloaded Video",
            filePath: this.outputPath,
            size: fs.statSync(this.outputPath).size,
            duration: this.metadata?.duration || 0,
            channel: this.metadata?.channel || "Unknown",
            type: 'video'
          });
        } else {
          reject(new Error("Download completed but file not found"));
        }
      });

      writeStream.on('error', reject);
      stream.on('error', reject);
    });
  }

  async extractAudio(options = {}) {
    const { format = 'mp3', bitrate = '192k', keepVideo = false } = options;
    if (!CONFIG.AUDIO_FORMATS.includes(format)) {
      throw new Error(`Unsupported audio format: ${format}. Supported: ${CONFIG.AUDIO_FORMATS.join(', ')}`);
    }

    await this.download({ quality: 'highest', progress: options.progress || false });

    const audioPath = this.outputPath.replace(/\.[^.]+$/, `.${format}`);

    return new Promise((resolve, reject) => {
      ffmpeg(this.outputPath)
        .audioBitrate(bitrate)
        .audioCodec(this.getAudioCodec(format))
        .format(format)
        .on('end', () => {
          if (!keepVideo && fs.existsSync(this.outputPath)) {
            fs.unlinkSync(this.outputPath);
          }
          resolve({
            title: this.metadata?.title || "Extracted Audio",
            filePath: audioPath,
            size: fs.statSync(audioPath).size,
            duration: this.metadata?.duration || 0,
            format: format,
            bitrate: bitrate,
            type: 'audio'
          });
        })
        .on('error', (err) => {
          reject(new Error(`Audio extraction failed: ${err.message}`));
        })
        .save(audioPath);
    });
  }

  getAudioCodec(format) {
    const codecs = {
      'mp3': 'libmp3lame',
      'm4a': 'aac',
      'aac': 'aac',
      'flac': 'flac',
      'wav': 'pcm_s16le',
      'opus': 'libopus'
    };
    return codecs[format] || 'libmp3lame';
  }

  async process(options = {}) {
    await this.fetchMetadata();
    return await this.download(options);
  }

  static async downloadVideo(url, outputPath = CONFIG.DEFAULT_OUTPUT, options = {}) {
    const downloader = new VideoDownloader(url, outputPath);
    return await downloader.process(options);
  }

  static async downloadAudio(url, outputPath = CONFIG.DEFAULT_AUDIO_OUTPUT, options = {}) {
    const { format = 'mp3', bitrate = '192k' } = options;
    const audioPath = outputPath.endsWith(`.${format}`) ? outputPath : outputPath + `.${format}`;
    const downloader = new VideoDownloader(url, audioPath);
    await downloader.fetchMetadata();
    return await downloader.extractAudio({ format, bitrate, ...options });
  }

  static async getInfo(url) {
    const downloader = new VideoDownloader(url);
    return await downloader.fetchMetadata();
  }
}

module.exports = {
  VideoDownloader,
  downloadVideo: VideoDownloader.downloadVideo,
  downloadAudio: VideoDownloader.downloadAudio,
  getInfo: VideoDownloader.getInfo
};
