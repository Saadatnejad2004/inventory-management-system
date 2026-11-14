import { useEffect, useState } from "react";
import { loadTable, saveTable } from "../utils/storage";

/**
 * Generic state+persistence for a single named table.
 * Each table name should be owned by exactly ONE hook instance
 * in the app (source of truth per table).
 */

export const useTable = (name) => {
  const [rows, setRows] = useState(() => loadTable(name));

  useEffect(() => {
    saveTable(name, rows);
  }, [name, rows]);

  return [rows, setRows];
};
