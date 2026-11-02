  import { NextResponse } from 'next/server';
  import db from '@/lib/db';

  export async function GET() {
    try {
      const stmt = db.prepare('SELECT * FROM sidebar_menu');
      const rows = stmt.all();
      return NextResponse.json(rows);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
