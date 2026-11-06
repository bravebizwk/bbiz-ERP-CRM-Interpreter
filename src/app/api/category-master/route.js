import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const rows = db.prepare(`
      SELECT
        category_id,
        category_type,
        category_code,
        category_name,
        category_short
      FROM category_master
      ORDER BY
        category_type,
        category_code
    `).all();

        return NextResponse.json(rows);

    } catch (error) {
        console.error('Category Master GET API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            {
                status: 500
            }
        );
    }
}
