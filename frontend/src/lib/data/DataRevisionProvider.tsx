import { useMemo, useState, type ReactNode } from "react";
import { DataRevisionContext, type DataRevision } from "./data-revision";

export function DataRevisionProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);

  const value = useMemo<DataRevision>(
    () => ({ revision, notifyChanged: () => setRevision((current) => current + 1) }),
    [revision],
  );

  return <DataRevisionContext.Provider value={value}>{children}</DataRevisionContext.Provider>;
}
