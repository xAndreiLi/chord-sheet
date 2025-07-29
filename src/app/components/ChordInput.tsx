'use client';

import { useState, useEffect } from 'react';
import styles from './ChordInput.module.css';
import { Chord, ChordDatabase, Suffix, Key } from '../types';
import { getSuffixName } from '../utils';

interface ChordInputProps {
  chords: Chord[];
  onChordsChange: (chords: Chord[]) => void;
  chordDatabase: ChordDatabase | null;
}

export function ChordInput({ chords, onChordsChange, chordDatabase }: ChordInputProps) {
  const [newChord, setNewChord] = useState('');
  const [newSuffix, setNewSuffix] = useState<Suffix>('major');
  const [availableSuffixes, setAvailableSuffixes] = useState<Suffix[]>([]);

  // Update available suffixes when chord changes
  useEffect(() => {
    if (chordDatabase && newChord) {
      const chordData = chordDatabase.chords[newChord.replace("#", "sharp")];
      if (chordData) {
        const suffixes = chordData.map(chord => chord.suffix);
        setAvailableSuffixes(suffixes);
        if (suffixes.length > 0 && !suffixes.includes(newSuffix)) {
          setNewSuffix(suffixes[0]);
        }
      } else {
        setAvailableSuffixes([]);
      }
    }
  }, [newChord, chordDatabase, newSuffix]);

  const addChord = () => {
    if (newChord.trim() && availableSuffixes.includes(newSuffix)) {
      const chordExists = chords.some(chord => 
        chord.key === newChord.trim() && chord.suffix === newSuffix
      );
      
      if (!chordExists) {
        onChordsChange([...chords, { key: newChord.trim() as Key, suffix: newSuffix }]);
        setNewChord('');
        setNewSuffix('major');
      }
    }
  };

  const removeChord = (index: number) => {
    onChordsChange(chords.filter((_, i) => i !== index));
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
            onKeyPress={(e) => e.key === 'Enter' && addChord()}
          />
          <select
            value={newSuffix}
            onChange={(e) => setNewSuffix(e.target.value as Suffix)}
            className={styles.suffixSelect}
            disabled={availableSuffixes.length === 0}
          >
            {availableSuffixes.map(suffix => (
              <option key={suffix} value={suffix}>
                {suffix === 'major' ? '' : suffix}
              </option>
            ))}
          </select>
        </div>
        <button onClick={addChord} className={styles.addButton} disabled={availableSuffixes.length === 0}>
          Add Chord
        </button>
      </div>
      
      <div className={styles.chordList}>
        {chords.map((chord, index) => (
          <div key={index} className={styles.chordTag}>
            <span>{chord.key}{getSuffixName(chord.suffix)}</span>
            <button 
              onClick={() => removeChord(index)}
              className={styles.removeButton}
            >
              ×
            </button>
          </div>
        ))}
      </div>  
    </section>
  );
} 