"use strict";

const untube = require("untube").default || require("untube");
const fs = require("fs-extra");
const path = require("path");

const CONFIG = {
  DEFAULT_VIDEO_OUTPUT: "video.mp4",
  DEFAULT_AUDIO_OUTPUT: "audio.mp3",
  QUALITY: "highest",
  AUDIO_QUALITY: "highestaudio",
  AUDIO_FORMATS: ["mp3", "m4a", "aac", "flac", "wav", "opus"],
  MODE: "parallel"
};

class VideoDownloader {
  constructor(url, outputPath = CONFIG.DEFAULT_VIDEO_OUTPUT) {
    this.url = url;
    this.outputPath = path.resolve(outputPath);
    this.metadata = null;
    this.stream = null;
    this.info = null;
  }

  async fetchMetadata() {
    try {
      this.info = await untube.getVideoInfo(this.url);
      this.metadata = {
        id: this.info.id,
        title: this.info.title || "Downloaded Video",
        duration: this.info.duration || 0,
        channel: this.info.uploader || this.info.author_name || "Unknown",
        views: this.info.view_count || 0,
        thumbnail: this.info.thumbnail || null,
        description: this.info.description || "",
        formats: this.info.formats || []
      };
      return this.metadata;
    } catch (error) {
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
  }

  async download(options = {}) {
    const {
      quality = CONFIG.QUALITY,
      progress = false,
      mode = CONFIG.MODE,
      filter = null
    } = options;

    const outputDir = path.dirname(this.outputPath);
    await fs.ensureDir(outputDir);

    if (!this.info) {
      await this.fetchMetadata();
    }

    return new Promise((resolve, reject) => {
      const streamOptions = {
        format: quality,
        mode: mode,
        signal: options.signal || undefined,
        proxy: options.proxy || undefined,
        cookies: options.cookies || undefined
      };

      if (filter) {
        streamOptions.filter = filter;
      }

      this.stream = untube(this.url, streamOptions);

      let downloaded = 0;
      let total = 0;
      let lastProgress = 0;
      const startTime = Date.now();

      this.stream.on("info", (info, format) => {
        console.log(`Downloading: ${info.title}`);
        console.log(`Format: ${format.resolution || format.quality || "best"}`);
        if (format.filesize) {
          total = format.filesize;
        }
      });

      this.stream.on("progress", (progressData) => {
        if (progress) {
          const percent = progressData.percent || 0;
          if (Math.floor(percent) > Math.floor(lastProgress)) {
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = elapsed > 0
              ? (progressData.downloadedBytes / 1024 / 1024 / elapsed).toFixed(1)
              : 0;
            console.log(`Progress: ${percent.toFixed(0)}% | Speed: ${speed} MB/s`);
            lastProgress = percent;
          }
        }
      });

      this.stream.on("error", (err) => {
        reject(new Error(`Download failed: ${err.message}`));
      });

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
      this.stream.pipe(writeStream);
    });
  }

  async downloadAudio(options = {}) {
    const {
      format = "mp3",
      quality = CONFIG.AUDIO_QUALITY,
      progress = false,
      mode = CONFIG.MODE
    } = options;

    if (!CONFIG.AUDIO_FORMATS.includes(format)) {
      throw new Error(`Unsupported audio format: ${format}. Supported: ${CONFIG.AUDIO_FORMATS.join(", ")}`);
    }

    const audioPath = this.outputPath.replace(/\.[^.]+$/, `.${format}`);
    this.outputPath = path.resolve(audioPath);

    if (!this.info) {
      await this.fetchMetadata();
    }

    const outputDir = path.dirname(this.outputPath);
    await fs.ensureDir(outputDir);

    return new Promise((resolve, reject) => {
      const streamOptions = {
        format: quality,
        mode: mode,
        filter: "audioonly",
        signal: options.signal || undefined,
        proxy: options.proxy || undefined,
        cookies: options.cookies || undefined
      };

      this.stream = untube(this.url, streamOptions);

      let downloaded = 0;
      let total = 0;
      let lastProgress = 0;
      const startTime = Date.now();

      this.stream.on("info", (info, format) => {
        console.log(`Downloading audio: ${info.title}`);
        console.log(`Format: ${format.audio_bitrate || "best audio"}`);
        if (format.filesize) {
          total = format.filesize;
        }
      });

      this.stream.on("progress", (progressData) => {
        if (progress) {
          const percent = progressData.percent || 0;
          if (Math.floor(percent) > Math.floor(lastProgress)) {
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = elapsed > 0
              ? (progressData.downloadedBytes / 1024 / 1024 / elapsed).toFixed(1)
              : 0;
            console.log(`Progress: ${percent.toFixed(0)}% | Speed: ${speed} MB/s`);
            lastProgress = percent;
          }
        }
      });

      this.stream.on("error", (err) => {
        reject(new Error(`Audio download failed: ${err.message}`));
      });

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
      this.stream.pipe(writeStream);
    });
  }

  async process(options = {}) {
    await this.fetchMetadata();
    return await this.download(options);
  }

  static async downloadVideo(url, outputPath = CONFIG.DEFAULT_VIDEO_OUTPUT, options = {}) {
    const downloader = new VideoDownloader(url, outputPath);
    return await downloader.process(options);
  }

  static async downloadAudio(url, outputPath = CONFIG.DEFAULT_AUDIO_OUTPUT, options = {}) {
    const downloader = new VideoDownloader(url, outputPath);
    await downloader.fetchMetadata();
    return await downloader.downloadAudio(options);
  }

  static async getInfo(url) {
    const downloader = new VideoDownloader(url);
    return await downloader.fetchMetadata();
  }

  static async searchMusic(query, options = {}) {
    try {
      const results = await untube.ytmusic(query, options);
      return results.map((result) => ({
        id: result.id,
        title: result.title,
        artist: result.artist,
        album: result.album || null,
        duration: result.duration || 0,
        durationString: result.duration_string || null,
        thumbnail: result.thumbnail || null,
        url: result.webpage_url || `https://music.youtube.com/watch?v=${result.id}`
      }));
    } catch (error) {
      throw new Error(`Music search failed: ${error.message}`);
    }
  }
}

module.exports = {
  VideoDownloader,
  downloadVideo: VideoDownloader.downloadVideo,
  downloadAudio: VideoDownloader.downloadAudio,
  getInfo: VideoDownloader.getInfo,
  searchMusic: VideoDownloader.searchMusic
};
