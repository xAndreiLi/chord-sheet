// Chord data structure matching the JSON format
export type Key =
  | "C"
  | "C#"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "Ab"
  | "A"
  | "Bb"
  | "B";

export type Suffix =
  | "major"
  | "minor"
  | "dim"
  | "dim7"
  | "sus"
  | "sus2"
  | "sus4"
  | "sus2sus4"
  | "7sus4"
  | "7/G"
  | "alt"
  | "aug"
  | "5"
  | "6"
  | "69"
  | "7"
  | "7b5"
  | "aug7"
  | "9"
  | "9b5"
  | "aug9"
  | "7b9"
  | "7#9"
  | "11"
  | "9#11"
  | "13"
  | "maj7"
  | "maj7b5"
  | "maj7#5"
  | "maj7sus2"
  | "maj9"
  | "maj11"
  | "maj13"
  | "m6"
  | "m69"
  | "m7"
  | "m7b5"
  | "m9"
  | "m11"
  | "mmaj7"
  | "mmaj7b5"
  | "mmaj9"
  | "mmaj11"
  | "add9"
  | "madd9"
  | "add11"
  | "/E"
  | "/F"
  | "/F#"
  | "/G"
  | "/G#"
  | "/A"
  | "/Bb"
  | "/B"
  | "/C"
  | "/C#"
  | "m/B"
  | "m/C"
  | "m/C#"
  | "/D"
  | "m/D"
  | "/D#"
  | "m/D#"
  | "m/E"
  | "m/F"
  | "m/F#"
  | "m/G"
  | "m/G#"
  | "m9/Bb"
  | "m9/B"
  | "m9/C"
  | "m9/C#"
  | "m9/D"
  | "m9/Eb"
  | "m9/E"
  | "m9/F"
  | "m9/F#"
  | "m9/G"
  | "m9/Ab"
  | "m9/A"
  | "/Eb"
  | "/Ab"
  | "m/A"
  | "m/Bb"
  | "m/Eb"
  | "m/Ab";

export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
  capo?: boolean;
  midi: number[];
}

export interface ChordData {
  key: Key;
  suffix: Suffix;
  positions: ChordPosition[];
}

export interface ChordDatabase {
  main: {
    strings: number;
    fretsOnChord: number;
    name: string;
    numberOfChords: number;
  };
  tunings: {
    standard: string[];
  };
  keys: Key[];
  suffixes: Suffix[];
  chords: Record<string, ChordData[]>;
}

export interface Chord {
  key: Key;
  suffix: Suffix;
}
