'use client';

import styles from './ChordDisplay.module.css';
import { Chord, ChordDatabase } from '../types';
import { GuitarFretboard } from './GuitarFretboard';
import { getSuffixName } from '../utils';

interface ChordDisplayProps {
  chords: Chord[];
  chordDatabase: ChordDatabase | null;
}

export function ChordDisplay({ chords, chordDatabase }: ChordDisplayProps) {
  if (!chordDatabase) return null;

  return (
    <section className={styles.chordDisplay}>
      <h2>Guitar Fingerings</h2>
      <div className={styles.chordColumns}>
        {chords.map((chord, index) => {
          const dbKey = chord.key.replace("#", "sharp")
          const chordData = chordDatabase.chords[dbKey];
          if (!chordData) {
            return (
              <div key={index} className={styles.chordColumn}>
                <div className={styles.chordColumnHeader}>
                  <h3>{chord.key}{getSuffixName(chord.suffix)}</h3>
                </div>
                <div className={styles.chordPlaceholder}>
                  <span>{chord.key}{getSuffixName(chord.suffix)}</span>
                  <small>Chord not found in database</small>
                </div>
              </div>
            );
          }

          const matchingChord = chordData.find(c => c.suffix === chord.suffix);
          console.log(matchingChord)
          if (!matchingChord) {
            return (
              <div key={index} className={styles.chordColumn}>
                <div className={styles.chordColumnHeader}>
                  <h3>{chord.key}{getSuffixName(chord.suffix)}</h3>
                </div>
                <div className={styles.chordPlaceholder}>
                  <span>{chord.key}{getSuffixName(chord.suffix)}</span>
                  <small>Suffix not available</small>
                </div>
              </div>
            );
          }

          return (
            <div key={index} className={styles.chordColumn}>
              <div className={styles.chordColumnHeader}>
                <h3>{chord.key.replace("sharp", "#")}{getSuffixName(chord.suffix)}</h3>
              </div>
              <div className={styles.chordPositions}>
                {matchingChord.positions
                  .filter((position, posIndex, positions) => {
                    // Keep only positions with unique frets arrays
                    const currentFrets = JSON.stringify(position.frets);
                    const previousPositions = positions.slice(0, posIndex);
                    return !previousPositions.some(prev => 
                      JSON.stringify(prev.frets) === currentFrets
                    );
                  })
                  .map((position, posIndex) => (
                    <div key={posIndex} className={styles.chordCard}>
                      <GuitarFretboard chordData={matchingChord} position={position} />
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
} 