"use strict";

const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

const CONFIG = {
  DEFAULT_OUTPUT: "video.mp4",
  QUALITY: "1080p",
  PLAYER_CLIENTS: ["WEB", "TV", "ANDROID"],
  HIGH_WATER_MARK: 1024 * 1024 * 2
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

    const tempDir = path.join(__dirname, "cache");
    await fs.ensureDir(tempDir);
    const timestamp = Date.now();
    const videoPath = path.join(tempDir, `temp_video_${timestamp}.mp4`);
    const audioPath = path.join(tempDir, `temp_audio_${timestamp}.mp4`);

    // Get video format (video only - 1080p)
    const videoFormat = ytdl.chooseFormat(this.info.formats, {
      quality: "highestvideo",
      filter: "videoonly"
    });

    // Get audio format (audio only - best quality)
    const audioFormat = ytdl.chooseFormat(this.info.formats, {
      quality: "highestaudio",
      filter: "audioonly"
    });

    if (!videoFormat || !audioFormat) {
      throw new Error("Video or audio format not found");
    }

    console.log(`[vidly] Video: ${videoFormat.qualityLabel || videoFormat.quality}`);
    console.log(`[vidly] Audio: ${audioFormat.audioBitrate || "best"}`);

    // Download video
    if (progress) console.log("[vidly] Downloading video...");
    await new Promise((resolve, reject) => {
      const stream = ytdl.downloadFromInfo(this.info, {
        format: videoFormat,
        highWaterMark: CONFIG.HIGH_WATER_MARK
      });
      const writeStream = fs.createWriteStream(videoPath);
      stream.pipe(writeStream);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      stream.on("error", reject);
    });

    // Download audio
    if (progress) console.log("[vidly] Downloading audio...");
    await new Promise((resolve, reject) => {
      const stream = ytdl.downloadFromInfo(this.info, {
        format: audioFormat,
        highWaterMark: CONFIG.HIGH_WATER_MARK
      });
      const writeStream = fs.createWriteStream(audioPath);
      stream.pipe(writeStream);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      stream.on("error", reject);
    });

    // Merge using ffmpeg
    if (progress) console.log("[vidly] Merging video and audio...");
    try {
      execSync(
        `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${this.outputPath}" -y`,
        { stdio: "pipe" }
      );
    } catch (error) {
      throw new Error(`FFmpeg merge failed: ${error.message}`);
    }

    // Cleanup temp files
    await fs.remove(videoPath).catch(() => {});
    await fs.remove(audioPath).catch(() => {});

    if (progress) console.log("[vidly] Download complete!");

    return {
      title: this.metadata?.title || "Downloaded Video",
      filePath: this.outputPath,
      size: fs.statSync(this.outputPath).size,
      duration: this.metadata?.duration || 0,
      channel: this.metadata?.channel || "Unknown",
      type: "video",
      quality: videoFormat.qualityLabel || videoFormat.quality
    };
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
