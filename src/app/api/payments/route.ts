import { NextResponse } from 'next/server';
import path from 'path';
import sqlite3 from 'sqlite3';

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    const dbPath = path.resolve(process.cwd(), 'dashboard.sqlite');
    const db = new sqlite3.Database(dbPath);

    return new Promise<NextResponse>((resolve) => {
        // payments テーブルの構造に合わせてクエリを調整してください
        const query = customerId
            ? `SELECT * FROM payments WHERE customer_id = ?`
            : `SELECT * FROM payments`;

        db.all(query, customerId ? [customerId] : [], (err: Error | null, rows: any[]) => {
            db.close();
            if (err) {
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            } else {
                resolve(NextResponse.json(rows));
            }
        });
    });
}