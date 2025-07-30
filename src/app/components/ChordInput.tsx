"use client";
import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";
import styles from "./ChordInput.module.css";
import { Suffix, Key } from "../types";
import { useDataContext } from "../context/DataContext";
import { useChordContext } from "../context/ChordContext";
import { createChord } from "../utils";
import { notes, altNotes } from "../constants";

type InputType = "Chord" | "Song";

export function ChordInput() {
  const chordDatabase = useDataContext();
  const {
    state: { chords },
    addChord,
  } = useChordContext();
  const [inputType, setInputType] = useState<InputType>("Chord");
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
      <ul className={styles.headingSelect}>
        <li
          onClick={() => setInputType("Chord")}
          style={{ position: "relative", display: "inline-block" }}
        >
          <a
            href="#"
            className={
              inputType == "Chord" ? styles.selected : styles.notSelected
            }
          >
            {`Input ${"Chord"}`}
          </a>
        </li>
        <li
          onClick={() => setInputType("Song")}
          style={{ position: "relative", display: "inline-block" }}
        >
          <a
            href="#"
            className={
              inputType == "Song" ? styles.selected : styles.notSelected
            }
          >
            {`Input ${"Song"}`}
          </a>
        </li>
        {inputType == "Song" ? (
          <motion.span
            style={{
              position: "absolute",
              top: 60,
              height: "2px",
              backgroundColor: "#b6c0de",
              borderRadius: 100,
            }}
            initial={{ width: "8.2rem", translateX: 0 }}
            animate={{ width: "7.6rem", translateX: 179 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        ) : (
          <motion.span
            style={{
              position: "absolute",
              top: 60,
              height: "2px",
              backgroundColor: "#b6c0de",
              borderRadius: 100,
            }}
            initial={{ width: "7.6rem", translateX: 179 }}
            animate={{ width: "8.2rem", translateX: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        )}
      </ul>
      <div className={styles.chordInput}>
        <AnimatePresence mode="wait">
          {inputType == "Chord" ? (
            <motion.div
              key={"Chord"}
              className={styles.chordInputRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
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
              <button
                onClick={handleChordSubmit}
                className={styles.addButton}
                disabled={availableSuffixes.length === 0}
              >
                Add Chord
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={"Song"}
              className={styles.chordInputRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="text"
                value={newChord}
                onChange={(e) => setNewChord(e.target.value)}
                placeholder="Enter YouTube Link"
                className={styles.chordInputField}
                onKeyDown={(e) => e.key === "Enter" && handleChordSubmit()}
              />
              <button
                onClick={handleChordSubmit}
                className={styles.addButton}
                disabled={availableSuffixes.length === 0}
              >
                Generate Chords
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
