import { Key } from "./types";

export const suffixNameMap = {
  major: "",
  minor: "m",
};

export const notes: Key[] = [
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

export const altNotes: (Key | undefined)[] = [
  "B#",
  "Db",
  undefined,
  "D#",
  "Fb",
  "E#",
  "Gb",
  "G#",
  undefined,
  "A#",
  "Cb",
];
