import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function openDatabase(...args) {
    const Database = require('better-sqlite3');
    return new Database(...args);
}

export function loadSqlite3() {
    return require('sqlite3');
}
