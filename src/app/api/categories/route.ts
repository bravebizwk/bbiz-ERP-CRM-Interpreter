import { NextResponse } from 'next/server';
import db from '@/lib/db';

// 1. 取得 (GET): 特定の proj_no または全件のカテゴリ情報を取得
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const proj_no = searchParams.get('proj_no');

        if (proj_no) {
            // 特定の proj_no のカテゴリを取得
            const stmt = db.prepare('SELECT * FROM project_categories WHERE proj_no = ?');
            const row = stmt.get(proj_no);
            return NextResponse.json(row || {});
        } else {
            // 全件取得
            const stmt = db.prepare('SELECT * FROM project_categories');
            const rows = stmt.all();
            return NextResponse.json(rows);
        }
    } catch (error: any) {
        console.error('Categories GET API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 2. 登録・更新 (POST): proj_no をキーにしてカテゴリを保存する
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { proj_no, large_category, medium_category, small_category, language_category } = body;

        if (!proj_no) {
            return NextResponse.json({ error: 'proj_no は必須です。' }, { status: 400 });
        }

        const stmt = db.prepare(`
      INSERT OR REPLACE INTO project_categories (proj_no, large_category, medium_category, small_category, language_category)
      VALUES (?, ?, ?, ?, ?)
    `);

        stmt.run(proj_no, large_category, medium_category, small_category, language_category);

        return NextResponse.json({ success: true, message: 'カテゴリ情報を保存しました。' });
    } catch (error: any) {
        console.error('Categories POST API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}