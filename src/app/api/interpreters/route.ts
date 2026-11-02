import sqlite3 from 'sqlite3';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
    const dbPath = path.resolve(process.cwd(), 'dashboard.sqlite');
    const db = new sqlite3.Database(dbPath);

    return new Promise((resolve) => {
        const query = `
      SELECT 
        i.intp_no,
        i.intp_name_en,
        i.intp_name_kanji,
        inf.intp_add,
        c.intp_email
      FROM interpreter i
      LEFT JOIN interpreter_info inf ON i.intp_no = inf.intp_no
      LEFT JOIN interpreter_contact c ON i.intp_no = c.intp_no
    `;

        db.all(query, [], (err: Error | null, rows: any[]) => {
            db.close();
            if (err) {
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            } else {
                resolve(NextResponse.json(rows));
            }
        });
    });
}