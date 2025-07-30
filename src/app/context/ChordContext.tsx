"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { Chord } from "../types";

interface ChordState {
  chords: Chord[];
  transposition: number;
}

type ChordAction =
  | { type: "ADD_CHORD"; payload: Chord }
  | { type: "REMOVE_CHORD"; payload: number }
  | { type: "UPDATE_CHORD"; payload: { index: number; chord: Chord } }
  | { type: "SET_CHORDS"; payload: Chord[] }
  | { type: "TRANSPOSE_UP" }
  | { type: "TRANSPOSE_DOWN" }
  | { type: "RESET_TRANSPOSITION" }
  | { type: "SET_TRANSPOSITION"; payload: number };

const initialState: ChordState = {
  chords: [
    { key: "C", suffix: "major" },
    { key: "G", suffix: "major" },
    { key: "A", suffix: "minor" },
    { key: "F", suffix: "major" },
  ],
  transposition: 0,
};

function chordReducer(state: ChordState, action: ChordAction): ChordState {
  switch (action.type) {
    case "ADD_CHORD":
      return {
        ...state,
        chords: [...state.chords, action.payload],
      };

    case "REMOVE_CHORD":
      return {
        ...state,
        chords: state.chords.filter((_, index) => index !== action.payload),
      };

    case "UPDATE_CHORD":
      return {
        ...state,
        chords: state.chords.map((chord, index) =>
          index === action.payload.index ? action.payload.chord : chord
        ),
      };

    case "SET_CHORDS":
      return {
        ...state,
        chords: action.payload,
      };

    case "TRANSPOSE_UP":
      return {
        ...state,
        transposition: state.transposition + 1,
      };

    case "TRANSPOSE_DOWN":
      return {
        ...state,
        transposition: state.transposition - 1,
      };

    case "RESET_TRANSPOSITION":
      return {
        ...state,
        transposition: 0,
      };

    case "SET_TRANSPOSITION":
      return {
        ...state,
        transposition: action.payload,
      };

    default:
      return state;
  }
}

interface ChordContextType {
  state: ChordState;
  dispatch: React.Dispatch<ChordAction>;
  addChord: (chord: Chord) => void;
  removeChord: (index: number) => void;
  updateChord: (index: number, chord: Chord) => void;
  setChords: (chords: Chord[]) => void;
  transposeUp: () => void;
  transposeDown: () => void;
  resetTransposition: () => void;
  setTransposition: (semitones: number) => void;
}

interface ChordProviderProps {
  children: ReactNode;
}

const ChordContext = createContext<ChordContextType | undefined>(undefined);

export function ChordProvider({ children }: ChordProviderProps) {
  const [state, dispatch] = useReducer(chordReducer, initialState);

  const addChord = (chord: Chord) => {
    dispatch({ type: "ADD_CHORD", payload: chord });
  };

  const removeChord = (index: number) => {
    dispatch({ type: "REMOVE_CHORD", payload: index });
  };

  const updateChord = (index: number, chord: Chord) => {
    dispatch({ type: "UPDATE_CHORD", payload: { index, chord } });
  };

  const setChords = (chords: Chord[]) => {
    dispatch({ type: "SET_CHORDS", payload: chords });
  };

  const transposeUp = () => {
    dispatch({ type: "TRANSPOSE_UP" });
  };

  const transposeDown = () => {
    dispatch({ type: "TRANSPOSE_DOWN" });
  };

  const resetTransposition = () => {
    dispatch({ type: "RESET_TRANSPOSITION" });
  };

  const setTransposition = (semitones: number) => {
    dispatch({ type: "SET_TRANSPOSITION", payload: semitones });
  };

  const value: ChordContextType = {
    state,
    dispatch,
    addChord,
    removeChord,
    updateChord,
    setChords,
    transposeUp,
    transposeDown,
    resetTransposition,
    setTransposition,
  };

  return (
    <ChordContext.Provider value={value}>{children}</ChordContext.Provider>
  );
}

export const useChordContext = () => {
  return useContext(ChordContext) as ChordContextType;
};
