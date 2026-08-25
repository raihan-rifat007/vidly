"use strict";

const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const path = require("path");

const CONFIG = {
  DEFAULT_OUTPUT: "video.mp4",
  MAX_RETRIES: 2,
  QUALITY: "highest",
  PLAYER_CLIENTS: ["WEB", "TV", "ANDROID"],
  HIGH_WATER_MARK: 1024 * 1024 * 2
};

class VideoDownloader {
  constructor(url, outputPath = CONFIG.DEFAULT_OUTPUT) {
    this.url = url;
    this.outputPath = path.resolve(outputPath);
    this.metadata = null;
  }

  async fetchMetadata() {
    try {
      const info = await ytdl.getInfo(this.url, {
        playerClients: CONFIG.PLAYER_CLIENTS
      });
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
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
  }

  async download(options = {}) {
    const { quality = CONFIG.QUALITY, progress = false } = options;
    const outputDir = path.dirname(this.outputPath);
    await fs.ensureDir(outputDir);

    try {
      const info = await ytdl.getInfo(this.url, {
        playerClients: CONFIG.PLAYER_CLIENTS
      });

      const format = ytdl.chooseFormat(info.formats, {
        quality: quality,
        filter: "audioandvideo"
      });

      if (!format) {
        throw new Error("No suitable format found");
      }

      const stream = ytdl.downloadFromInfo(info, {
        format: format,
        highWaterMark: CONFIG.HIGH_WATER_MARK
      });

      const writeStream = fs.createWriteStream(this.outputPath);
      let downloaded = 0;
      let total = format.contentLength || 0;
      let lastProgress = 0;
      const startTime = Date.now();

      stream.on("data", (chunk) => {
        downloaded += chunk.length;
        if (progress) {
          const percent = total > 0 ? (downloaded / total) * 100 : 0;
          if (Math.floor(percent) > Math.floor(lastProgress)) {
            const speed = (downloaded / 1024 / 1024 / ((Date.now() - startTime) / 1000)).toFixed(1);
            console.log(`Progress: ${percent.toFixed(0)}% | Speed: ${speed} MB/s`);
            lastProgress = percent;
          }
        }
      });

      stream.pipe(writeStream);

      return new Promise((resolve, reject) => {
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
      });

    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
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

  static async getInfo(url) {
    const downloader = new VideoDownloader(url);
    return await downloader.fetchMetadata();
  }
}

module.exports = {
  VideoDownloader,
  downloadVideo: VideoDownloader.downloadVideo,
  getInfo: VideoDownloader.getInfo
};
