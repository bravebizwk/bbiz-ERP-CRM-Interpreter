import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'dashboard.sqlite');
const db = new Database(dbPath);

console.log('📦 データベースとテーブルを作成中...');

// トランザクションで一括処理（高速かつ安全）
db.transaction(() => {
    // 1. StatsCard用テーブル
    db.prepare(`
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      value TEXT NOT NULL,
      change TEXT NOT NULL
    )
  `).run();

    // 2. RevenueChart用テーブル
    db.prepare(`
    CREATE TABLE IF NOT EXISTS revenue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period TEXT NOT NULL,
      category TEXT NOT NULL,
      revenue INTEGER NOT NULL,
      expenses INTEGER NOT NULL
    )
  `).run();

    // 3. Sidebar用テーブル
    db.prepare(`
    CREATE TABLE IF NOT EXISTS sidebar_menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      path TEXT NOT NULL,
      icon TEXT NOT NULL
    )
  `).run();

    // 4. ActivityFeed用テーブル
    db.prepare(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

    // 5. Orders用テーブル
    db.prepare(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      product TEXT NOT NULL,
      category TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `).run();

    // 6. Products用テーブル
    db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      status TEXT NOT NULL
    )
  `).run();

    // 7. Users用テーブル
    db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      joined_date TEXT NOT NULL
    )
  `).run();

    // --- テストデータの挿入 ---
    console.log('🌱 テストデータを挿入中...');

    // RevenueChart データ
    db.prepare(`DELETE FROM revenue`).run();
    const stmtRevenue = db.prepare(`INSERT INTO revenue (period, category, revenue, expenses) VALUES (?, ?, ?, ?)`);

    const data7D = { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], revenue: [1200, 1800, 1500, 2200, 2800, 2400, 3200], expenses: [800, 1000, 950, 1200, 1300, 1100, 1400] };
    data7D.categories.forEach((cat, idx) => stmtRevenue.run('7D', cat, data7D.revenue[idx], data7D.expenses[idx]));

    const data30D = { categories: ["W1", "W2", "W3", "W4"], revenue: [12000, 18000, 22000, 30000], expenses: [8000, 10000, 12000, 14000] };
    data30D.categories.forEach((cat, idx) => stmtRevenue.run('30D', cat, data30D.revenue[idx], data30D.expenses[idx]));

    const data90D = { categories: ["Jan", "Feb", "Mar"], revenue: [42000, 51000, 62000], expenses: [26000, 30000, 34000] };
    data90D.categories.forEach((cat, idx) => stmtRevenue.run('90D', cat, data90D.revenue[idx], data90D.expenses[idx]));

    const data1Y = { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], revenue: [12000, 18000, 15000, 22000, 28000, 24000, 32000, 35000, 42000, 39000, 46000, 54000], expenses: [8000, 11000, 10000, 12000, 14000, 15000, 18000, 19000, 22000, 21000, 24000, 26000] };
    data1Y.categories.forEach((cat, idx) => stmtRevenue.run('1Y', cat, data1Y.revenue[idx], data1Y.expenses[idx]));

    // StatsCard データ
    db.prepare(`DELETE FROM stats`).run();
    const stmtStats = db.prepare(`INSERT INTO stats (title, value, change) VALUES (?, ?, ?)`);
    stmtStats.run('総売上', '¥1,250,000', '+12.5%');
    stmtStats.run('ユーザー数', '1,234人', '+3.2%');
    stmtStats.run('アクティブ率', '85.4%', '-0.5%');
    stmtStats.run('新規注文', '423件', '+8.1%');

    // Sidebar データ
    const stmtSidebar = db.prepare(`INSERT OR REPLACE INTO sidebar_menu (id, label, path, icon) VALUES (?, ?, ?, ?)`);
    stmtSidebar.run(1, 'Dashboard', '/', 'dashboard');
    stmtSidebar.run(2, 'Users', '/users', 'users');
    stmtSidebar.run(3, 'Products', '/products', 'products');
    stmtSidebar.run(4, 'Orders', '/orders', 'orders');
    stmtSidebar.run(5, 'Timeline', '/timeline', 'timeline');

    // ActivityFeed データ
    db.prepare(`DELETE FROM activities`).run();
    const stmtActivity = db.prepare(`INSERT INTO activities (user_name, action) VALUES (?, ?)`);
    stmtActivity.run('山田 太郎', '新しいレポートを作成しました');
    stmtActivity.run('佐藤 花子', 'ユーザー設定を変更しました');
    stmtActivity.run('鈴木 一郎', 'システムにログインしました');

    // Orders データ (160件)
    db.prepare(`DELETE FROM orders`).run();
    const stmtOrders = db.prepare(`INSERT INTO orders (id, customer, product, category, amount, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)`);

    const companyPrefixes: string[] = ['株式会社', '有限会社', '合同会社'];
    const companyNames: string[] = ['アクアテクノロジー', 'グローバルソリューションズ', 'ネクストイノベーション', '未来ロジスティクス', 'サンライズマーケティング'];

    interface ProductItem {
        name: string;
        category: string;
        price: number;
    }

    const productsList: ProductItem[] = [
        { name: 'スタンダードプラン (月額)', category: 'サブスクリプション', price: 1500 },
        { name: 'プレミアムプラン (1年)', category: 'サブスクリプション', price: 12000 },
        { name: 'ビジネスプラン (1年)', category: 'サブスクリプション', price: 48000 },
        { name: 'オプションパーツ A', category: 'ハードウェア', price: 3200 }
    ];
    const statuses: string[] = ['完了', '完了', '完了', '保留', 'キャンセル'];

    for (let i = 1; i <= 160; i++) {
        const orderId = `ORD-${String(i).padStart(4, '0')}`;
        const customerCompany = `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]}${companyNames[Math.floor(Math.random() * companyNames.length)]}`;
        const productObj = productsList[Math.floor(Math.random() * productsList.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const date = `2026-${month}-${day}`;

        stmtOrders.run(orderId, customerCompany, productObj.name, productObj.category, productObj.price, status, date);
    }
    console.log('  └─ Ordersデータ (160件) の挿入完了');

    // Products データ
    db.prepare(`DELETE FROM products`).run();
    const stmtProducts = db.prepare(`INSERT INTO products (id, name, category, price, stock, status) VALUES (?, ?, ?, ?, ?, ?)`);

    interface MockProduct {
        id: string;
        name: string;
        category: string;
        price: number;
        stock: number;
        status: string;
    }

    const mockProducts: MockProduct[] = [
        { id: 'PROD-001', name: 'スタンダードプラン (月額)', category: 'サブスクリプション', price: 1500, stock: 999, status: '販売中' },
        { id: 'PROD-002', name: 'プレミアムプラン (1年)', category: 'サブスクリプション', price: 12000, stock: 999, status: '販売中' },
        { id: 'PROD-003', name: 'ビジネスプラン (1年)', category: 'サブスクリプション', price: 48000, stock: 50, status: '販売中' },
        { id: 'PROD-004', name: 'オプションパーツ A', category: 'ハードウェア', price: 3200, stock: 15, status: '残りわずか' },
        { id: 'PROD-005', name: '旧型拡張キット', category: 'アクセサリ', price: 5000, stock: 0, status: '在庫切れ' }
    ];
    mockProducts.forEach(p => stmtProducts.run(p.id, p.name, p.category, p.price, p.stock, p.status));

    // Users データ
    db.prepare(`DELETE FROM users`).run();
    const stmtUsers = db.prepare(`INSERT INTO users (name, email, role, status, joined_date) VALUES (?, ?, ?, ?, ?)`);

    interface MockUser {
        name: string;
        email: string;
        role: string;
        status: string;
        joined_date: string;
    }

    const mockUsers: MockUser[] = [
        { name: '山田 太郎', email: 'yamada@example.com', role: '管理者', status: 'アクティブ', joined_date: '2026-01-15' },
        { name: '佐藤 花子', email: 'sato@example.com', role: '編集者', status: 'アクティブ', joined_date: '2026-02-01' },
        { name: '鈴木 健太', email: 'suzuki@example.com', role: '閲覧者', status: '停止中', joined_date: '2026-02-20' },
        { name: '高橋 順子', email: 'takahashi@example.com', role: '管理者', status: 'アクティブ', joined_date: '2026-03-10' },
        { name: '田中 実', email: 'tanaka@example.com', role: '閲覧者', status: 'アクティブ', joined_date: '2026-03-25' }
    ];
    mockUsers.forEach(u => stmtUsers.run(u.name, u.email, u.role, u.status, u.joined_date));

    console.log('✅ 完了: 全テーブル・初期データで dashboard.sqlite が更新されました！');
});

db.close();