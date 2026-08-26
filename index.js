"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CONFIG = {
  API_BASE: "https://primedownloader.onrender.com",
  DEFAULT_OUTPUT: "video.mp4",
  TIMEOUT: 60000,
  POLL_INTERVAL: 1000,
  MAX_RETRIES: 3
};

class VideoDownloader {
  constructor(url, outputPath = CONFIG.DEFAULT_OUTPUT) {
    this.url = url;
    this.outputPath = path.resolve(outputPath);
    this.metadata = null;
    this.jobId = null;
    this.formats = [];
  }

  async fetchMetadata() {
    try {
      const response = await axios.post(
        `${CONFIG.API_BASE}/api/info`,
        { url: this.url },
        {
          timeout: CONFIG.TIMEOUT,
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      this.metadata = {
        title: response.data.title || "Downloaded Video",
        duration: response.data.duration || 0,
        thumbnail: response.data.thumbnail || null,
        uploader: response.data.uploader || "Unknown",
        formats: response.data.formats || []
      };

      this.formats = this.metadata.formats;

      return this.metadata;
    } catch (error) {
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
  }

  async download(options = {}) {
    const { format = "video", formatId = null, progress = false } = options;

    if (!this.metadata) {
      await this.fetchMetadata();
    }

    const selectedFormat = formatId
      ? this.formats.find(f => f.id === formatId)
      : this.formats[0];

    if (!selectedFormat) {
      throw new Error("No format selected for download");
    }

    try {
      const response = await axios.post(
        `${CONFIG.API_BASE}/api/download`,
        {
          url: this.url,
          format: format,
          format_id: selectedFormat.id,
          title: this.metadata.title
        },
        {
          timeout: CONFIG.TIMEOUT,
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      this.jobId = response.data.job_id;

      if (!this.jobId) {
        throw new Error("No job ID returned");
      }

      return await this.waitForDownload(progress);
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  async waitForDownload(progress = false) {
    let lastProgress = 0;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const response = await axios.get(
            `${CONFIG.API_BASE}/api/status/${this.jobId}`,
            { timeout: CONFIG.TIMEOUT }
          );

          const data = response.data;

          if (data.status === "done") {
            const fileResponse = await axios({
              method: "GET",
              url: `${CONFIG.API_BASE}/api/file/${this.jobId}`,
              responseType: "stream",
              timeout: CONFIG.TIMEOUT
            });

            const writer = fs.createWriteStream(this.outputPath);
            fileResponse.data.pipe(writer);

            writer.on("finish", () => {
              if (fs.existsSync(this.outputPath)) {
                resolve({
                  title: this.metadata?.title || "Downloaded Video",
                  filePath: this.outputPath,
                  size: fs.statSync(this.outputPath).size,
                  duration: this.metadata?.duration || 0,
                  channel: this.metadata?.uploader || "Unknown",
                  type: "video",
                  quality: "1080p"
                });
              } else {
                reject(new Error("Download completed but file not found"));
              }
            });

            writer.on("error", reject);
            return;
          }

          if (data.status === "error") {
            reject(new Error(data.error || "Download failed"));
            return;
          }

          if (progress && data.progress) {
            const pct = Math.floor(data.progress);
            if (pct > lastProgress) {
              const elapsed = (Date.now() - startTime) / 1000;
              const speed = elapsed > 0
                ? (data.progress / 1024 / 1024 / elapsed).toFixed(1)
                : 0;
              console.log(`Progress: ${pct}% | Speed: ${speed} MB/s`);
              lastProgress = pct;
            }
          }

          setTimeout(checkStatus, CONFIG.POLL_INTERVAL);
        } catch (error) {
          reject(new Error(`Status check failed: ${error.message}`));
        }
      };

      checkStatus();
    });
  }

  async process(options = {}) {
    await this.fetchMetadata();
    return await this.download(options);
  }

  static async downloadVideo(url, outputPath = CONFIG.DEFAULT_OUTPUT, options = {}) {
    const downloader = new VideoDownloader(url, outputPath);
    return await downloader.process({ ...options, format: "video" });
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
