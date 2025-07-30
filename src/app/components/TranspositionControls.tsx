"use client";

import { useChordContext } from "../context/ChordContext";
import styles from "./TranspositionControls.module.css";

export function TranspositionControls() {
  const {
    state: { transposition },
    transposeUp,
    transposeDown,
    resetTransposition,
  } = useChordContext();
  return (
    <section className={styles.transpositionSection}>
      <h2>Transposition</h2>
      <div className={styles.transpositionControls}>
        <button
          onClick={transposeDown}
          className={styles.transposeButton}
          disabled={transposition <= -11}
        >
          ♭ (Down)
        </button>
        <span className={styles.transpositionDisplay}>
          {transposition > 0 ? `+${transposition}` : transposition}
        </span>
        <button
          onClick={transposeUp}
          className={styles.transposeButton}
          disabled={transposition >= 11}
        >
          ♯ (Up)
        </button>
        <button onClick={resetTransposition} className={styles.resetButton}>
          Reset
        </button>
      </div>
    </section>
  );
}
