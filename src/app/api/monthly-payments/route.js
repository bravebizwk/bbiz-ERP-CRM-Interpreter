import { NextResponse } from 'next/server';
import path from 'path';
import { openDatabase } from '@/lib/sqlite';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId') || searchParams.get('id');

        if (!customerId) {
            return NextResponse.json([]);
        }

        // データベースのパス（必要に応じて 'src' フォルダの有無を確認してください）
        const dbPath = path.join(process.cwd(), 'dashboard.sqlite');
        const db = openDatabase(dbPath);

        // URLカラムを確実に取得するため、URL AS url を追加
        const stmt = db.prepare('SELECT *, URL AS url FROM monthly_payments WHERE customer_id = ? OR id = ?');
        const payments = stmt.all(customerId, customerId);
        db.close();

        return NextResponse.json(payments);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch monthly payments' }, { status: 500 });
    }
}