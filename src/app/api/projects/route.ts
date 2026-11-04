import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // 確実に存在する基本テーブルのみで結合し、存在しない可能性のあるテーブルは安全に処理します
    const stmt = db.prepare(`
      SELECT 
        c.proj_no,
        c.proj_customer,
        ct.proj_ct_1,
        ct.proj_ct_2,
        ct.proj_ct_3,
        ct.proj_ct_4,
        d.proj_issue,
        d.proj_request,
        d.proj_possible,
        d.proj_date_1,
        d.proj_date_2,
        t.proj_format,
        t.proj_qty_format,
        t.proj_char_count,
        t.proj_count,
        COALESCE(pc.large_category, '') AS large_category,
        COALESCE(pc.medium_category, '') AS medium_category,
        COALESCE(pc.small_category, '') AS small_category,
        COALESCE(pc.language_category, '') AS language_category,
        COALESCE(pp.proj_partner_name, '') AS proj_partner_name,
        '' AS intp_name_en
      FROM project_customer c
      LEFT JOIN project_contents ct ON c.proj_no = ct.proj_no
      LEFT JOIN project_date d ON c.proj_no = d.proj_no
      LEFT JOIN project_text t ON c.proj_no = t.proj_no
      LEFT JOIN project_categories pc ON c.proj_no = pc.proj_no
      LEFT JOIN project_partner pp ON c.proj_no = pp.proj_no
    `);

    const rows = stmt.all();
    return NextResponse.json(rows);

  } catch (error: any) {
    console.error('Projects GET API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      proj_no,
      proj_customer,
      large_category,
      medium_category,
      small_category,
      language_category,
      proj_partner_name,
      intp_name_en,
      proj_ct_1,
      proj_ct_2,
      proj_ct_3,
      proj_ct_4,
      proj_issue,
      proj_request,
      proj_possible,
      proj_date_1,
      proj_date_2,
      proj_format,
      proj_qty_format,
      proj_char_count,
      proj_count
    } = body;

    if (!proj_no || !proj_customer) {
      return NextResponse.json({ error: '案件番号と顧客名は必須です。' }, { status: 400 });
    }

    const transaction = db.transaction(() => {
      db.prepare(`INSERT OR REPLACE INTO project_customer (proj_no, proj_customer) VALUES (?, ?)`).run(proj_no, proj_customer);
      db.prepare(`INSERT OR REPLACE INTO project_contents (proj_no, proj_ct_1, proj_ct_2, proj_ct_3, proj_ct_4) VALUES (?, ?, ?, ?, ?)`).run(proj_no, proj_ct_1, proj_ct_2, proj_ct_3, proj_ct_4);
      db.prepare(`INSERT OR REPLACE INTO project_date (proj_no, proj_issue, proj_request, proj_possible, proj_date_1, proj_date_2) VALUES (?, ?, ?, ?, ?, ?)`).run(proj_no, proj_issue, proj_request, proj_possible, proj_date_1, proj_date_2);
      db.prepare(`INSERT OR REPLACE INTO project_text (proj_no, proj_format, proj_qty_format, proj_char_count, proj_count) VALUES (?, ?, ?, ?, ?)`).run(proj_no, proj_format, proj_qty_format, proj_char_count, proj_count);
      db.prepare(`INSERT OR REPLACE INTO project_categories (proj_no, large_category, medium_category, small_category, language_category) VALUES (?, ?, ?, ?, ?)`).run(proj_no, large_category || '', medium_category || '', small_category || '', language_category || '');

      try {
        db.prepare(`INSERT OR REPLACE INTO project_partner (proj_no, proj_partner_name) VALUES (?, ?)`).run(proj_no, proj_partner_name || '');
      } catch (e) {
        console.warn('project_partner save skipped:', e);
      }
    });

    transaction();

    return NextResponse.json({ success: true, message: 'プロジェクト情報を保存しました。' });

  } catch (error: any) {
    console.error('Projects POST API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
