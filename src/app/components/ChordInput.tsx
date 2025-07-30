"use client";

import { useState, useEffect } from "react";
import styles from "./ChordInput.module.css";
import { Suffix, Key } from "../types";
import { useDataContext } from "../context/DataContext";
import { useChordContext } from "../context/ChordContext";
import { createChord } from "../utils";
import { notes, altNotes } from "../constants";

export function ChordInput() {
  const chordDatabase = useDataContext();
  const {
    state: { chords },
    addChord,
  } = useChordContext();
  const [newChord, setNewChord] = useState("");
  const [newSuffix, setNewSuffix] = useState<Suffix>("major");

  // Check input against database Keys and generate available suffixes
  const inputKey = newChord as Key;
  const noteIndex = !notes.includes(inputKey)
    ? altNotes.indexOf(inputKey)
    : notes.indexOf(inputKey);
  const dataKey = notes[noteIndex];
  const chordData = dataKey ? chordDatabase.chords[dataKey] : [];
  const availableSuffixes = chordData.map((chord) => chord.suffix);

  const handleChordSubmit = () => {
    if (newChord.trim() && availableSuffixes.includes(newSuffix)) {
      const chordExists = chords.some(
        (chord) => chord.key === newChord.trim() && chord.suffix === newSuffix
      );

      if (!chordExists) {
        addChord(createChord(newChord.trim() as Key, newSuffix));
        setNewChord("");
        setNewSuffix("major");
      }
    }
  };

  return (
    <section className={styles.inputSection}>
      <h2>Chord Input</h2>
      <div className={styles.chordInput}>
        <div className={styles.chordInputRow}>
          <input
            type="text"
            value={newChord}
            onChange={(e) => setNewChord(e.target.value)}
            placeholder="Enter Key (e.g., C, G, A, F#)"
            className={styles.chordInputField}
            onKeyDown={(e) => e.key === "Enter" && handleChordSubmit()}
          />
          <select
            value={newSuffix}
            onChange={(e) => setNewSuffix(e.target.value as Suffix)}
            className={styles.suffixSelect}
          >
            {availableSuffixes.map((suffix) => (
              <option key={suffix} value={suffix}>
                {suffix === "major" ? "" : suffix}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleChordSubmit}
          className={styles.addButton}
          disabled={availableSuffixes.length === 0}
        >
          Add Chord
        </button>
      </div>
    </section>
  );
}
