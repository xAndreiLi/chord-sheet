"use client";

import styles from "./GuitarFretboard.module.css";
import { ChordData, ChordPosition } from "../types";
import { getSuffixName } from "../utils";
import { Reorder } from "motion/react";

// Guitar Fretboard Component
const STRING_NAMES = ["E", "A", "D", "G", "B", "e"];

interface GuitarFretboardProps {
  chordData: ChordData;
  position: ChordPosition;
  key: string;
}

export function GuitarFretboard({ chordData, position }: GuitarFretboardProps) {
  const frets = 5;
  const baseFret = position.baseFret || 1;

  const fretRange = Array.from({ length: frets }, (_, i) => baseFret + i);

  return (
    <Reorder.Item
      className={styles.chordCard}
      key={position.baseFret + position.frets.join("")}
      value={position}
    >
      <div className={styles.fretboard}>
        <div className={styles.fretboardHeader}>
          <span className={styles.chordName}>
            {chordData.key}
            {getSuffixName(chordData.suffix)}
          </span>
          <span className={styles.positionInfo}>Position {baseFret}</span>
        </div>
        <div className={styles.horizontalFretboardWrapper}>
          {/* String names at the top */}
          <div className={styles.stringNamesRow}>
            {STRING_NAMES.map((name) => (
              <div key={name} className={styles.stringNameCell}>
                {name}
              </div>
            ))}
          </div>
          {/* Muted/Open indicators above nut */}
          <div className={styles.nutRow}>
            {position.frets.map((fret, idx) => (
              <div key={idx} className={styles.nutCell}>
                {fret === -1 ? (
                  <span className={styles.muted}>✕</span>
                ) : fret === 0 ? (
                  <span className={styles.open}>○</span>
                ) : null}
              </div>
            ))}
          </div>
          {/* Fretboard grid */}
          <div className={styles.horizontalFretboard}>
            {/* For each fret (row) */}
            {fretRange.map((fretNum) => (
              <div key={fretNum} className={styles.fretRow}>
                {/* Render the horizontal fret line for the whole row */}
                <div className={styles.fretLineHorizontal} />
                {/* For each string (column) */}
                {position.frets.map((fret, stringIdx) => {
                  // Place finger circle if this string/fret matches
                  const isFinger = fret + baseFret - 1 === fretNum;
                  // Barre highlight if this fret is in barres
                  const isBarre =
                    position.barres.includes(fretNum) &&
                    fretNum !== 0 &&
                    fretNum !== -1;
                  return (
                    <div key={stringIdx} className={styles.fretCell}>
                      {/* Draw string line */}
                      <div className={styles.stringLineVertical} />
                      {/* Draw finger circle */}
                      {isFinger && fretNum !== 0 && fretNum !== -1 && (
                        <div
                          className={`${styles.finger} ${
                            isBarre ? styles.barre : ""
                          }`}
                        >
                          {fretNum + baseFret - 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}
