"use strict";

const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");
const path = require("path");

const CONFIG = {
  API_URL: "https://nayan-video-downloader.vercel.app/alldown",
  DEFAULT_OUTPUT: "video.mp4",
  TIMEOUT: 30000,
  MAX_RETRIES: 3
};

class VideoDownloader {
  constructor(url, outputPath = CONFIG.DEFAULT_OUTPUT) {
    this.url = url;
    this.outputPath = path.resolve(outputPath);
    this.apiUrl = `${CONFIG.API_URL}?url=${encodeURIComponent(url)}`;
    this.metadata = null;
    this.downloadUrl = null;
  }

  async fetchMetadata() {
    try {
      const response = await axios.get(this.apiUrl, {
        timeout: CONFIG.TIMEOUT
      });

      if (!response.data?.data) {
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

  async download() {
    if (!this.downloadUrl) {
      await this.fetchMetadata();
    }

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(this.outputPath);
      let retryCount = 0;

      const attemptDownload = () => {
        const downloadRequest = request(this.downloadUrl);

        downloadRequest.on("response", (response) => {
          if (response.statusCode === 404 || response.statusCode === 403) {
            reject(new Error(`Download failed with status ${response.statusCode}`));
          }
        });

        downloadRequest
          .pipe(writeStream)
          .on("close", () => {
            if (fs.existsSync(this.outputPath)) {
              resolve({
                title: this.metadata.title,
                filePath: this.outputPath,
                size: fs.statSync(this.outputPath).size
              });
            } else {
              reject(new Error("Download completed but file not found"));
            }
          })
          .on("error", (err) => {
            if (retryCount < CONFIG.MAX_RETRIES) {
              retryCount++;
              console.log(`Retry ${retryCount}/${CONFIG.MAX_RETRIES}...`);
              setTimeout(attemptDownload, 1000 * retryCount);
            } else {
              reject(new Error(`Download failed after ${CONFIG.MAX_RETRIES} attempts: ${err.message}`));
            }
          });
      };

      attemptDownload();
    });
  }

  async process() {
    await this.fetchMetadata();
    return await this.download();
  }

  static async downloadVideo(url, outputPath = CONFIG.DEFAULT_OUTPUT) {
    const downloader = new VideoDownloader(url, outputPath);
    return await downloader.process();
  }
}

module.exports = {
  VideoDownloader,
  downloadVideo: VideoDownloader.downloadVideo
};
