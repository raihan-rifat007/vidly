# 📦 vidly

> Download videos from TikTok, Facebook, Instagram, YouTube, Twitter, Pinterest and more with a single line of code.

<p align="center">
  <img src="https://img.shields.io/npm/v/vidly" alt="npm version">
  <img src="https://img.shields.io/npm/dt/vidly" alt="npm downloads">
  <img src="https://img.shields.io/npm/l/vidly" alt="license">
  <img src="https://img.shields.io/github/stars/raihan-rifat007/vidly" alt="stars">
  <img src="https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen" alt="node version">
</p>

---

## 📌 Overview

**vidly** is a lightweight, zero-config Node.js package that enables you to download videos from popular social media platforms with just one line of code. Whether you're building a bot, an automation tool, or a media downloader, vidly makes video downloading effortless.

---

## ✨ Features

- ✅ **Universal Support** – TikTok, Facebook, Instagram, YouTube, Twitter (X), Pinterest, and more
- ⚡ **One Line of Code** – Simple `async/await` API
- 🔄 **Auto-Retry** – Built-in retry mechanism for failed downloads
- 📁 **Custom Output** – Specify your own file path
- 🚀 **Zero Configuration** – No API keys, no setup
- 📦 **Lightweight** – Minimal dependencies
- 🎯 **High Quality** – Downloads best available video quality

---

## 📦 Installation

```bash
npm install vidly
```

---

🚀 Quick Start

Basic Usage

```javascript
const { downloadVideo } = require("vidly");

async function main() {
  const result = await downloadVideo("https://www.tiktok.com/@user/video/123456789");

  console.log(result);
  // {
  //   title: "Amazing Video",
  //   filePath: "./video.mp4",
  //   size: 5242880
  // }
}

main();
```

Custom Output Path

```javascript
const { downloadVideo } = require("vidly");

const result = await downloadVideo(
  "https://www.facebook.com/watch?v=123456",
  "./downloads/my_video.mp4"
);

console.log(`✅ Downloaded: ${result.title}`);
```

Using the Class API

```javascript
const { VideoDownloader } = require("vidly");

const downloader = new VideoDownloader(
  "https://www.instagram.com/p/ABC123/",
  "./videos/instagram.mp4"
);

// Fetch metadata and download in one go
const result = await downloader.process();

// Or step by step
await downloader.fetchMetadata();
console.log(downloader.metadata.title);
await downloader.download();
```

---

📚 API Reference

downloadVideo(url, outputPath?)

Downloads a video from the given URL.

Parameter Type Description
url string Video URL to download
outputPath string (Optional) Output file path. Default: video.mp4

Returns: Promise<Object>

```typescript
{
  title: string;    // Video title
  filePath: string; // Absolute path to downloaded file
  size: number;     // File size in bytes
}
```

VideoDownloader Class

Method Description
fetchMetadata() Fetches video information without downloading
download() Downloads the video using stored metadata
process() Fetches metadata and downloads in one call

Properties:

· metadata – Object containing title, highQuality, lowQuality
· downloadUrl – The actual video URL

---

🛠️ Error Handling

```javascript
const { downloadVideo } = require("vidly");

try {
  const result = await downloadVideo("invalid-url");
} catch (error) {
  console.error("❌", error.message);
}
```

Common Errors:

Error Cause
No URL provided Empty URL passed
No video data found Invalid or unsupported URL
No downloadable video URL found Video not available
Download failed with status 404 Video removed or private

---

📱 Supported Platforms

Platform Status
TikTok ✅ Full Support
Facebook ✅ Full Support
Instagram ✅ Full Support
YouTube ✅ Full Support
Twitter / X ✅ Full Support
Pinterest ✅ Full Support
More Coming Soon 🚧 In Development

---

💻 Development

Clone Repository

```bash
git clone https://github.com/raihan-rifat007/vidly.git
cd vidly
npm install
```

Run Tests

```bash
npm test
```

Build

```bash
npm run build
```

---

🤝 Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing)
5. Open a Pull Request

---

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

👤 Author

raihan07

· GitHub: @raihan-rifat007
· npm: raihan07

---

🙏 Support

If you find this package useful, please consider:

· ⭐ Starring the repository on GitHub
· 📦 Sharing it with other developers
· 🐛 Reporting issues
· 🔧 Contributing code

---

📊 Statistics

<p align="center">
  <img src="https://img.shields.io/npm/v/vidly" alt="version">
  <img src="https://img.shields.io/npm/dt/vidly" alt="downloads">
  <img src="https://img.shields.io/github/stars/raihan-rifat007/vidly" alt="stars">
  <img src="https://img.shields.io/github/forks/raihan-rifat007/vidly" alt="forks">
</p>

---

Made with ❤️ by raihan07

```
