"use strict";

const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const path = require("path");

const CONFIG = {
  DEFAULT_OUTPUT: "video.mp4",
  QUALITY: "highest",
  PLAYER_CLIENTS: ["WEB", "TV", "ANDROID"],
  HIGH_WATER_MARK: 1024 * 1024 * 2,
  AUDIO_FORMATS: ["mp3", "m4a", "aac", "flac", "wav", "opus"]
};

class VideoDownloader {
  constructor(url, outputPath = CONFIG.DEFAULT_OUTPUT) {
    this.url = url;
    this.outputPath = path.resolve(outputPath);
    this.metadata = null;
    this.info = null;
  }

  async fetchMetadata() {
    try {
      this.info = await ytdl.getInfo(this.url, {
        playerClients: CONFIG.PLAYER_CLIENTS
      });
      this.metadata = {
        id: this.info.videoDetails.videoId,
        title: this.info.videoDetails.title || "Downloaded Video",
        duration: parseInt(this.info.videoDetails.lengthSeconds) || 0,
        channel: this.info.videoDetails.author?.name || "Unknown",
        views: parseInt(this.info.videoDetails.viewCount) || 0,
        likes: parseInt(this.info.videoDetails.likes) || 0,
        thumbnail: this.info.videoDetails.thumbnails?.[0]?.url || null,
        description: this.info.videoDetails.description || ""
      };
      return this.metadata;
    } catch (error) {
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
  }

  async download(options = {}) {
    const { quality = CONFIG.QUALITY, progress = false } = options;
    const outputDir = path.dirname(this.outputPath);
    await fs.ensureDir(outputDir);

    if (!this.info) {
      await this.fetchMetadata();
    }

    return new Promise((resolve, reject) => {
      const format = ytdl.chooseFormat(this.info.formats, {
        quality: quality,
        filter: "audioandvideo"
      });

      if (!format) {
        reject(new Error("No suitable format found"));
        return;
      }

      const stream = ytdl.downloadFromInfo(this.info, {
        format: format,
        highWaterMark: CONFIG.HIGH_WATER_MARK,
        playerClients: CONFIG.PLAYER_CLIENTS
      });

      let downloaded = 0;
      let total = parseInt(format.contentLength) || 0;
      let lastProgress = 0;
      const startTime = Date.now();

      if (progress) {
        stream.on("progress", (chunkLength, downloadedBytes, totalBytes) => {
          downloaded = downloadedBytes;
          total = totalBytes || total;
          const percent = total > 0 ? (downloaded / total) * 100 : 0;
          if (Math.floor(percent) > Math.floor(lastProgress)) {
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = elapsed > 0 ? (downloaded / 1024 / 1024 / elapsed).toFixed(1) : 0;
            console.log(`Progress: ${percent.toFixed(0)}% | Speed: ${speed} MB/s`);
            lastProgress = percent;
          }
        });
      }

      const writeStream = fs.createWriteStream(this.outputPath);

      writeStream.on("finish", () => {
        if (fs.existsSync(this.outputPath)) {
          resolve({
            title: this.metadata?.title || "Downloaded Video",
            filePath: this.outputPath,
            size: fs.statSync(this.outputPath).size,
            duration: this.metadata?.duration || 0,
            channel: this.metadata?.channel || "Unknown",
            type: "video"
          });
        } else {
          reject(new Error("File not found"));
        }
      });

      writeStream.on("error", reject);
      stream.on("error", reject);
      stream.pipe(writeStream);
    });
  }

  async downloadAudio(options = {}) {
    const { format = "mp3", progress = false } = options;

    if (!this.info) {
      await this.fetchMetadata();
    }

    const audioPath = this.outputPath.replace(/\.[^.]+$/, `.${format}`);
    this.outputPath = path.resolve(audioPath);
    const outputDir = path.dirname(this.outputPath);
    await fs.ensureDir(outputDir);

    return new Promise((resolve, reject) => {
      const audioFormat = ytdl.chooseFormat(this.info.formats, {
        quality: "highestaudio",
        filter: "audioonly"
      });

      if (!audioFormat) {
        reject(new Error("No audio format found"));
        return;
      }

      const stream = ytdl.downloadFromInfo(this.info, {
        format: audioFormat,
        highWaterMark: CONFIG.HIGH_WATER_MARK,
        playerClients: CONFIG.PLAYER_CLIENTS
      });

      let downloaded = 0;
      let total = parseInt(audioFormat.contentLength) || 0;
      let lastProgress = 0;
      const startTime = Date.now();

      if (progress) {
        stream.on("progress", (chunkLength, downloadedBytes, totalBytes) => {
          downloaded = downloadedBytes;
          total = totalBytes || total;
          const percent = total > 0 ? (downloaded / total) * 100 : 0;
          if (Math.floor(percent) > Math.floor(lastProgress)) {
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = elapsed > 0 ? (downloaded / 1024 / 1024 / elapsed).toFixed(1) : 0;
            console.log(`Audio Progress: ${percent.toFixed(0)}% | Speed: ${speed} MB/s`);
            lastProgress = percent;
          }
        });
      }

      const writeStream = fs.createWriteStream(this.outputPath);

      writeStream.on("finish", () => {
        if (fs.existsSync(this.outputPath)) {
          resolve({
            title: this.metadata?.title || "Downloaded Audio",
            filePath: this.outputPath,
            size: fs.statSync(this.outputPath).size,
            duration: this.metadata?.duration || 0,
            channel: this.metadata?.channel || "Unknown",
            format: format,
            type: "audio"
          });
        } else {
          reject(new Error("File not found"));
        }
      });

      writeStream.on("error", reject);
      stream.on("error", reject);
      stream.pipe(writeStream);
    });
  }

  async process(options = {}) {
    await this.fetchMetadata();
    return await this.download(options);
  }

  static async downloadVideo(url, outputPath = CONFIG.DEFAULT_OUTPUT, options = {}) {
    const downloader = new VideoDownloader(url, outputPath);
    return await downloader.process(options);
  }

  static async downloadAudio(url, outputPath = CONFIG.DEFAULT_OUTPUT, options = {}) {
    const downloader = new VideoDownloader(url, outputPath);
    await downloader.fetchMetadata();
    return await downloader.downloadAudio(options);
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
