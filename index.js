"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CONFIG = {
  API_URL: "https://nayan-video-downloader.vercel.app/alldown",
  DEFAULT_OUTPUT: "video.mp4",
  TIMEOUT: 60000,
  MAX_RETRIES: 3
};

class VideoDownloader {
  constructor(url, outputPath = CONFIG.DEFAULT_OUTPUT) {
    this.url = url;
    this.outputPath = path.resolve(outputPath);
    this.metadata = null;
    this.downloadUrl = null;
  }

  async fetchMetadata() {
    try {
      const apiUrl = `${CONFIG.API_URL}?url=${encodeURIComponent(this.url)}`;
      const response = await axios.get(apiUrl, {
        timeout: CONFIG.TIMEOUT
      });

      if (!response.data || !response.data.data) {
        throw new Error("No video data found for the provided URL.");
      }

      const { title, high, low } = response.data.data;
      this.metadata = {
        title: title || "Downloaded Video",
        highQuality: high || null,
        lowQuality: low || null
      };

      this.downloadUrl = this.metadata.highQuality || this.metadata.lowQuality;

      if (!this.downloadUrl) {
        throw new Error("No downloadable video URL found.");
      }

      return this.metadata;
    } catch (error) {
      throw new Error(`Failed to fetch video metadata: ${error.message}`);
    }
  }

  async download(options = {}) {
    if (!this.downloadUrl) {
      await this.fetchMetadata();
    }

    const { progress = false } = options;
    const outputDir = path.dirname(this.outputPath);
    await fs.ensureDir(outputDir);

    return new Promise((resolve, reject) => {
      axios({
        method: "GET",
        url: this.downloadUrl,
        responseType: "stream",
        timeout: 60000
      })
      .then((response) => {
        const totalLength = parseInt(response.headers["content-length"], 10);
        let downloaded = 0;
        const writer = fs.createWriteStream(this.outputPath);
        let lastProgress = 0;
        const startTime = Date.now();

        response.data.on("data", (chunk) => {
          downloaded += chunk.length;
          if (progress) {
            const percent = totalLength > 0 ? (downloaded / totalLength) * 100 : 0;
            if (Math.floor(percent) > Math.floor(lastProgress)) {
              const speed = (downloaded / 1024 / 1024 / ((Date.now() - startTime) / 1000)).toFixed(1);
              console.log(`Progress: ${percent.toFixed(0)}% | Speed: ${speed} MB/s`);
              lastProgress = percent;
            }
          }
        });

        response.data.pipe(writer);

        writer.on("finish", () => {
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
            reject(new Error("Download completed but file not found"));
          }
        });

        writer.on("error", reject);
        response.data.on("error", reject);
      })
      .catch((error) => {
        reject(new Error(`Download failed: ${error.message}`));
      });
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
