# vidly

> Universal video downloader for Node.js — TikTok, Facebook, Instagram, YouTube, Twitter, Pinterest and more.

[![npm version](https://img.shields.io/npm/v/vidly?style=flat-square)](https://www.npmjs.com/package/vidly)
[![npm downloads](https://img.shields.io/npm/dt/vidly?style=flat-square)](https://www.npmjs.com/package/vidly)
[![license](https://img.shields.io/npm/l/vidly?style=flat-square)](LICENSE)
[![node version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen?style=flat-square)](https://nodejs.org)
[![stars](https://img.shields.io/github/stars/raihan-rifat007/vidly?style=flat-square)](https://github.com/raihan-rifat007/vidly)
[![forks](https://img.shields.io/github/forks/raihan-rifat007/vidly?style=flat-square)](https://github.com/raihan-rifat007/vidly)

## Overview

vidly is a lightweight, production-grade Node.js package that enables video downloads from major social media platforms with zero configuration.

Designed for developers building bots, automation pipelines, media tools, and web scrapers, vidly abstracts the complexity of platform-specific APIs into a single, consistent interface.

## Features

```

▸ Universal Support    → TikTok, Facebook, Instagram, YouTube
▸ One Line API         → Async/await with zero configuration
▸ Auto Retry           → Built-in retry with exponential backoff
▸ Custom Output        → User-defined file paths
▸ High Quality         → Automatically selects best available
▸ Lightweight          → Minimal dependencies
▸ Type Safety          → Full JSDoc annotations

```

## Installation

```bash
npm install vidly
```

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

API Reference

downloadVideo(url, outputPath)

Parameter Type Required Default Description
url string Yes — Video URL to download
outputPath string No video.mp4 Destination file path

Returns: Promise<VideoResult>

```typescript
interface VideoResult {
  title: string;    // Video title
  filePath: string; // Absolute path to file
  size: number;     // File size in bytes
}
```

Advanced Usage

Class-Based Approach

```javascript
const { VideoDownloader } = require('vidly');

const downloader = new VideoDownloader(
  'https://www.instagram.com/p/ABC123/',
  './custom/output.mp4'
);

await downloader.fetchMetadata();
await downloader.download();

console.log(downloader.metadata.title);
```

Error Handling

```javascript
try {
  const result = await downloadVideo(url);
} catch (error) {
  console.error(`[vidly] ${error.message}`);
}
```

Supported Platforms

Platform Status
TikTok ✓
Facebook ✓
Instagram ✓
YouTube ✓
Twitter/X ✓
Pinterest ✓

Error Codes

Code Description
E001 No URL provided
E002 No video data found
E003 No downloadable URL available
E004 Download failed (HTTP 4xx/5xx)

Development

```bash
git clone https://github.com/raihan-rifat007/vidly.git
cd vidly
npm install
npm test
```

Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

License

MIT © raihan07

Connect

GitHub  : https://github.com/raihan-rifat007
npm     : https://www.npmjs.com/~raihan07
Issues  : https://github.com/raihan-rifat007/vidly/issues
Email   : raihan.rifat007@gmail.com

---

Built for developers, by raihan.
