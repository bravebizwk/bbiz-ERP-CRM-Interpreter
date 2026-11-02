import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = sqlite3.verbose();
const dbPath = path.resolve(__dirname, 'dashboard.sqlite');

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('データベースへの接続に失敗しました:', err.message);
    return;
  }
  console.log('Connected to dashboard.sqlite');
});

db.serialize(() => {
  // interpreter テーブルが存在しない場合は作成
  db.run(`CREATE TABLE IF NOT EXISTS interpreter_info (
    intp_no INTEGER PRIMARY KEY AUTOINCREMENT,
    intp_name_en TEXT NOT NULL,
    intp_name_kanji TEXT,
    intp_name_middle TEXT
  )`, (err) => {
    if (err) {
      console.error('テーブル作成エラー:', err.message);
      return;
    }
    console.log('interpreter テーブルを確認/作成しました。');
  });

  // データの挿入（INSERT OR REPLACE）
  const stmt = db.prepare(`INSERT OR REPLACE INTO interpreter (intp_no, intp_name_en) VALUES (?, ?)`);

  // 1人目
  stmt.run(1, 'breiden', (err) => {
    if (err) console.error('データ1の挿入エラー:', err.message);
  });

  // 2人目
  stmt.run(2, 'nishimoto', (err) => {
    if (err) console.error('データ2の挿入エラー:', err.message);
  });

  stmt.finalize(() => {
    console.log('通訳者データを正常に追加・更新しました。');
    db.close((err) => {
      if (err) {
        console.error('データベースの切断エラー:', err.message);
      } else {
        console.log('データベース接続を閉じました。');
      }
    });
  });
});