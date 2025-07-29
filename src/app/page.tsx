'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Chord, ChordDatabase } from './types';
import { transposeChord } from './utils';
import { ChordInput } from './components/ChordInput';
import { TranspositionControls } from './components/TranspositionControls';
import { ChordDisplay } from './components/ChordDisplay';


// UI Improvements
// remove tags from input section
// add a remove button for each chord in the fingerings section
// add arrows for each chord in the fingerings section to move the chord left and right
// add arrows for each fingering chart to move up and down
// or instead of arrows, make it draggable


export default function Home() {
  const [chordDatabase, setChordDatabase] = useState<ChordDatabase | null>(null);
  const [chords, setChords] = useState<Chord[]>([
    { key: 'C', suffix: 'major' },
    { key: 'G', suffix: 'major' },
    { key: 'A', suffix: 'minor' },
    { key: 'F', suffix: 'major' }
  ]);
  const [transposition, setTransposition] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load chord database
  useEffect(() => {
    fetch('/chords.json')
      .then(response => response.json())
      .then(data => {
        setChordDatabase(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading chord database:', error);
        setLoading(false);
      });
  }, []);

  const transposeChords = (semitones: number) => {
    setTransposition(transposition + semitones);
  };

  const resetTransposition = () => {
    setTransposition(0);
  };

  const transposedChords: Chord[] = chords.map(chord => transposeChord(chord, transposition));

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Loading chord database...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chord Sheet</h1>
        <p className={styles.subtitle}>Input chords, transpose, and view guitar fingerings</p>
      </header>

      <main className={styles.main}>
        <ChordInput 
          chords={chords}
          onChordsChange={setChords}
          chordDatabase={chordDatabase}
        />

        <TranspositionControls 
          transposition={transposition}
          onTranspose={transposeChords}
          onReset={resetTransposition}
        />

        <ChordDisplay 
          chords={transposedChords}
          chordDatabase={chordDatabase}
        />
      </main>
    </div>
  );
}
