import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 修正: ルートディレクトリの dashboard.sqlite を参照
const dbPath = path.join(__dirname, 'dashboard.sqlite');
const db = new Database(dbPath, { readonly: true });

function sendRows(res, query, parameters = []) {
  try {
    res.json(query.all(...parameters));
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'データを読み込めませんでした。' });
  }
}

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
  console.log('Available tables:', tables.map(t => t.name));
} catch (err) {
  console.error('Failed to read sqlite_master:', err.message);
}

app.get('/api/sidebar', (req, res) => {
  sendRows(res, db.prepare('SELECT * FROM sidebar_menu ORDER BY id'));
});

app.get('/api/users', (req, res) => {
  sendRows(res, db.prepare('SELECT * FROM users ORDER BY id'));
});

app.get('/api/products', (req, res) => {
  sendRows(res, db.prepare('SELECT * FROM products ORDER BY id'));
});

app.get('/api/orders', (req, res) => {
  sendRows(res, db.prepare('SELECT * FROM orders ORDER BY date DESC, id'));
});

app.get('/api/stats', (req, res) => {
  sendRows(res, db.prepare('SELECT * FROM stats ORDER BY id'));
});

app.get('/api/revenue', (req, res) => {
  const period = req.query.period ?? '1Y';
  if (!['7D', '30D', '90D', '1Y'].includes(period)) {
    return res.status(400).json({ error: '有効な集計期間を指定してください。' });
  }

  sendRows(
    res,
    db.prepare('SELECT category, revenue, expenses FROM revenue WHERE period = ? ORDER BY id'),
    [period]
  );
});

app.get('/api/activities', (req, res) => {
  sendRows(res, db.prepare('SELECT * FROM activities ORDER BY created_at DESC, id DESC'));
});

app.get('/api/customers', (req, res) => {
  sendRows(res, db.prepare('SELECT * FROM customers ORDER BY customer_id'));
});

app.get(['/api/monthly-payments', '/api/payments'], (req, res) => {
  const customerId = Number(req.query.customerId ?? req.query.id);
  if (!Number.isSafeInteger(customerId) || customerId < 1) {
    return res.status(400).json({ error: '有効な顧客IDを指定してください。' });
  }

  sendRows(
    res,
    db.prepare(
      'SELECT id, customer_id, year, month, status, URL AS url, URL FROM monthly_payments WHERE customer_id = ? ORDER BY year DESC, month'
    ),
    [customerId]
  );
});

app.get('/api/items', (req, res) => {
  sendRows(res, db.prepare('SELECT * FROM items ORDER BY id'));
});

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
if (existsSync(indexPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(indexPath, (error) => {
      if (error) next(error);
    });
  });
}

app.listen(PORT, () => {
  console.log(`Web app and API server are running on http://localhost:${PORT}`);
});
