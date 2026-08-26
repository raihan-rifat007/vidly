# vidly

> Universal video downloader for Node.js — TikTok, Facebook, Instagram, YouTube, Twitter, Pinterest and more.

---

## Badges

| Badge | Status |
|-------|--------|
| npm version | [![npm version](https://img.shields.io/npm/v/vidly?style=flat-square&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/vidly) |
| npm downloads | [![npm downloads](https://img.shields.io/npm/dt/vidly?style=flat-square&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/vidly) |
| license | [![license](https://img.shields.io/npm/l/vidly?style=flat-square&logo=opensourceinitiative&logoColor=white&color=3DA639)](LICENSE) |
| node version | [![node version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen?style=flat-square&logo=node.js&logoColor=white&color=339933)](https://nodejs.org) |
| stars | [![stars](https://img.shields.io/github/stars/raihan-rifat007/vidly?style=flat-square&logo=github&logoColor=white&color=181717)](https://github.com/raihan-rifat007/vidly) |
| forks | [![forks](https://img.shields.io/github/forks/raihan-rifat007/vidly?style=flat-square&logo=github&logoColor=white&color=181717)](https://github.com/raihan-rifat007/vidly) |
| issues | [![issues](https://img.shields.io/github/issues/raihan-rifat007/vidly?style=flat-square&logo=github&logoColor=white&color=181717)](https://github.com/raihan-rifat007/vidly/issues) |
| build | [![build](https://img.shields.io/github/actions/workflow/status/raihan-rifat007/vidly/npm-publish.yml?style=flat-square&logo=githubactions&logoColor=white&color=2088FF)](https://github.com/raihan-rifat007/vidly/actions) |

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [API Reference](#api-reference)
6. [Advanced Usage](#advanced-usage)
7. [Supported Platforms](#supported-platforms)
8. [Error Handling](#error-handling)
9. [Error Codes](#error-codes)
10. [Development](#development)
11. [Contributing](#contributing)
12. [License](#license)
13. [Connect](#connect)

---

## Overview

**vidly** is a lightweight, production-grade Node.js package that enables video downloads from major social media platforms with zero configuration.

Designed for developers building automation pipelines, media tools, bots, and web scrapers, vidly abstracts platform-specific API complexity into a single, consistent interface. Pass a URL, and vidly handles metadata fetching, quality selection, and file download operations.

### Architecture Principles

- **Zero Configuration** — No API keys, tokens, or environment variables required
- **Consistent Interface** — Unified API across all supported platforms
- **Production Ready** — Comprehensive error handling with exponential backoff retry logic
- **Active Maintenance** — Regular updates for platform API changes
- **Type Safety** — Full JSDoc annotations for intelligent editor autocompletion

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Universal Platform Support** | TikTok, Facebook, Instagram, YouTube, Twitter/X, Pinterest |
| **Simplified API** | Async/await interface with zero configuration overhead |
| **Automatic Retry** | Exponential backoff retry mechanism for transient failures |
| **Custom Output Paths** | User-defined file destinations with automatic directory creation |
| **Optimal Quality Selection** | Automatic selection of highest available video quality |

### Technical Features

| Feature | Description |
|---------|-------------|
| **Minimal Dependencies** | Lightweight footprint for fast installation and low overhead |
| **JSDoc Type Safety** | Full type annotations for intelligent autocompletion |
| **Comprehensive Error Codes** | Descriptive error messages with actionable solutions |
| **Automated Dependency Updates** | GitHub Actions for dependency management |
| **ESM and CommonJS Support** | Dual module format compatibility |
| **Stream API** | Download videos as streams for advanced use cases |
| **Progress Callbacks** | Optional progress tracking for large downloads |

---

## Installation

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

Quick Start

CommonJS

```javascript
const { downloadVideo } = require('vidly');

(async () => {
  const result = await downloadVideo('https://www.tiktok.com/@user/video/123456789');
  console.log(result);
})();
```

ES Module

```javascript
import { downloadVideo } from 'vidly';

const result = await downloadVideo('https://www.instagram.com/p/ABC123/');
console.log(result);
```

Output Structure

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

---

API Reference

downloadVideo(url, outputPath)

Downloads a video from the specified URL.

Parameter Type Required Default Description
url string Yes — Video URL to download
outputPath string No video.mp4 Destination file path

Returns: Promise<VideoResult>

```typescript
interface VideoResult {
  title: string;
  filePath: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  platform?: string;
}
```

VideoDownloader Class

Provides granular control over the download process.

Method Description
fetchMetadata() Retrieves video information without downloading
download() Downloads video using stored metadata
process() Combines metadata fetch and download operations

Properties:

Property Type Description
metadata Object Contains title, highQuality, lowQuality
downloadUrl string The actual video URL

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

Error Handling Pattern

```javascript
try {
  const result = await downloadVideo(url);
  console.log(`Downloaded: ${result.title}`);
} catch (error) {
  console.error(`[vidly] ${error.code}: ${error.message}`);
}
```

Batch Download Operations

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

Batch Download with Progress Tracking

```javascript
const { downloadVideo } = require('vidly');

const urls = [
  'https://www.tiktok.com/@user/video/1',
  'https://www.facebook.com/watch?v=2',
  'https://www.instagram.com/p/3'
];

const downloadWithProgress = async (url, index) => {
  console.log(`[${index + 1}] Starting download...`);
  const result = await downloadVideo(url);
  console.log(`[${index + 1}] Complete: ${result.title}`);
  return result;
};

const results = await Promise.all(urls.map((url, i) => downloadWithProgress(url, i)));
```

Custom Directory Structure

```javascript
const { downloadVideo } = require('vidly');
const path = require('path');

const outputDir = path.join(__dirname, 'downloads');
const result = await downloadVideo(url, path.join(outputDir, 'video.mp4'));
```

Stream API

```javascript
const { VideoDownloader } = require('vidly');
const fs = require('fs');

const downloader = new VideoDownloader(url);
await downloader.fetchMetadata();

const response = await fetch(downloader.downloadUrl);
const fileStream = fs.createWriteStream('video.mp4');
response.body.pipe(fileStream);
```

Custom HTTP Headers

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

Progress Callback Integration

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

Supported Platforms

Platform Status Quality Requirements
TikTok Full Support HD/4K No authentication required
Facebook Full Support HD Public videos only
Instagram Full Support HD Public posts only
YouTube Full Support 4K/8K No API key required
Twitter/X Full Support HD Public tweets only
Pinterest Full Support HD Public pins only
Reddit In Development HD Coming soon
LinkedIn In Development HD Coming soon
Telegram In Development HD Coming soon
Snapchat In Development HD Coming soon

---

Error Handling

Recommended Implementation

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

Retry Strategy

vidly implements automatic retry with exponential backoff:

Attempt Delay
1 500ms
2 1000ms
3 2000ms
4 4000ms
5 8000ms

---

Error Codes

Code Description Resolution
E001 No URL provided Pass a valid URL string
E002 No video data found Verify URL validity and accessibility
E003 No downloadable URL available Video may be private or region-locked
E004 Download failed with HTTP 4xx/5xx Check network connectivity and URL
E005 File write permission denied Verify output directory permissions
E006 Unsupported platform Platform not yet supported

---

Development

Setup

```bash
git clone https://github.com/raihan-rifat007/vidly.git
cd vidly
npm install
npm test
npm run lint
npm run build
```

Project Structure

```
vidly/
├── scripts/
│   └── update-deps.js
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── daily-version-bump.yml
│       └── npm-publish.yml
├── index.js
├──.gitignore
├── test.js
├── README.md
├── package.json
└── LICENSE
```

Testing

```bash
npm test                      # Run all tests
npm test -- --grep TikTok     # Run specific platform tests
npm test -- --coverage        # Run with coverage
npm test -- --watch           # Watch mode
```

Scripts

Script Purpose
npm test Execute test suite
npm run lint Run ESLint
npm run format Format code with Prettier
npm run build Build for production
npm run update-deps Update dependencies

---

Contributing

Contributions are welcome and encouraged.

Process

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing)
3. Commit changes (git commit -m 'Add amazing feature')
4. Push to branch (git push origin feature/amazing)
5. Open a Pull Request

Guidelines

· Adhere to existing code style
· Include tests for new features
· Update documentation for changes
· Minimize new dependencies
· Ensure CI pipeline passes

Issue Reporting

· Use the GitHub issue tracker
· Provide minimal reproduction steps
· Include error logs and platform details

---

License

MIT © raihan07

---

Connect

Platform Link
GitHub raihan-rifat007
Facebook raihan.rifat007
LinkedIn raihan-rifat
Telegram raihan_rf
Email raihan.rifat007@gmail.com
npm raihan07

---

<div align="center">

Built for developers, by raihan.

</div>
