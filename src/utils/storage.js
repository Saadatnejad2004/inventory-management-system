const NS = "ims";   // inventory management system
const VERSION = "v1";

const keyFor = (table) => `${NS}.${table}.${VERSION}`;

/**
 * Load a named table from localStorage.
 * Always returns an array - corrupted data or missing key -> [].
 */

export const loadTable = (table) => {
  try {
    const raw = localStorage.getItem(keyFor(table));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`[storage] failed to load "${table}":`, error);
    return [];
  }
};

/**
 * Save a table (array of objects) to localStorage.
 * Silently fails on quota errors - app keeps working with in-memory state.
 */
export const saveTable = (table, rows) => {
  try {
    localStorage.setItem(keyFor(table), JSON.stringify(rows));
  } catch (error) {
    console.error(`[storage] failed to save "${table}":`, error);
  }
};

/**
 * Wipe every table for this app. Used by the "Reset" button.
 */
export const clearAllTables = (tables) => {
  for (const t of tables) {
    try {
      localStorage.removeItem(keyFor(t));
    } catch (error) {
      console.error(`[storage] failed to clear "${t}":`, error);
    }
  }
};

export const TABLE_NAMES = ["categories", "suppliers", "products", "movements"];
