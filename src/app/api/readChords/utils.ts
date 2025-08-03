import ytdl from "@distube/ytdl-core";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import type {
  EssentiaClass,
  ChordDetectionResult,
  KeyDetectionResult,
  SpectrumResult,
  HPCPResult,
  EssentiaOutput,
} from "../../../types/essentia";

const CHORD_STRENGTH_THRESHOLD = 0.75;

// Import essentia.js with proper typing
const essentiaJS = require("essentia.js") as {
  EssentiaWASM: any;
  Essentia: typeof EssentiaClass;
  EssentiaModel: any;
  EssentiaExtractor: any;
  EssentiaPlot: any;
};

const { EssentiaWASM, Essentia, EssentiaExtractor, EssentiaModel } = essentiaJS;

// Configure ffmpeg path - use ffmpeg-static for all environments
try {
  const path = require("path");
  const fs = require("fs");

  let ffmpegPath: string;

  try {
    const ffmpegStatic = require("ffmpeg-static");
    console.log("Raw ffmpeg-static path:", JSON.stringify(ffmpegStatic));

    // Check if the path looks invalid (starts with \ROOT\ or similar)
    if (
      !ffmpegStatic ||
      ffmpegStatic.includes("\\ROOT\\") ||
      ffmpegStatic.includes("/ROOT/")
    ) {
      throw new Error(`ffmpeg-static returned invalid path: ${ffmpegStatic}`);
    }

    ffmpegPath = ffmpegStatic;
  } catch (pathError) {
    console.warn(
      "ffmpeg-static path issue, trying manual resolution:",
      (pathError as Error).message
    );

    // Fallback: manually construct the path
    const possiblePaths = [
      path.join(__dirname, "../../../node_modules/ffmpeg-static/ffmpeg.exe"),
      path.join(process.cwd(), "node_modules/ffmpeg-static/ffmpeg.exe"),
      path.resolve("node_modules/ffmpeg-static/ffmpeg.exe"),
    ];

    const foundPath = possiblePaths.find((p) => {
      console.log("Trying path:", p);
      return fs.existsSync(p);
    });

    if (!foundPath) {
      throw new Error(
        `Could not find ffmpeg binary in any of these locations: ${possiblePaths.join(
          ", "
        )}`
      );
    }

    ffmpegPath = foundPath;
  }

  // Verify the final path exists
  if (!fs.existsSync(ffmpegPath)) {
    throw new Error(`ffmpeg binary not found at: ${ffmpegPath}`);
  }

  ffmpeg.setFfmpegPath(ffmpegPath);
  console.log("Successfully configured ffmpeg at:", ffmpegPath);
} catch (error) {
  console.error("Failed to configure ffmpeg:", error);
  throw new Error(
    `ffmpeg configuration failed: ${
      (error as Error).message
    }. Try reinstalling: npm uninstall ffmpeg-static && npm install ffmpeg-static`
  );
}

// Use /tmp directory for Vercel compatibility (serverless functions have read-only filesystem except /tmp)
const tempDir = process.env.VERCEL ? "/tmp" : "temp";

// Create essentia instance
let essentia: EssentiaClass | null = null;

// Initialize essentia instance
const initEssentia = (): EssentiaClass => {
  if (!essentia) {
    console.log("Initializing new Essentia instance...");
    console.log("EssentiaWASM type:", typeof EssentiaWASM);
    console.log("Essentia constructor type:", typeof Essentia);

    essentia = new Essentia(EssentiaWASM);

    console.log("Essentia instance created:", typeof essentia);
    console.log(
      "Essentia version:",
      essentia.version || "version not available"
    );
    console.log(
      "Algorithm names:",
      essentia.algorithmNames || "algorithm names not available"
    );

    // Check what's actually on the instance
    const methods = Object.getOwnPropertyNames(essentia);
    console.log("Total methods on essentia instance:", methods.length);

    // Look for any music analysis methods
    const musicMethods = methods.filter(
      (name) =>
        name.toLowerCase().includes("chord") ||
        name.toLowerCase().includes("key") ||
        name.toLowerCase().includes("harmony") ||
        name.toLowerCase().includes("detect")
    );
    console.log("Music analysis methods found:", musicMethods);
  }
  return essentia!;
};

