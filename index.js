"use strict";

const { downloadVideo: ytDownload } = require('yt-dlp-video');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  DEFAULT_OUTPUT: 'video.mp4',
  DEFAULT_AUDIO_OUTPUT: 'audio.mp3',
  TIMEOUT: 60000,
  MAX_RETRIES: 3,
  AUDIO_FORMATS: ['mp3', 'm4a', 'aac', 'flac', 'wav', 'opus'],
  VIDEO_FORMATS: ['mp4', 'webm', 'mkv', 'avi'],
  AUDIO_CODECS: {
    'mp3': 'libmp3lame',
    'm4a': 'aac',
    'aac': 'aac',
    'flac': 'flac',
    'wav': 'pcm_s16le',
    'opus': 'libopus'
  }
};

class VideoDownloader {
  constructor(url, outputPath = CONFIG.DEFAULT_OUTPUT) {
    this.url = url;
    this.outputPath = path.resolve(outputPath);
    this.metadata = null;
  }

  async fetchMetadata() {
    try {
      const info = await ytDownload(this.url, {
        getInfo: true,
        outputDir: path.dirname(this.outputPath),
        filename: path.basename(this.outputPath, path.extname(this.outputPath))
      });
      this.metadata = {
        title: info.title || "Downloaded Video",
        duration: info.duration || 0,
        thumbnail: info.thumbnail || null,
        channel: info.channel || "Unknown",
        views: info.views || 0,
        likes: info.likes || 0
      };
      return this.metadata;
    } catch (error) {
      throw new Error(`Failed to fetch video metadata: ${error.message}`);
    }
  }

  async download(options = {}) {
    return new Promise((resolve, reject) => {
      const { progress = false, quality = 'best', format = 'mp4' } = options;
      const downloadOptions = {
        outputDir: path.dirname(this.outputPath),
        filename: path.basename(this.outputPath, path.extname(this.outputPath)),
        quality: quality,
        format: format
      };
      if (progress) {
        downloadOptions.onProgress = (progressData) => {
          console.log(`Downloading: ${progressData.percentage}% - ${progressData.speed}`);
        };
      }
      ytDownload(this.url, downloadOptions)
        .then(() => {
          const filePath = path.resolve(this.outputPath);
          if (fs.existsSync(filePath)) {
            resolve({
              title: this.metadata?.title || "Downloaded Video",
              filePath: filePath,
              size: fs.statSync(filePath).size,
              duration: this.metadata?.duration || 0,
              channel: this.metadata?.channel || "Unknown",
              type: 'video'
            });
          } else {
            reject(new Error("Download completed but file not found"));
          }
        })
        .catch(reject);
    });
  }

  async extractAudio(options = {}) {
    const { format = 'mp3', bitrate = '192k', keepVideo = false } = options;
    if (!CONFIG.AUDIO_FORMATS.includes(format)) {
      throw new Error(`Unsupported audio format: ${format}. Supported: ${CONFIG.AUDIO_FORMATS.join(', ')}`);
    }
    const videoPath = this.outputPath;
    const audioPath = videoPath.replace(/\.[^.]+$/, `.${format}`);
    try {
      await this.download({ quality: 'best', progress: options.progress || false });
      const ffmpegCmd = `ffmpeg -i "${videoPath}" -vn -acodec ${CONFIG.AUDIO_CODECS[format] || 'libmp3lame'} -ab ${bitrate} -y "${audioPath}"`;
      try {
        execSync(ffmpegCmd, { stdio: 'pipe' });
      } catch (ffmpegError) {
        throw new Error(`FFmpeg extraction failed: ${ffmpegError.message}`);
      }
      if (!keepVideo && fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
      return {
        title: this.metadata?.title || "Extracted Audio",
        filePath: audioPath,
        size: fs.statSync(audioPath).size,
        duration: this.metadata?.duration || 0,
        format: format,
        bitrate: bitrate,
        type: 'audio'
      };
    } catch (error) {
      throw new Error(`Audio extraction failed: ${error.message}`);
    }
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
    const audioPath = outputPath.endsWith('.mp3') ? outputPath : outputPath + '.mp3';
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
