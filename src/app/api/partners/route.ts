import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const stmt = db.prepare(`
      SELECT DISTINCT proj_partner_name 
      FROM project_partner 
      WHERE proj_partner_name IS NOT NULL AND proj_partner_name != ''
    `);
        const rows = stmt.all() as { proj_partner_name: string }[];
        const partners = rows.map((row) => row.proj_partner_name);
        return NextResponse.json(partners);
    } catch (error: any) {
        console.error('Partners GET API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}