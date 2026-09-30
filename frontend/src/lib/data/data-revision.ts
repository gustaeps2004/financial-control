import { createContext, useContext } from "react";

export interface DataRevision {
  // Bumped after every write; views that read server data refetch on it.
  revision: number;
  notifyChanged: () => void;
}

export const DataRevisionContext = createContext<DataRevision | null>(null);

export function useDataRevision(): DataRevision {
  const context = useContext(DataRevisionContext);
  if (!context) {
    throw new Error("useDataRevision must be used within a DataRevisionProvider");
  }
  return context;
}
