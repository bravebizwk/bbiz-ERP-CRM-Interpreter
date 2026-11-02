import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM orders');
    const rows = stmt.all();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Orders GET API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const customer = typeof body.customer === 'string' ? body.customer.trim() : '';
    const product = typeof body.product === 'string' ? body.product.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const status = typeof body.status === 'string' ? body.status.trim() : '';
    const date = typeof body.date === 'string' ? body.date.trim() : '';
    const amount = Number(body.amount);

    if (!id || !customer || !product || !category || !status || !date) {
      return NextResponse.json({ error: 'すべての項目を入力してください。' }, { status: 400 });
    }

    if (!Number.isSafeInteger(amount) || amount < 0) {
      return NextResponse.json({ error: '金額は0以上の整数で入力してください。' }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00`))) {
      return NextResponse.json({ error: '日付を正しく入力してください。' }, { status: 400 });
    }

    const insertOrder = db.prepare(`
      INSERT INTO orders (id, customer, product, category, amount, status, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertOrder.run(id, customer, product, category, amount, status, date);

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Orders POST API Error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'この注文IDはすでに登録されています。' }, { status: 409 });
    }
    return NextResponse.json({ error: '注文情報を登録できませんでした。' }, { status: 500 });
  }
}
