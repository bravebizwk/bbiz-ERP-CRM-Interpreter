import sqlite3 from 'sqlite3';

const sqlite = sqlite3.verbose();
const db = new sqlite.Database('./dashboard.sqlite');

db.serialize(() => {
  // 1. project_categories テーブルの作成
  db.run(`
        CREATE TABLE IF NOT EXISTS project_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            parent_id INTEGER,
            level TEXT,
            FOREIGN KEY (parent_id) REFERENCES project_categories(id)
        )
    `, (err) => {
    if (err) {
      console.error('テーブル作成エラー:', err.message);
      return;
    }
    console.log('project_categories テーブルの準備ができました。');
  });

  // 2. 既存データをクリアして初期データを挿入
  db.run("DELETE FROM project_categories", (err) => {
    if (err) {
      console.error('データクリアエラー:', err.message);
      return;
    }

    // --- A. 大カテゴリの挿入 ---
    const largeCategories = ["四半期決算短信", "決算短信", "リリース", "IR資料"];
    let largeCount = 0;
    const largeIds = {};

    largeCategories.forEach((name) => {
      db.run("INSERT INTO project_categories (name, parent_id, level) VALUES (?, NULL, 'large')", [name], function (err) {
        if (!err) {
          largeIds[name] = this.lastID; // 挿入された行のIDを取得
        }
        largeCount++;

        // すべての大カテゴリの挿入が終わったら、中カテゴリと言語カテゴリを挿入
        if (largeCount === largeCategories.length) {
          insertMediumAndLanguages(largeIds);
        }
      });
    });
  });
});

function insertMediumAndLanguages(largeIds) {
  const mediumNames = ["第一", "第二", "第三", "第四"];

  // --- B. 中カテゴリの挿入 (大カテゴリのIDを親IDにする) ---
  Object.entries(largeIds).forEach(([lName, lId]) => {
    mediumNames.forEach((mName) => {
      db.run("INSERT INTO project_categories (name, parent_id, level) VALUES (?, ?, 'medium')", [mName, lId]);
    });
  });

  // --- C. 言語カテゴリの挿入 ---
  const languageCategories = ["英訳", "和訳"];
  languageCategories.forEach((lang) => {
    db.run("INSERT INTO project_categories (name, parent_id, level) VALUES (?, NULL, 'language')", [lang]);
  });

  console.log("初期データの挿入が完了しました！\n");

  // 3. 登録されたデータの確認出力
  setTimeout(() => {
    console.log("--- 【 登録された project_categories テーブルの内容 】 ---");
    db.all("SELECT * FROM project_categories", [], (err, rows) => {
      if (err) {
        console.error('データ取得エラー:', err.message);
      } else {
        rows.forEach((row) => {
          console.log(row);
        });
      }
      db.close();
    });
  }, 500);
}
