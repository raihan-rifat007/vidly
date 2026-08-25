# vidly

> Universal video downloader for Node.js — TikTok, Facebook, Instagram, YouTube, Twitter, Pinterest and more.

<p align="center">
  <a href="https://www.npmjs.com/package/vidly">
    <img src="https://img.shields.io/npm/v/vidly?style=for-the-badge&logo=npm&logoColor=white&color=CB3837" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/vidly">
    <img src="https://img.shields.io/npm/dt/vidly?style=for-the-badge&logo=npm&logoColor=white&color=CB3837" alt="npm downloads">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/npm/l/vidly?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=3DA639" alt="license">
  </a>
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen?style=for-the-badge&logo=node.js&logoColor=white&color=339933" alt="node version">
  </a>
  <br>
  <a href="https://github.com/raihan-rifat007/vidly">
    <img src="https://img.shields.io/github/stars/raihan-rifat007/vidly?style=for-the-badge&logo=github&logoColor=white&color=181717" alt="stars">
  </a>
  <a href="https://github.com/raihan-rifat007/vidly">
    <img src="https://img.shields.io/github/forks/raihan-rifat007/vidly?style=for-the-badge&logo=github&logoColor=white&color=181717" alt="forks">
  </a>
  <a href="https://github.com/raihan-rifat007/vidly/issues">
    <img src="https://img.shields.io/github/issues/raihan-rifat007/vidly?style=for-the-badge&logo=github&logoColor=white&color=181717" alt="issues">
  </a>
  <a href="https://github.com/raihan-rifat007/vidly/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/raihan-rifat007/vidly/npm-publish.yml?style=for-the-badge&logo=githubactions&logoColor=white&color=2088FF" alt="build status">
  </a>
</p>

---

## Overview

**vidly** is a lightweight, production-grade Node.js package that enables video downloads from major social media platforms with zero configuration.

Designed for developers building bots, automation pipelines, media tools, and web scrapers, vidly abstracts the complexity of platform-specific APIs into a single, consistent interface. Simply pass a URL, and vidly handles the rest — fetching metadata, selecting the best available quality, and downloading the video to your specified location.

---

## Features

| Feature | Description |
|---------|-------------|
| **Universal Support** | TikTok, Facebook, Instagram, YouTube, Twitter/X, Pinterest, and more |
| **One-Line API** | Simple `async/await` interface with zero configuration required |
| **Auto Retry** | Built-in exponential backoff retry mechanism for failed downloads |
| **Custom Output** | User-defined file paths with automatic directory creation |
| **High Quality** | Automatically selects the best available video quality |
| **Lightweight** | Minimal dependencies for fast installation and low overhead |
| **Type Safety** | Full JSDoc annotations for intelligent editor autocompletion |
| **Error Handling** | Comprehensive error codes and descriptive error messages |

---

## Installation

```bash
npm install vidly
```

---

Quick Start

```javascript
const { downloadVideo } = require('vidly');

(async () => {
  const result = await downloadVideo('https://www.tiktok.com/@user/video/123456789');
  console.log(result);
})();
```

Output:

```json
{
  "title": "Amazing Video",
  "filePath": "/path/to/video.mp4",
  "size": 5242880
}
```

---

API Reference

downloadVideo(url, outputPath)

Downloads a video from the given URL.

Parameter Type Required Default Description
url string Yes — Video URL to download
outputPath string No video.mp4 Destination file path

Returns: Promise<VideoResult>

```typescript
interface VideoResult {
  title: string;    // Video title
  filePath: string; // Absolute path to downloaded file
  size: number;     // File size in bytes
}
```

VideoDownloader Class

For more granular control, use the class-based API.

Method Description
fetchMetadata() Fetches video information without downloading
download() Downloads the video using stored metadata
process() Fetches metadata and downloads in one call

Properties:

· metadata — Object containing title, highQuality, lowQuality
· downloadUrl — The actual video URL

---

Advanced Usage

Class-Based Approach

```javascript
const { VideoDownloader } = require('vidly');

const downloader = new VideoDownloader(
  'https://www.instagram.com/p/ABC123/',
  './custom/output.mp4'
);

await downloader.fetchMetadata();
console.log(downloader.metadata.title);
await downloader.download();
```

Error Handling

```javascript
try {
  const result = await downloadVideo(url);
} catch (error) {
  console.error(`[vidly] ${error.message}`);
}
```

Batch Download

```javascript
const { downloadVideo } = require('vidly');

const urls = [
  'https://www.tiktok.com/@user/video/1',
  'https://www.facebook.com/watch?v=2',
  'https://www.instagram.com/p/3'
];

const results = await Promise.all(urls.map(url => downloadVideo(url)));
console.log(`Downloaded ${results.length} videos`);
```

---

Supported Platforms

Platform Status
TikTok ✓ Full Support
Facebook ✓ Full Support
Instagram ✓ Full Support
YouTube ✓ Full Support
Twitter / X ✓ Full Support
Pinterest ✓ Full Support
More Coming Soon 🚧 In Development

---

Error Codes

Code Description
E001 No URL provided
E002 No video data found for the provided URL
E003 No downloadable video URL available
E004 Download failed with HTTP status 4xx/5xx

---

Development

```bash
# Clone the repository
git clone https://github.com/raihan-rifat007/vidly.git
cd vidly

# Install dependencies
npm install

# Run tests
npm test
```

---

Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing)
5. Open a Pull Request

---

License

MIT © raihan07

---

Connect

<p align="center">
  <a href="https://github.com/raihan-rifat007">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://www.facebook.com/raihan.rifat007">
    <img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" alt="Facebook">
  </a>
  <a href="https://www.linkedin.com/in/raihan-rifat">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="https://t.me/raihan_rf">
    <img src="https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram">
  </a>
  <a href="mailto:raihan.rifat007@gmail.com">
    <img src="https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
  </a>
  <a href="https://www.npmjs.com/~raihan07">
    <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm">
  </a>
</p>

---

<p align="center">
  <strong>Built for developers, by raihan.</strong>
</p>
