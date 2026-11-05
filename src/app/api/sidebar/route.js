import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const items = db.prepare('SELECT id, label, path, icon FROM sidebar_menu ORDER BY id').all();
    return NextResponse.json(items);
  } catch (error) {
    console.error('API Error /api/sidebar:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
