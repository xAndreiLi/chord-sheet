import { suffixNameMap, notes, altNotes } from "./constants";
import { Key, Suffix, Chord } from "./types";

export function transposeChord(chord: Chord, semitones: number): Chord {
  const noteIndex = notes.indexOf(chord.key);
  if (noteIndex === -1) return chord;

  const transposedIndex = (noteIndex + semitones + 12) % 12;

  return {
    key: notes[transposedIndex],
    altKey: altNotes[transposedIndex] ?? notes[transposedIndex],
    suffix: chord.suffix,
    isAlt: chord.isAlt,
  };
}

export function getSuffixName(suffix: Suffix): string {
  return Object.keys(suffixNameMap).includes(suffix)
    ? suffixNameMap[suffix as keyof typeof suffixNameMap]
    : suffix;
}

export function createChord(key: Key, suffix: Suffix): Chord {
  const isAlt = altNotes.includes(key);
  const noteIndex = isAlt ? altNotes.indexOf(key) : notes.indexOf(key);
  const dataKey = notes[noteIndex];
  const altKey = isAlt ? key : altNotes[noteIndex];
  return {
    key: dataKey,
    altKey,
    suffix,
    isAlt,
  };
}
