import sqlite3 from 'sqlite3';

// sqlite3 の verbose を有効にする場合
const sqlite = sqlite3.verbose();
const db = new sqlite.Database('dashboard.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS project_customer (
        proj_no TEXT PRIMARY KEY,
        proj_customer TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS project_contents (
        proj_no TEXT,
        proj_ct_1 TEXT,
        proj_ct_2 TEXT,
        proj_ct_3 TEXT,
        proj_ct_4 TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS project_date (
        proj_no TEXT,
        proj_issue TEXT,
        proj_request TEXT,
        proj_possible TEXT,
        proj_date_1 TEXT,
        proj_date_2 TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS project_text (
        proj_no TEXT,
        proj_format TEXT,
        proj_qty_format TEXT,
        proj_char_count INTEGER,
        proj_count INTEGER
    )`, (err: Error | null) => {
    if (err) {
      console.error('テーブル作成エラー:', err.message);
    } else {
      console.log('すべてのテーブルが正常に作成されました！');
    }
  });
});

db.close();
