import { NextResponse } from 'next/server';
import path from 'path';
import { openDatabase } from '@/lib/sqlite';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'dashboard.sqlite'); // または適切なDBパス
        const db = openDatabase(dbPath, { readonly: true });

        const items = db.prepare('SELECT label, path, icon FROM sidebar_menu').all();
        db.close();

        return NextResponse.json({ success: true, items });
    } catch (error) {
        console.error('API Error /api/sidebar-menu:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}