export const downloadAudio = async (url: string, id: string): Promise<void> => {
  const filePath = `${tempDir}/${id}.mp4`;

  return new Promise((resolve, reject) => {
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
    const writeStream = fs.createWriteStream(filePath);

    stream.pipe(writeStream);

    writeStream.on("finish", () => {
      console.log(`Audio downloaded: ${filePath}`);
      resolve();
    });

    writeStream.on("error", (error) => {
      console.error("Download error:", error);
      reject(error);
    });

    stream.on("error", (error) => {
      console.error("Stream error:", error);
      reject(error);
    });
  });
};

export const decodeAudioToFloat32 = async (
  inputFile: string,
  outputFile: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .audioChannels(1) // Convert to mono
      .audioFrequency(44100) // Set sample rate to 44.1kHz
      .audioCodec("pcm_f32le") // Convert to 32-bit float PCM
      .format("f32le") // Raw format
      .output(outputFile)
      .on("end", () => {
        console.log(`Successfully decoded ${inputFile} to ${outputFile}`);
        resolve();
      })
      .on("error", (err) => {
        console.error("Error decoding audio:", err);

        // Provide helpful error message for missing ffmpeg
        if (err.message.includes("spawn") && err.message.includes("ENOENT")) {
          reject(
            new Error(
              "Cannot find ffmpeg. ffmpeg-static may not be properly installed. Please install it with: npm install ffmpeg-static"
            )
          );
        } else {
          reject(err);
        }
      })
      .run();
  });
};

export const loadAudioFromFile = (filename: string): Float32Array => {
  try {
    const audioBuffer = fs.readFileSync(filename);
    // Convert buffer to Float32Array (assuming 32-bit float PCM)
    const float32Array = new Float32Array(
      audioBuffer.buffer,
      audioBuffer.byteOffset,
      audioBuffer.byteLength / 4
    );
    return float32Array;
  } catch (error) {
    console.error("Error loading audio file:", error);
    throw new Error("Failed to load audio file");
  }
};

export const computeHPCP = (signal: Float32Array): number[][] => {
  const essentiaInstance = initEssentia();

  // Parameters for spectral analysis
  const frameSize = 2048;
  const hopSize = 1024;
  const sampleRate = 44100;

  const hpcpFrames: number[][] = [];

  // Process in frames
  for (let i = 0; i < signal.length - frameSize; i += hopSize) {
    // Extract frame
    const frame = signal.slice(i, i + frameSize);
    const frameVector = essentiaInstance.arrayToVector(frame);

    // Apply window
    const windowedFrame: EssentiaOutput = essentiaInstance.Windowing(
      frameVector,
      "hann",
      frameSize
    );

    // Compute spectrum
    const spectrum: SpectrumResult = essentiaInstance.Spectrum(
      windowedFrame.frame
    );

    // Compute spectral peaks
    const peaks: EssentiaOutput = essentiaInstance.SpectralPeaks(
      spectrum.spectrum
    );

    // Compute HPCP
    const hpcp: HPCPResult = essentiaInstance.HPCP(
      peaks.frequencies,
      peaks.magnitudes
    );

    // Convert to JS array and add to frames
    const hpcpArray = essentiaInstance.vectorToArray(hpcp.hpcp);
    hpcpFrames.push(Array.from(hpcpArray));
  }

  return hpcpFrames;
};

// Helper function to filter chords by strength and get unique values
const filterChordsByStrength = (
  chords: string[],
  strengths: number[],
  threshold: number = CHORD_STRENGTH_THRESHOLD,
  bpm?: number
): { chords: string[]; strength: number[]; bpm?: number } => {
  console.log("Applying strength filtering with threshold:", threshold);
  console.log("Total detections before filtering:", chords.length);

  // Create paired array of chord-strength pairs
  const pairedResults = chords.map((chord, index) => ({
    chord,
    strength: strengths[index] || 0,
  }));

  // Filter by strength threshold
  const filteredPairs = pairedResults.filter(
    (pair) => pair.strength >= threshold
  );
  console.log("Detections after strength filtering:", filteredPairs.length);

  // Extract filtered chords and get unique values
  const filteredChords = filteredPairs.map((pair) => pair.chord);
  const uniqueChords = Array.from(new Set(filteredChords));

  // Keep corresponding strengths for unique chords (highest strength for each chord)
  const uniqueStrengths = uniqueChords.map((chord) => {
    const matchingPairs = filteredPairs.filter((p) => p.chord === chord);
    return Math.max(...matchingPairs.map((p) => p.strength));
  });

  console.log("Final unique chords after filtering:", uniqueChords);
  console.log("Corresponding strengths:", uniqueStrengths);

  return {
    chords: uniqueChords,
    strength: uniqueStrengths,
    bpm,
  };
};

