import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs"

// write this as a microservice instead of a hook
// see if possible to deploy to vercel
// microservice should ideally return chords of song requested

// to continue implementation of the microservice, first test locally and see if essentia provides good output
// pipe audiostream to file and load that file to essentia
// frame the audio
// detect bpm
// detect chord segments
// get all unique detected chords
// return

async function fetchYouTubeAudio(
  youtubeUrl
) {
  try {
    const info = await ytdl.getInfo(youtubeUrl);
    const audioFormat = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
    });

    if (!audioFormat) {
      throw new Error("No audio-only format found.");
    }

    // Create a readable stream from ytdl-core
    const audioStream = ytdl(youtubeUrl, { format: audioFormat });

    console.log(audioStream)

    // console.log(audioStream);

    // Use fluent-ffmpeg to convert and save the audio
    // await new Promise<void>((resolve, reject) => {
    //   ffmpeg(audioStream)
    //     .audioBitrate(128) // Example: Set audio bitrate
    //     .save(outputPath)
    //     .on("end", () => {
    //       console.log("Audio download complete!");
    //       resolve();
    //     })
    //     .on("error", (err) => {
    //       console.error("Error during audio processing:", err);
    //       reject(err);
    //     });
    // });
  } catch (error) {
    console.error("Failed to download YouTube audio:", error);
    throw error;
  }
}

fetchYouTubeAudio("https://www.youtube.com/watch?v=11Y1Ej68Das")