<div align="center">

# 🎬 vidly

### Universal Video Downloader for Node.js

**TikTok · Facebook · Instagram · YouTube · Twitter · Pinterest · and more**

[![npm version](https://img.shields.io/npm/v/vidly?style=flat-square&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/vidly)
[![npm downloads](https://img.shields.io/npm/dt/vidly?style=flat-square&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/vidly)
[![license](https://img.shields.io/npm/l/vidly?style=flat-square&logo=opensourceinitiative&logoColor=white&color=3DA639)](LICENSE)
[![node version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen?style=flat-square&logo=node.js&logoColor=white&color=339933)](https://nodejs.org)
[![stars](https://img.shields.io/github/stars/raihan-rifat007/vidly?style=flat-square&logo=github&logoColor=white&color=181717)](https://github.com/raihan-rifat007/vidly)
[![forks](https://img.shields.io/github/forks/raihan-rifat007/vidly?style=flat-square&logo=github&logoColor=white&color=181717)](https://github.com/raihan-rifat007/vidly)
[![issues](https://img.shields.io/github/issues/raihan-rifat007/vidly?style=flat-square&logo=github&logoColor=white&color=181717)](https://github.com/raihan-rifat007/vidly/issues)
[![build](https://img.shields.io/github/actions/workflow/status/raihan-rifat007/vidly/npm-publish.yml?style=flat-square&logo=githubactions&logoColor=white&color=2088FF)](https://github.com/raihan-rifat007/vidly/actions)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Why vidly](#-why-vidly)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Advanced Usage](#-advanced-usage)
- [Supported Platforms](#-supported-platforms)
- [Error Handling](#-error-handling)
- [Error Codes](#-error-codes)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Connect](#-connect)

---

## 🚀 Overview

**vidly** is a lightweight, production-grade Node.js package that enables video downloads from major social media platforms with zero configuration.

Designed for developers building bots, automation pipelines, media tools, and web scrapers, vidly abstracts the complexity of platform-specific APIs into a single, consistent interface. Simply pass a URL, and vidly handles the rest — fetching metadata, selecting the best available quality, and downloading the video to your specified location.

### Key Capabilities

- **Zero Configuration** — No API keys, no tokens, no setup required
- **Consistent Interface** — Same simple API for all platforms
- **Production Ready** — Built with robust error handling and retry logic
- **Active Maintenance** — Regular updates for platform changes

---

## ✨ Why vidly?

| Challenge | vidly Solution |
|-----------|----------------|
| Platform-specific APIs | Single unified interface |
| Complex authentication | No authentication needed |
| Different response formats | Consistent output structure |
| Manual quality selection | Automatic best quality |
| No retry mechanisms | Built-in exponential backoff |
| No TypeScript support | Full JSDoc type annotations |

---

## ⚡ Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Universal Support** | TikTok, Facebook, Instagram, YouTube, Twitter/X, Pinterest, and more |
| **One-Line API** | Simple `async/await` interface with zero configuration |
| **Auto Retry** | Built-in exponential backoff retry mechanism for failed downloads |
| **Custom Output** | User-defined file paths with automatic directory creation |
| **High Quality** | Automatically selects the best available video quality |

### Technical Features

| Feature | Description |
|---------|-------------|
| **Lightweight** | Minimal dependencies for fast installation and low overhead |
| **Type Safety** | Full JSDoc annotations for intelligent editor autocompletion |
| **Error Handling** | Comprehensive error codes and descriptive error messages |
| **Auto-Update** | Dependencies update automatically via GitHub Actions |
| **ESM Support** | Compatible with CommonJS and ES Modules |
| **Stream Support** | Download videos as streams for advanced use cases |
| **Progress Tracking** | Optional progress callbacks for large downloads |

---

## 📦 Installation

### NPM

```bash
npm install vidly
```

Yarn

```bash
yarn add vidly
```

PNPM

```bash
pnpm add vidly
```

---

🎯 Quick Start

Basic Usage

```javascript
const { downloadVideo } = require('vidly');

(async () => {
  const result = await downloadVideo('https://www.tiktok.com/@user/video/123456789');
  console.log(result);
})();
```

Output

```json
{
  "title": "Amazing Video",
  "filePath": "/path/to/video.mp4",
  "size": 5242880,
  "duration": 30,
  "thumbnail": "https://example.com/thumb.jpg",
  "platform": "tiktok"
}
```

ES Module

```javascript
import { downloadVideo } from 'vidly';

const result = await downloadVideo('https://www.instagram.com/p/ABC123/');
console.log(result);
```

---

📚 API Reference

downloadVideo(url, outputPath)

Downloads a video from the given URL.

Parameter Type Required Default Description
url string ✅ Yes — Video URL to download
outputPath string ❌ No video.mp4 Destination file path

Returns: Promise<VideoResult>

```typescript
interface VideoResult {
  title: string;      // Video title
  filePath: string;   // Absolute path to downloaded file
  size: number;       // File size in bytes
  duration?: number;  // Video duration in seconds
  thumbnail?: string; // Thumbnail URL
  platform?: string;  // Platform name
}
```

VideoDownloader Class

For more granular control, use the class-based API.

Method Description
fetchMetadata() Fetches video information without downloading
download() Downloads the video using stored metadata
process() Fetches metadata and downloads in one call

Properties:

Property Type Description
metadata Object Contains title, highQuality, lowQuality
downloadUrl string The actual video URL

---

🔧 Advanced Usage

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
  console.log(`Downloaded: ${result.title}`);
} catch (error) {
  console.error(`[vidly] ${error.code}: ${error.message}`);
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

// With progress tracking
const downloadWithProgress = async (url, index) => {
  console.log(`[${index + 1}] Starting download...`);
  const result = await downloadVideo(url);
  console.log(`[${index + 1}] Complete: ${result.title}`);
  return result;
};

const results = await Promise.all(urls.map((url, i) => downloadWithProgress(url, i)));
```

Custom Directory

```javascript
const { downloadVideo } = require('vidly');
const path = require('path');

const outputDir = path.join(__dirname, 'downloads');
const result = await downloadVideo(url, path.join(outputDir, 'video.mp4'));
```

Stream Download

```javascript
const { VideoDownloader } = require('vidly');
const fs = require('fs');

const downloader = new VideoDownloader(url);
await downloader.fetchMetadata();

const response = await fetch(downloader.downloadUrl);
const fileStream = fs.createWriteStream('video.mp4');
response.body.pipe(fileStream);
```

Custom Headers

```javascript
const { VideoDownloader } = require('vidly');

const downloader = new VideoDownloader(url, './video.mp4', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  timeout: 30000
});

await downloader.process();
```

Progress Callback

```javascript
const { downloadVideo } = require('vidly');

const result = await downloadVideo(url, './video.mp4', {
  onProgress: (bytesDownloaded, totalBytes) => {
    const percent = (bytesDownloaded / totalBytes * 100).toFixed(2);
    console.log(`Downloaded: ${percent}%`);
  }
});
```

---

🌐 Supported Platforms

Platform Status Quality Notes
TikTok ✅ Full HD/4K No login required
Facebook ✅ Full HD Public videos only
Instagram ✅ Full HD Public posts only
YouTube ✅ Full 4K/8K No API key needed
Twitter/X ✅ Full HD Public tweets only
Pinterest ✅ Full HD Public pins only
Reddit 🚧 Beta HD Coming soon
LinkedIn 🚧 Beta HD Coming soon
Telegram 🚧 Beta HD Coming soon
Snapchat 🚧 Planning HD Coming soon

---

⚠️ Error Handling

Best Practices

```javascript
const { downloadVideo, VideoError } = require('vidly');

async function safeDownload(url) {
  try {
    return await downloadVideo(url);
  } catch (error) {
    if (error instanceof VideoError) {
      switch (error.code) {
        case 'E001':
          console.error('No URL provided');
          break;
        case 'E002':
          console.error('No video data found');
          break;
        case 'E003':
          console.error('No downloadable URL available');
          break;
        case 'E004':
          console.error('Download failed with HTTP error');
          break;
        default:
          console.error('Unknown error:', error.message);
      }
    }
    return null;
  }
}
```

Retry Logic (Built-in)

vidly includes automatic retry with exponential backoff:

```
Retry 1: 500ms delay
Retry 2: 1000ms delay
Retry 3: 2000ms delay
Retry 4: 4000ms delay
Retry 5: 8000ms delay
```

---

📋 Error Codes

Code Description Solution
E001 No URL provided Pass a valid URL string
E002 No video data found Check if the URL is valid and accessible
E003 No downloadable URL available Video may be private or region-locked
E004 Download failed with HTTP 4xx/5xx Check network connectivity and URL
E005 File write permission denied Check output directory permissions
E006 Unsupported platform Platform not yet supported

---

🛠️ Development

Setup

```bash
# Clone the repository
git clone https://github.com/raihan-rifat007/vidly.git
cd vidly

# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

Project Structure

```
vidly/
├── src/
│   ├── index.js           # Main entry point
│   ├── downloader.js      # Core download logic
│   ├── platforms/         # Platform-specific handlers
│   │   ├── tiktok.js
│   │   ├── facebook.js
│   │   ├── instagram.js
│   │   └── youtube.js
│   └── utils/
│       ├── retry.js       # Exponential backoff
│       └── validator.js   # URL validation
├── test.js                # Test suite
├──.gitignore            
├── package.json
└── README.md

```

Testing

```bash
# Run all tests
npm test

# Run specific platform tests
npm test -- --grep TikTok

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

Scripts

Script Description
npm test Run all tests
npm run lint Run ESLint
npm run format Format code with Prettier
npm run build Build for production
npm run update-deps Update dependencies

---

🤝 Contributing

Contributions are welcome! Please follow these steps:

How to Contribute

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing)
5. Open a Pull Request

Guidelines

· Follow the existing code style
· Add tests for new features
· Update documentation for changes
· Keep dependencies minimal
· Ensure CI passes

Reporting Issues

· Use the issue tracker
· Provide a minimal reproduction
· Include error logs and platform

---

📄 License

MIT © raihan07

---

🔗 Connect

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

<div align="center">

Built for developers, by raihan.

⭐ Star the repo if you find it useful!

</div>
