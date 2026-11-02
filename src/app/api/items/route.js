import { NextResponse } from 'next/server';
import db from '@/lib/db';

// データの取得 (GET)
export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM items ORDER BY created_at DESC');
    const items = stmt.all();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// データの登録 (POST)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, price, status } = body;

    const stmt = db.prepare(`
      INSERT INTO items (name, category, price, status) 
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(name, category, price, status);

    return NextResponse.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
  