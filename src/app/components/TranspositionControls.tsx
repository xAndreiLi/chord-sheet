'use client';

import styles from './TranspositionControls.module.css';

interface TranspositionControlsProps {
  transposition: number;
  onTranspose: (semitones: number) => void;
  onReset: () => void;
}

export function TranspositionControls({ transposition, onTranspose, onReset }: TranspositionControlsProps) {
  return (
    <section className={styles.transpositionSection}>
      <h2>Transposition</h2>
      <div className={styles.transpositionControls}>
        <button 
          onClick={() => onTranspose(-1)}
          className={styles.transposeButton}
        >
          ♭ (Down)
        </button>
        <span className={styles.transpositionDisplay}>
          {transposition > 0 ? `+${transposition}` : transposition}
        </span>
        <button 
          onClick={() => onTranspose(1)}
          className={styles.transposeButton}
        >
          ♯ (Up)
        </button>
        <button 
          onClick={onReset}
          className={styles.resetButton}
        >
          Reset
        </button>
      </div>
    </section>
  );
} 