// Helper function to detect beats and estimate BPM using Essentia
const detectBeatsAndBPM = (
  audioData: Float32Array
): { beats: number[]; bpm: number } => {
  const essentiaInstance = initEssentia();

  try {
    console.log("Detecting beats from audio data...");
    console.log("Audio data length:", audioData.length);
    console.log("Audio data type:", audioData.constructor.name);
    console.log("Sample audio values:", audioData.slice(0, 10));
    console.log(
      "Audio data range:",
      Math.min(...audioData.slice(0, 1000)),
      "to",
      Math.max(...audioData.slice(0, 1000))
    );

    // Convert Float32Array to regular JavaScript array (OnsetDetectionGlobal expects number[])
    const audioArray = Array.from(audioData);
    const sampleRate = 44100; // Standard sample rate

    console.log("Converted to array, length:", audioArray.length);
    console.log("Array sample values:", audioArray.slice(0, 10));

    try {
      // Step 1: Detect onsets using OnsetDetectionGlobal with proper parameters
      console.log("Running OnsetDetectionGlobal with sampleRate:", sampleRate);
      const onsetResult = essentiaInstance.OnsetDetectionGlobal(
        audioArray,
        "complex", // method: complex, energy, hfc, flux, etc.
        sampleRate
      );

      const onsets = onsetResult.onsets || [];
      console.log(
        "OnsetDetectionGlobal detected",
        onsets.length,
        "onset points"
      );

      // If no onsets detected, try different methods
      if (onsets.length === 0) {
        console.log("Trying different onset detection methods...");

        const methods = ["hfc", "energy", "flux", "melflux"];
        for (const method of methods) {
          try {
            console.log(`Trying '${method}' method for onset detection...`);
            const methodResult = essentiaInstance.OnsetDetectionGlobal(
              audioArray,
              method,
              sampleRate
            );
            if (methodResult.onsets && methodResult.onsets.length > 0) {
              onsets.push(...methodResult.onsets);
              console.log(
                `${method} method detected`,
                methodResult.onsets.length,
                "onsets"
              );
              break; // Stop after first successful method
            }
          } catch (methodError) {
            console.warn(`Method '${method}' failed:`);
          }
        }

        // If still no onsets, try a spectrum-based approach
        if (onsets.length === 0) {
          console.log("Trying manual spectrum-based onset detection...");
          try {
            // Window the signal and compute spectrum for onset detection
            const windowSize = 2048;
            const hopSize = 512;
            const detectedOnsets = [];

            for (let i = 0; i < audioArray.length - windowSize; i += hopSize) {
              const frame = audioArray.slice(i, i + windowSize);
              const frameVector = essentiaInstance.arrayToVector(
                new Float32Array(frame)
              );

              // Apply windowing
              const windowedFrame = essentiaInstance.Windowing(frameVector);

              // Compute spectrum
              const spectrumResult = essentiaInstance.Spectrum(
                windowedFrame.frame
              );

              // Use spectral flux for onset detection
              if (
                spectrumResult.spectrum &&
                spectrumResult.spectrum.length > 0
              ) {
                // Simple energy-based onset detection
                const energy = spectrumResult.spectrum.reduce(
                  (sum, val) => sum + val * val,
                  0
                );

                // This is a very basic onset detection - you might want to improve this
                if (energy > 0.1) {
                  // Threshold - may need tuning
                  detectedOnsets.push(i / sampleRate); // Convert to time in seconds
                }
              }
            }

            console.log(
              "Manual onset detection found",
              detectedOnsets.length,
              "potential onsets"
            );
            onsets.push(...detectedOnsets);
          } catch (manualError) {
            console.warn("Manual onset detection failed:");
          }
        }
      }

      // Step 2: Use BeatTrackerDegara to refine beat positions if we have onsets
      let beats = onsets;
      if (onsets.length > 0) {
        try {
          console.log(
            "Running BeatTrackerDegara on",
            onsets.length,
            "onsets..."
          );
          const beatResult = essentiaInstance.BeatTrackerDegara(
            onsets,
            sampleRate
          );
          beats = beatResult.ticks || onsets; // Use refined beats or fall back to onsets
          console.log(
            "BeatTrackerDegara refined to",
            beats.length,
            "beat positions"
          );
        } catch (beatTrackerError) {
          console.warn("BeatTrackerDegara failed, using raw onsets:");
          beats = onsets;
        }
      }

      // Step 3: Estimate BPM from beat intervals
      let bpm = 120; // Default BPM
      if (beats.length > 1) {
        const intervals = [];
        for (let i = 1; i < beats.length; i++) {
          intervals.push(beats[i] - beats[i - 1]);
        }

        // Calculate median interval (more robust than average)
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)];

        if (medianInterval > 0) {
          bpm = 60 / medianInterval; // Convert interval in seconds to BPM

          // Ensure BPM is within reasonable range
          if (bpm < 60 || bpm > 200) {
            // Try doubling or halving if out of range
            if (bpm < 60) bpm *= 2;
            if (bpm > 200) bpm /= 2;
            if (bpm < 60 || bpm > 200) bpm = 120; // Final fallback
          }

          console.log("Estimated BPM from median beat interval:", bpm);
        }
      } else {
        console.log("Insufficient beats detected, using default BPM:", bpm);
      }

      return { beats, bpm };
    } catch (onsetError) {
      console.warn("Onset detection failed:");

      // Fallback: Try to generate synthetic beats based on default BPM
      const defaultBPM = 120;
      const beatInterval = 60 / defaultBPM; // seconds per beat
      const duration = audioData.length / 44100; // total duration in seconds
      const syntheticBeats = [];

      for (let time = 0; time < duration; time += beatInterval) {
        syntheticBeats.push(time);
      }

      console.log(
        "Generated",
        syntheticBeats.length,
        "synthetic beats for fallback"
      );
      return { beats: syntheticBeats, bpm: defaultBPM };
    }
  } catch (error) {
    console.warn("Beat detection failed completely, using defaults:", error);
    return { beats: [], bpm: 120 };
  }
};

