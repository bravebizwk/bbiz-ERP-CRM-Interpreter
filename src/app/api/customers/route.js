import { NextResponse } from 'next/server';
import path from 'path';
import { openDatabase } from '@/lib/sqlite';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'dashboard.sqlite');
        const db = openDatabase(dbPath);

        // 'customers' ではなく正しいテーブル名 'project_customer' から取得する[cite: 13]
        const customers = db.prepare('SELECT proj_customer FROM project_customer').all();
        db.close();

        // 重複を除外した顧客名の文字列配列として返す
        const customerNames = Array.from(new Set(customers.map(c => c.proj_customer).filter(Boolean)));
        return NextResponse.json(customerNames);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}