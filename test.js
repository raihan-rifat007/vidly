const { downloadVideo, downloadAudio, getInfo, searchMusic } = require("./index");

async function test() {
  try {
    console.log("Testing vidly with untube...\n");

    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

    const info = await getInfo(url);
    console.log("Metadata:");
    console.log("  Title:", info.title);
    console.log("  Channel:", info.channel);
    console.log("  Duration:", info.duration, "seconds");
    console.log("  Views:", info.views);
    console.log("");

    const videoResult = await downloadVideo(url, "./test_video.mp4", {
      quality: "highest",
      progress: true
    });
    console.log("Video downloaded:", videoResult.filePath, "\n");

    const audioResult = await downloadAudio(url, "./test_audio.mp3", {
      format: "mp3",
      progress: true
    });
    console.log("Audio downloaded:", audioResult.filePath, "\n");

    const searchResults = await searchMusic("never gonna give you up");
    console.log("Search results:");
    searchResults.slice(0, 3).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} - ${r.artist}`);
    });

    console.log("\n All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

test();

