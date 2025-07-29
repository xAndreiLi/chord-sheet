import { suffixNameMap } from "./constants";
import { Key, Suffix, Chord } from "./types";

// Transpose a chord name
export function transposeChord(chord: Chord, semitones: number): Chord {
  const notes: Key[] = [
    "C",
    "C#",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];

  const noteIndex = notes.indexOf(chord.key);
  if (noteIndex === -1) return chord;

  const newNoteIndex = (noteIndex + semitones + 12) % 12;
  const transposedNote = notes[newNoteIndex];

  return {
    key: transposedNote,
    suffix: chord.suffix,
  };
}

export function getSuffixName(suffix: Suffix): string {
  return Object.keys(suffixNameMap).includes(suffix)
    ? suffixNameMap[suffix as keyof typeof suffixNameMap]
    : suffix;
}
