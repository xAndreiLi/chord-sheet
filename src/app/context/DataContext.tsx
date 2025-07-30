import { createContext, ReactNode, useContext } from "react";
import chordDatabase from "../../../public/chords.json";
import { ChordDatabase } from "../types";

const DataContext = createContext(chordDatabase as ChordDatabase);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => (
  <DataContext.Provider value={chordDatabase as ChordDatabase}>
    {children}
  </DataContext.Provider>
);

export const useDataContext = () => {
  return useContext(DataContext);
};
