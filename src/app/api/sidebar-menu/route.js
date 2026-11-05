import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'dashboard.sqlite'); // または適切なDBパス
        const db = new Database(dbPath, { readonly: true });

        const items = db.prepare('SELECT label, path, icon FROM sidebar_menu').all();
        db.close();

        return NextResponse.json({ success: true, items });
    } catch (error) {
        console.error('API Error /api/sidebar-menu:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}