/**
 * TypeScript declarations for essentia.js
 * Based on essentia.js v0.1.3
 * https://mtg.github.io/essentia.js/
 */

// Main module structure
declare module "essentia.js" {
  export const EssentiaWASM: any;
  export const Essentia: typeof EssentiaClass;
  export const EssentiaModel: any;
  export const EssentiaExtractor: any;
  export const EssentiaPlot: any;

  const essentiaExports: {
    EssentiaWASM: any;
    Essentia: typeof EssentiaClass;
    EssentiaModel: any;
    EssentiaExtractor: any;
    EssentiaPlot: any;
  };
  export = essentiaExports;
}

// WASM backend types
export interface EssentiaWASM {
  EssentiaJS: new (isDebug?: boolean) => any;
  [key: string]: any;
}

// Input/Output types for algorithms
export interface EssentiaInput {
  frame?: number[];
  spectrum?: number[];
  pcp?: number[][];
  signal?: number[];
  [key: string]: any;
}

export interface EssentiaOutput {
  [key: string]: any;
}

// Specific result interfaces
export interface ChordDetectionResult {
  chords: string[];
  strength: number[];
}

export interface KeyDetectionResult {
  key: string;
  scale: string;
  strength: number;
}

export interface SpectrumResult {
  spectrum: number[];
}

export interface PitchResult {
  pitch: number;
  pitchConfidence: number;
}

export interface BeatResult {
  ticks: number[];
}

export interface OnsetResult {
  onsets: number[];
}

export interface HPCPResult {
  hpcp: number[];
}

// Vector types used by Essentia
export interface VectorFloat extends Array<number> {}
export interface VectorString extends Array<string> {}
export interface VectorVectorFloat extends Array<Array<number>> {}

/**
 * Main Essentia class
 */
export class EssentiaClass {
  EssentiaWASM: any;
  isDebug: boolean;
  private algorithms: any;
  module: any;
  version: string;
  algorithmNames: string;

  /**
   * Constructor
   * @param EssentiaWASM - Essentia WASM backend
   * @param isDebug - Enable debug mode
   */
  constructor(EssentiaWASM: any, isDebug?: boolean);

  // Utility methods
  getAudioBufferFromURL(
    audioURL: string,
    webAudioCtx: AudioContext
  ): Promise<AudioBuffer>;
  getAudioChannelDataFromURL(
    audioURL: string,
    webAudioCtx: AudioContext,
    channel?: number
  ): Promise<Float32Array>;
  audioBufferToMonoSignal(buffer: AudioBuffer): Float32Array;
  shutdown(): void;
  reinstantiate(): void;
  delete(): void;
  arrayToVector(inputArray: Float32Array): any;
  vectorToArray(inputVector: any): Float32Array;

  // Core Audio Processing Algorithms
  Windowing(
    frame: number[],
    type?: string,
    size?: number,
    zeroPadding?: number,
    zeroPhase?: boolean,
    normalized?: boolean
  ): EssentiaOutput;
  Spectrum(frame: number[], size?: number): SpectrumResult;
  SpectralPeaks(
    spectrum: number[],
    magnitudeThreshold?: number,
    minFrequency?: number,
    maxFrequency?: number,
    maxPeaks?: number,
    sampleRate?: number
  ): EssentiaOutput;
  FFT(frame: number[], size?: number): EssentiaOutput;
  IFFT(fft: any, size?: number): EssentiaOutput;

  // Pitch and Harmony
  PitchYin(
    signal: number[],
    frameSize?: number,
    sampleRate?: number
  ): PitchResult;
  PitchYinFFT(
    spectrum: number[],
    frameSize?: number,
    sampleRate?: number
  ): PitchResult;
  MultiPitchMelodia(
    signal: number[],
    binResolution?: number,
    filterIterations?: number,
    frameSize?: number,
    guessUnvoiced?: boolean,
    harmonicWeight?: number,
    hopSize?: number,
    magnitudeCompression?: number,
    magnitudeThreshold?: number,
    maxFrequency?: number,
    minFrequency?: number,
    numberHarmonics?: number,
    peakDistributionThreshold?: number,
    peakFrameThreshold?: number,
    pitchContinuity?: number,
    referenceFrequency?: number,
    sampleRate?: number,
    timeContinuity?: number
  ): EssentiaOutput;

  // Chord Detection Algorithms
  ChordsDetection(
    pcp: number[][],
    hopSize?: number,
    sampleRate?: number,
    windowSize?: number
  ): ChordDetectionResult;
  ChordsDetectionBeats(
    pcp: number[][],
    ticks: number[],
    chromaPick?: string,
    hopSize?: number,
    sampleRate?: number
  ): ChordDetectionResult;
  ChordsDescriptors(
    chords: string[],
    key?: string,
    scale?: string
  ): EssentiaOutput;

  // Key Detection
  Key(
    pcp: number[],
    pcpSize?: number,
    profileType?: string,
    slope?: number,
    usePolyphony?: boolean,
    useThreeChords?: boolean
  ): KeyDetectionResult;

  // HPCP (Harmonic Pitch Class Profile)
  HPCP(
    frequencies: number[],
    magnitudes: number[],
    size?: number,
    referenceFrequency?: number,
    harmonics?: number,
    bandPreset?: boolean,
    minFrequency?: number,
    maxFrequency?: number,
    bandSplitFrequency?: number,
    weightType?: string,
    nonLinear?: boolean,
    windowSize?: number,
    sampleRate?: number
  ): HPCPResult;

