import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const stmt = db.prepare(`
      SELECT DISTINCT intp_name_en 
      FROM interpreter 
      WHERE intp_name_en IS NOT NULL AND intp_name_en != ''
    `);
        const rows = stmt.all() as { intp_name_en: string }[];
        return NextResponse.json(rows.map(r => r.intp_name_en));
    } catch (error: any) {
        console.error('Interpreters List GET API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}