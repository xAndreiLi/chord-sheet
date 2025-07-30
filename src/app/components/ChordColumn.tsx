import { useDragControls, useMotionValue, Reorder } from "motion/react";
import { PointerEventHandler, useState } from "react";
import { useChordContext } from "../context/ChordContext";
import { useDataContext } from "../context/DataContext";
import { Chord } from "../types";
import { getSuffixName, transposeChord } from "../utils";
import { GuitarFretboard } from "./GuitarFretboard";
import styles from "./ChordColumn.module.css";

interface ChordCardProps {
  baseChord: Chord;
  index: number;
}

export function ChordColumn({ baseChord, index }: ChordCardProps) {
  const chordDatabase = useDataContext();
  const {
    state: { transposition },
    removeChord,
  } = useChordContext();

  const chord = transposeChord(baseChord, transposition);
  const chordData = chordDatabase.chords[chord.key];
  const key = chord.isAlt ? chord.altKey : chord.key;
  const suffix = getSuffixName(chord.suffix);
  const matchingChord = chordData.find((c) => c.suffix === chord.suffix);

  const initialPositions = matchingChord!.positions.filter(
    (position, posIndex, positions) => {
      // Keep only positions with unique frets arrays
      const currentFrets = JSON.stringify(position.frets);
      const previousPositions = positions.slice(0, posIndex);
      return !previousPositions.some(
        (prev) => JSON.stringify(prev.frets) === currentFrets
      );
    }
  );

  const [positions, setPositions] = useState(initialPositions);

  const dragControls = useDragControls();
  const startDrag: PointerEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dragControls.start(e);
  };

  return (
    <Reorder.Item
      key={baseChord.key}
      value={baseChord}
      className={styles.chordColumn}
      dragListener={false}
      dragControls={dragControls}
    >
      <div className={styles.chordColumnHeader} onPointerDown={startDrag}>
        <h3>
          {key}
          {suffix}
        </h3>
        <button onClick={() => removeChord(index)}>x</button>
      </div>
      <div className={styles.chordPositions}>
        {!chordData || !matchingChord ? (
          <div className={styles.chordPlaceholder}>
            <small>Chord not found in database</small>
          </div>
        ) : (
          <Reorder.Group values={positions} onReorder={setPositions}>
            {positions.map((position) => (
              <GuitarFretboard
                key={position.baseFret + position.frets.join("")}
                chordData={matchingChord}
                position={position}
              />
            ))}
          </Reorder.Group>
        )}
      </div>
    </Reorder.Item>
  );
}
