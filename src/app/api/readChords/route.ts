import { NextRequest, NextResponse } from "next/server";
import { downloadAudio, analyzeAudioFile } from "./utils";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract video ID from YouTube URL
    const videoId = url.includes("v=")
      ? url.split("v=")[1]?.split("&")[0]
      : url.split("/").pop()?.split("?")[0];

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    console.log(`Processing video: ${videoId}`);

    // Add timeout for Vercel limits
    const timeoutPromise = new Promise(
      (_, reject) =>
        setTimeout(
          () => reject(new Error("Processing timeout - song may be too long")),
          process.env.VERCEL ? 50000 : 300000
        ) // 50s on Vercel, 5min locally
    );

    const processingPromise = async () => {
      // Step 1: Download audio from YouTube
      console.log("Downloading audio...");
      await downloadAudio(url, videoId);

      // Step 2: Analyze audio file (decode, extract features, detect chords and key)
      console.log("Analyzing audio...");
      const result = await analyzeAudioFile(`${videoId}.mp4`);
      return result;
    };

    const result = (await Promise.race([
      processingPromise(),
      timeoutPromise,
    ])) as {
      chords: string[];
      strength: number[];
      key: string;
      scale: string;
      keyStrength: number;
    };

    return NextResponse.json({
      success: true,
      chords: result.chords,
      strengths: result.strength,
      key: result.key,
      scale: result.scale,
      keyStrength: result.keyStrength,
      message: "Audio processed successfully",
    });
  } catch (error) {
    console.error("Error processing audio:", error);

    const errorMessage = (error as Error).message;
    const isTimeout = errorMessage.includes("timeout");

    return NextResponse.json(
      {
        error: "Failed to process audio",
        details: errorMessage,
        suggestion: isTimeout
          ? "Try a shorter audio clip or use a different approach for long songs"
          : undefined,
      },
      { status: isTimeout ? 408 : 500 }
    );
  }
}
