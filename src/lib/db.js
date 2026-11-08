import path from 'node:path';
import { openDatabase } from './sqlite.js';

/**
 * @typedef {{
 *   prepare: (sql: string) => {
 *     all: (...parameters: unknown[]) => unknown[],
 *     get: (...parameters: unknown[]) => unknown,
 *     run: (...parameters: unknown[]) => unknown
 *   },
 *   transaction: (callback: () => void) => () => unknown
 * }} DatabaseProxy
 */

/** @type {DatabaseProxy | undefined} */
let db;

/** @returns {DatabaseProxy} */
function getDatabase() {
  if (!db) {
    db = openDatabase(path.join(process.cwd(), 'dashboard.sqlite'));

    db.prepare(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        price INTEGER,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  }

  return db;
}

const target = /** @type {DatabaseProxy} */ (Object.create(null));

export default new Proxy(target, {
  get(_target, property) {
    const database = getDatabase();
    const value = Reflect.get(database, property, database);
    return typeof value === 'function' ? value.bind(database) : value;
  },
});