  // Rhythm and Tempo
  BeatTracker(beats: number[], bpm: number, sampleRate?: number): BeatResult;
  BeatTrackerDegara(onset: number[], sampleRate?: number): BeatResult;
  BeatTrackerMultiFeature(beats: number[], sampleRate?: number): BeatResult;
  TempoTap(
    featuresFrame: number[],
    frameHop?: number,
    hopSize?: number,
    sampleRate?: number
  ): EssentiaOutput;
  TempoScaleBands(
    bands: number[],
    bandsGain?: number[],
    frameTime?: number
  ): EssentiaOutput;

  // Onset Detection
  OnsetDetection(
    spectrum: number[],
    phase: number[],
    method?: string,
    sampleRate?: number
  ): EssentiaOutput;
  OnsetDetectionGlobal(
    signal: number[],
    method?: string,
    sampleRate?: number
  ): OnsetResult;
  Onsets(
    detections: number[],
    alpha?: number,
    delay?: number,
    frameRate?: number,
    silenceThreshold?: number
  ): OnsetResult;

  // Spectral Features
  SpectralCentroid(spectrum: number[]): EssentiaOutput;
  SpectralRolloff(
    spectrum: number[],
    cutoff?: number,
    sampleRate?: number
  ): EssentiaOutput;
  SpectralFlux(spectrum: number[], rectify?: boolean): EssentiaOutput;
  SpectralComplexity(
    spectrum: number[],
    magnitudeThreshold?: number,
    sampleRate?: number
  ): EssentiaOutput;
  SpectralContrast(
    spectrum: number[],
    frameSize?: number,
    sampleRate?: number,
    staticDistribution?: number
  ): EssentiaOutput;
  SpectralWhitening(
    spectrum: number[],
    maxFrequency?: number,
    sampleRate?: number
  ): EssentiaOutput;

  // Audio Features
  ZeroCrossingRate(signal: number[], threshold?: number): EssentiaOutput;
  Energy(signal: number[]): EssentiaOutput;
  RMS(signal: number[]): EssentiaOutput;
  PowerSpectrum(signal: number[], size?: number): EssentiaOutput;
  InstantPower(signal: number[]): EssentiaOutput;

  // Tonal Features
  Inharmonicity(frequencies: number[], magnitudes: number[]): EssentiaOutput;
  Tristimulus(frequencies: number[], magnitudes: number[]): EssentiaOutput;
  OddToEvenHarmonicEnergyRatio(
    frequencies: number[],
    magnitudes: number[]
  ): EssentiaOutput;

  // Mel-scale Features
  MelBands(
    spectrum: number[],
    highFrequencyBound?: number,
    inputSize?: number,
    log?: boolean,
    lowFrequencyBound?: number,
    normalize?: string,
    numberBands?: number,
    sampleRate?: number,
    type?: string,
    warpingFormula?: string,
    weighting?: string
  ): EssentiaOutput;
  MFCC(
    spectrum: number[],
    dctType?: number,
    highFrequencyBound?: number,
    inputSize?: number,
    liftering?: number,
    logType?: string,
    lowFrequencyBound?: number,
    normalize?: string,
    numberBands?: number,
    numberCoefficients?: number,
    sampleRate?: number,
    type?: string,
    warpingFormula?: string,
    weighting?: string
  ): EssentiaOutput;

  // Loudness
  Loudness(signal: number[]): EssentiaOutput;
  LoudnessEBUR128(
    signal: number[],
    hopSize?: number,
    sampleRate?: number
  ): EssentiaOutput;
  ReplayGain(signal: number[], sampleRate?: number): EssentiaOutput;

  // Audio Utilities
  MonoMixer(left: number[], right: number[], type?: string): EssentiaOutput;
  Resample(
    signal: number[],
    inputSampleRate?: number,
    outputSampleRate?: number,
    quality?: number
  ): EssentiaOutput;
  Scale(
    signal: number[],
    clipping?: boolean,
    factor?: number,
    maxAbsValue?: number
  ): EssentiaOutput;

  // Filters
  LowPass(
    signal: number[],
    cutoffFrequency?: number,
    sampleRate?: number
  ): EssentiaOutput;
  HighPass(
    signal: number[],
    cutoffFrequency?: number,
    sampleRate?: number
  ): EssentiaOutput;
  BandPass(
    signal: number[],
    bandwidth?: number,
    cutoffFrequency?: number,
    sampleRate?: number
  ): EssentiaOutput;
  BandReject(
    signal: number[],
    bandwidth?: number,
    cutoffFrequency?: number,
    sampleRate?: number
  ): EssentiaOutput;

  // Envelope
  Envelope(
    signal: number[],
    attackTime?: number,
    releaseTime?: number,
    sampleRate?: number
  ): EssentiaOutput;

  // Statistical
  Mean(array: number[]): EssentiaOutput;
  Variance(array: number[], mean?: number): EssentiaOutput;
  CentralMoments(array: number[], range?: number): EssentiaOutput;
  DistributionShape(centralMoments: number[]): EssentiaOutput;

  // Frame-based processing
  FrameGenerator(
    signal: number[],
    frameSize?: number,
    hopSize?: number,
    startFromZero?: boolean,
    validFrameThresholdRatio?: number
  ): EssentiaOutput;

  // Machine Learning
  TensorflowPredict(
    signal: number[],
    graphFilename?: string,
    input?: string,
    output?: string
  ): EssentiaOutput;
  TensorflowPredictMusiCNN(
    signal: number[],
    graphFilename?: string,
    input?: string,
    output?: string
  ): EssentiaOutput;

  // High-level extractors would be in EssentiaExtractor module
  // Model-based analysis would be in EssentiaModel module
  // Plotting utilities would be in EssentiaPlot module
}

// Default export
declare const essentia: {
  EssentiaWASM: any;
  Essentia: typeof EssentiaClass;
  EssentiaModel: any;
  EssentiaExtractor: any;
  EssentiaPlot: any;
};

export default essentia;
