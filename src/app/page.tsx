"use client";

import styles from "./page.module.css";
import { ChordInput } from "./components/ChordInput";
import { TranspositionControls } from "./components/TranspositionControls";
import { ChordDisplay } from "./components/ChordDisplay";
import { ChordProvider } from "./context/ChordContext";
import { DataProvider } from "./context/DataContext";

// UI Improvements
// remove tags from input section
// add a remove button for each chord in the fingerings section
// add arrows for each chord in the fingerings section to move the chord left and right
// add arrows for each fingering chart to move up and down
// or instead of arrows, make it draggable

export default function Page() {
  return (
    <DataProvider>
      <ChordProvider>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Chord Sheet</h1>
            <p className={styles.subtitle}>
              Input chords, transpose, and view guitar fingerings
            </p>
          </header>

          <main className={styles.main}>
            <ChordInput />
            <TranspositionControls />
            <ChordDisplay />
          </main>
        </div>
      </ChordProvider>
    </DataProvider>
  );
}