export const detectChords = (
  hpcpFrames: number[][],
  audioData?: Float32Array
): { chords: string[]; strength: number[]; bpm?: number } => {
  const essentiaInstance = initEssentia();

  try {
    // Detect beats and BPM if audio data is provided
    let detectedBPM = 120; // Default BPM
    let beatTicks: number[] = [];
    if (audioData) {
      const beatResult = detectBeatsAndBPM(audioData);
      detectedBPM = beatResult.bpm;
      beatTicks = beatResult.beats;
    } else {
      console.log("No audio data provided, using default BPM:", detectedBPM);
    }

    // Validate HPCP frame format
    if (!hpcpFrames.length) {
      throw new Error("No HPCP frames to process");
    }

    if (!hpcpFrames[0] || !Array.isArray(hpcpFrames[0])) {
      throw new Error("Invalid HPCP frame format - frames must be arrays");
    }

    // Ensure all frames have numbers
    const hasValidData = hpcpFrames.every(
      (frame) =>
        Array.isArray(frame) &&
        frame.every((val) => typeof val === "number" && !isNaN(val))
    );

    if (!hasValidData) {
      throw new Error(
        "HPCP frames contain invalid data (NaN or non-numeric values)"
      );
    }

    console.log("HPCP validation passed");

    // Analyze HPCP data quality for chord detection
    console.log("Analyzing HPCP data quality...");
    const frameEnergies = hpcpFrames.map((frame) =>
      frame.reduce((sum, val) => sum + val, 0)
    );
    const avgEnergy =
      frameEnergies.reduce((sum, val) => sum + val, 0) / frameEnergies.length;
    const maxEnergy = Math.max(...frameEnergies);
    const minEnergy = Math.min(...frameEnergies);

    console.log("HPCP energy stats:", {
      avgEnergy: avgEnergy.toFixed(4),
      maxEnergy: maxEnergy.toFixed(4),
      minEnergy: minEnergy.toFixed(4),
      energyRange: (maxEnergy - minEnergy).toFixed(4),
    });

    // Check for frames with significant harmonic content
    const significantFrames = frameEnergies.filter(
      (energy) => energy > avgEnergy * CHORD_STRENGTH_THRESHOLD
    ).length;
    console.log(
      "Frames with significant content:",
      significantFrames,
      "/",
      hpcpFrames.length
    );

    // Analyze peak distribution in first few frames
    for (let i = 0; i < Math.min(3, hpcpFrames.length); i++) {
      const frame = hpcpFrames[i];
      const maxVal = Math.max(...frame);
      const peakIndices = frame
        .map((val, idx) => ({ val, idx }))
        .filter((item) => item.val > maxVal * 0.3)
        .sort((a, b) => b.val - a.val)
        .slice(0, 3);
      console.log(
        `Frame ${i} peaks:`,
        peakIndices.map((p) => `${p.idx}:${p.val.toFixed(3)}`)
      );
    }

    // Based on research: ChordsDetection expects pcp (vector_vector_real)
    // We need to create a proper VectorVectorFloat structure for WASM

    // Normalize HPCP frames for better chord detection
    console.log("Normalizing HPCP frames...");
    const normalizedFrames = hpcpFrames.map((frame) => {
      const frameSum = frame.reduce((sum, val) => sum + val, 0);
      if (frameSum > 0) {
        return frame.map((val) => val / frameSum);
      } else {
        return frame; // Keep zero frames as is
      }
    });

    console.log("Creating proper VectorVectorFloat structure...");
    try {
      // Step 1: Create VectorVector using WASM module's vector creation
      // Check if essentia has VectorVector constructor
      console.log("Checking for VectorVector constructor...");

      if (
        essentiaInstance.module &&
        essentiaInstance.module.VectorVectorFloat
      ) {
        console.log("Found VectorVectorFloat constructor");
        const vectorVector = new essentiaInstance.module.VectorVectorFloat();

        // Add each normalized HPCP frame as a vector
        for (const frame of normalizedFrames) {
          const frameVector = essentiaInstance.arrayToVector(
            new Float32Array(frame)
          );
          vectorVector.push_back(frameVector);
        }

        console.log(
          "Created VectorVectorFloat with",
          vectorVector.size(),
          "frames"
        );
        // Try with BPM-synchronized chord detection
        const hopSize = 1024;
        const sampleRate = 44100;

        // Try ChordsDetectionBeats first (beat-synchronized) if we have beat ticks
        let result: ChordDetectionResult;
        if (beatTicks.length > 0) {
          console.log("Calling ChordsDetectionBeats with parameters:", {
            hopSize,
            sampleRate,
            beatTicksCount: beatTicks.length,
            bpm: detectedBPM,
          });

          try {
            result = essentiaInstance.ChordsDetectionBeats(
              vectorVector,
              beatTicks,
              "nnls", // chromaPick method
              hopSize,
              sampleRate
            );
            console.log("ChordsDetectionBeats succeeded!");
          } catch (beatsError) {
            console.warn(
              "ChordsDetectionBeats failed, falling back to ChordsDetection:",
              beatsError
            );
            result = essentiaInstance.ChordsDetection(
              vectorVector,
              hopSize,
              sampleRate,
              2.0 // windowSize
            );
            console.log("ChordsDetection fallback succeeded!");
          }
        } else {
          console.log(
            "No beat ticks available, using standard ChordsDetection"
          );
          console.log("Calling ChordsDetection with parameters:", {
            hopSize,
            sampleRate,
            windowSize: 2.0,
          });

          result = essentiaInstance.ChordsDetection(
            vectorVector,
            hopSize,
            sampleRate,
            2.0 // windowSize
          );
          console.log("ChordsDetection succeeded!");
        }

        console.log("VectorVectorFloat approach succeeded!");
        console.log("Raw result:", result);
        console.log("Result type:", typeof result);
        console.log("Result keys:", Object.keys(result));
        console.log(
          "Chords type:",
          typeof result.chords,
          "Length:",
          result.chords?.length
        );
        console.log(
          "Strength type:",
          typeof result.strength,
          "Length:",
          result.strength?.length
        );

        // Debug: check if result has the expected structure
        if (result.chords && Array.isArray(result.chords)) {
          console.log("First few chords:", result.chords.slice(0, 10));
        } else if (result.chords) {
          console.log("Chords not array, trying conversion...");
          // Try to convert WASM vector to JS array if needed
          try {
            if (typeof (result.chords as any).size === "function") {
              const chordsArray = [];
              for (let i = 0; i < (result.chords as any).size(); i++) {
                chordsArray.push((result.chords as any).get(i));
              }
              console.log("Converted chords:", chordsArray.slice(0, 10));
              result.chords = chordsArray;
            } else if (essentiaInstance.vectorToArray && result.chords) {
              const arrayResult = essentiaInstance.vectorToArray(
                result.chords as any
              );
              result.chords = Array.from(arrayResult).map(String); // Convert to strings
              console.log(
                "Converted chords via vectorToArray:",
                result.chords.slice(0, 10)
              );
            }
          } catch (conversionError) {
            console.warn("Could not convert chords:", conversionError);
          }
        }

        if (result.strength && Array.isArray(result.strength)) {
          console.log("First few strengths:", result.strength.slice(0, 10));
        } else if (result.strength) {
          console.log("Strength not array, trying conversion...");
          try {
            if (typeof (result.strength as any).size === "function") {
              const strengthArray = [];
              for (let i = 0; i < (result.strength as any).size(); i++) {
                strengthArray.push((result.strength as any).get(i));
              }
              console.log("Converted strength:", strengthArray.slice(0, 10));
              result.strength = strengthArray;
            } else if (essentiaInstance.vectorToArray && result.strength) {
              result.strength = Array.from(
                essentiaInstance.vectorToArray(result.strength as any)
              );
              console.log(
                "Converted strength via vectorToArray:",
                result.strength.slice(0, 10)
              );
            }
          } catch (conversionError) {
            console.warn("Could not convert strength:", conversionError);
          }
        }

        // Filter chords by strength threshold and get unique values
        return filterChordsByStrength(
          result.chords || [],
          result.strength || [],
          CHORD_STRENGTH_THRESHOLD, // threshold
          detectedBPM
        );
      }
    } catch (vectorVectorError) {
      console.warn(
        "VectorVectorFloat approach failed:",
        (vectorVectorError as Error).message
      );
    }
    throw new Error("No chord detection methods found.");
  } catch (error) {
    console.error("Chord detection failed:", error);
    console.error("Error details:", (error as Error).message);
    console.error(
      "HPCP frames format:",
      typeof hpcpFrames,
      Array.isArray(hpcpFrames)
    );
    console.error(
      "First frame format:",
      typeof hpcpFrames[0],
      Array.isArray(hpcpFrames[0])
    );

    // Don't use fallback - throw the error so we can debug properly
    throw new Error(`ChordsDetection failed: ${(error as Error).message}`);
  }
};

export const analyzeAudioFile = async (
  filename: string
): Promise<{
  chords: string[];
  strength: number[];
  bpm?: number;
}> => {
  try {
    // Step 1: Decode MP4 to float32 PCM
    const pcmFile = filename.replace(".mp4", ".pcm");
    const inputPath = `${tempDir}/${filename}`;
    const outputPath = `${tempDir}/${pcmFile}`;

    await decodeAudioToFloat32(inputPath, outputPath);

    // Step 2: Load audio as Float32Array
    const audioData = loadAudioFromFile(outputPath);

    // Step 3: Compute HPCP features
    console.log("Computing HPCP features...");
    const hpcpFrames = computeHPCP(audioData);

    // Step 4: Detect chords with BPM detection
    console.log("Detecting chords with BPM analysis...");
    const chordResult = detectChords(hpcpFrames, audioData);

    // Cleanup temporary PCM file
    try {
      fs.unlinkSync(outputPath);
    } catch (e) {
      console.warn("Could not delete temporary PCM file:", e);
    }

    return {
      chords: chordResult.chords,
      strength: chordResult.strength,
      bpm: chordResult.bpm,
    };
  } catch (error) {
    console.error("Error analyzing audio file:", error);
    throw error;
  }
};
