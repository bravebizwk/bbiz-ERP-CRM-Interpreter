import { NextResponse } from 'next/server';
import path from 'path';
import Database from 'better-sqlite3';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'dashboard.sqlite');
        const db = new Database(dbPath);

        // customers テーブルから全件取得
        const customers = db.prepare('SELECT * FROM customers').all();
        db.close();

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}