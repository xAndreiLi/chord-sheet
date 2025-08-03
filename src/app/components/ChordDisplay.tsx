"use client";
import { Reorder, useDragControls, useMotionValue } from "motion/react";

import styles from "./ChordDisplay.module.css";
import { GuitarFretboard } from "./GuitarFretboard";
import { getSuffixName, transposeChord } from "../utils";
import { useDataContext } from "../context/DataContext";
import { useChordContext } from "../context/ChordContext";
import { PointerEventHandler, useState } from "react";
import { ChordColumn } from "./ChordColumn";

export function ChordDisplay() {
  const chordDatabase = useDataContext();
  const {
    state: { chords },
    setChords,
  } = useChordContext();

  return (
    <section className={styles.chordDisplay}>
      <h2>Guitar Fingerings</h2>
      <Reorder.Group
        values={chords}
        onReorder={setChords}
        axis="x"
        layoutScroll
        className={styles.chordColumns}
      >
        {chords.map((baseChord, index) => (
          <ChordColumn
            baseChord={baseChord}
            index={index}
            key={baseChord.key + baseChord.suffix}
          />
        ))}
      </Reorder.Group>
    </section>
  );
}
