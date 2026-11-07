import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT 
        c.proj_customer_code AS proj_no,
        c.proj_customer,
        COALESCE(ct.proj_ct_1, '') AS proj_ct_1,
        COALESCE(ct.proj_ct_2, '') AS proj_ct_2,
        COALESCE(ct.proj_ct_3, '') AS proj_ct_3,
        COALESCE(ct.proj_ct_4, ' ') AS proj_ct_4,
        COALESCE(d.proj_issue, '') AS proj_issue,
        COALESCE(d.proj_request, '') AS proj_request,
        COALESCE(d.proj_possible, '') AS proj_possible,
        COALESCE(d.proj_date_1, '') AS proj_date_1,
        COALESCE(d.proj_date_2, '') AS proj_date_2,
        COALESCE(t.proj_format, '') AS proj_format,
        COALESCE(t.proj_qty_format, '') AS proj_qty_format,
        COALESCE(t.proj_char_count, 0) AS proj_char_count,
        COALESCE(t.proj_count, 0) AS proj_count,
        COALESCE(pc.large_category, '') AS large_category,
        COALESCE(pc.medium_category, '') AS medium_category,
        COALESCE(pc.small_category, '') AS small_category,
        COALESCE(pc.language_category, '') AS language_category,
        COALESCE(pp.proj_partner_name, '') AS proj_partner_name,
        '' AS intp_name_en
      FROM project_customer c
      LEFT JOIN project_contents ct ON c.proj_customer_code = ct.proj_ct_code
      LEFT JOIN project_date d ON c.proj_customer_code = d.proj_date_code
      LEFT JOIN project_text t ON c.proj_customer_code = t.proj_text_code
      LEFT JOIN project_categories pc ON c.proj_customer_code = pc.proj_no
      LEFT JOIN project_partner pp ON pp.proj_partner_no = c.proj_customer_code
      GROUP BY c.proj_customer_code
    `);

    const rows = stmt.all();
    return NextResponse.json(rows);

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    const errStack = error instanceof Error ? error.stack : '';
    console.error('Projects GET API Critical Error:', errMessage, errStack);
    return NextResponse.json({ error: errMessage }, { status: 500 });
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

    // 既存データの取得（差分検出用）
    const existingStmt = db.prepare(`
      SELECT 
        c.proj_customer,
        COALESCE(ct.proj_ct_1, '') AS proj_ct_1,
        COALESCE(ct.proj_ct_2, '') AS proj_ct_2,
        COALESCE(ct.proj_ct_3, '') AS proj_ct_3,
        COALESCE(ct.proj_ct_4, '') AS proj_ct_4,
        COALESCE(d.proj_issue, '') AS proj_issue,
        COALESCE(d.proj_request, '') AS proj_request,
        COALESCE(d.proj_possible, '') AS proj_possible,
        COALESCE(d.proj_date_1, '') AS proj_date_1,
        COALESCE(d.proj_date_2, '') AS proj_date_2,
        COALESCE(t.proj_format, '') AS proj_format,
        COALESCE(t.proj_qty_format, '') AS proj_qty_format,
        COALESCE(t.proj_char_count, 0) AS proj_char_count,
        COALESCE(t.proj_count, 0) AS proj_count,
        COALESCE(pc.large_category, '') AS large_category,
        COALESCE(pc.medium_category, '') AS medium_category,
        COALESCE(pc.small_category, '') AS small_category,
        COALESCE(pc.language_category, '') AS language_category,
        COALESCE(pp.proj_partner_name, '') AS proj_partner_name,
        '' AS intp_name_en
      FROM project_customer c
      LEFT JOIN project_contents ct ON c.proj_customer_code = ct.proj_ct_code
      LEFT JOIN project_date d ON c.proj_customer_code = d.proj_date_code
      LEFT JOIN project_text t ON c.proj_customer_code = t.proj_text_code
      LEFT JOIN project_categories pc ON c.proj_customer_code = pc.proj_no
      LEFT JOIN project_partner pp ON pp.proj_partner_no = c.proj_customer_code
      WHERE c.proj_customer_code = ?
    `);

    const oldData: any = existingStmt.get(proj_no);

    const transaction = db.transaction(() => {
      // 1. 顧客情報 (project_customer) の UPSERT
      const custExists = db.prepare(`SELECT 1 FROM project_customer WHERE proj_customer_code = ?`).get(proj_no);
      if (custExists) {
        db.prepare(`UPDATE project_customer SET proj_customer = ? WHERE proj_customer_code = ?`).run(proj_customer, proj_no);
      } else {
        db.prepare(`INSERT INTO project_customer (proj_customer_code, proj_customer) VALUES (?, ?)`).run(proj_no, proj_customer);
      }

      // 2. コンテンツ情報 (project_contents) の UPSERT
      const ctExists = db.prepare(`SELECT 1 FROM project_contents WHERE proj_ct_code = ?`).get(proj_no);
      if (ctExists) {
        db.prepare(`UPDATE project_contents SET proj_ct_1 = ?, proj_ct_2 = ?, proj_ct_3 = ?, proj_ct_4 = ? WHERE proj_ct_code = ?`).run(proj_ct_1 || '', proj_ct_2 || '', proj_ct_3 || '', proj_ct_4 || '', proj_no);
      } else {
        db.prepare(`INSERT INTO project_contents (proj_ct_code, proj_ct_1, proj_ct_2, proj_ct_3, proj_ct_4) VALUES (?, ?, ?, ?, ?)`).run(proj_no, proj_ct_1 || '', proj_ct_2 || '', proj_ct_3 || '', proj_ct_4 || '');
      }

      // 3. 日付情報 (project_date) の UPSERT
      const dateExists = db.prepare(`SELECT 1 FROM project_date WHERE proj_date_code = ?`).get(proj_no);
      if (dateExists) {
        db.prepare(`UPDATE project_date SET proj_issue = ?, proj_request = ?, proj_possible = ?, proj_date_1 = ?, proj_date_2 = ? WHERE proj_date_code = ?`).run(proj_issue || '', proj_request || '', proj_possible || '', proj_date_1 || '', proj_date_2 || '', proj_no);
      } else {
        db.prepare(`INSERT INTO project_date (proj_date_code, proj_issue, proj_request, proj_possible, proj_date_1, proj_date_2) VALUES (?, ?, ?, ?, ?, ?)`).run(proj_no, proj_issue || '', proj_request || '', proj_possible || '', proj_date_1 || '', proj_date_2 || '');
      }

      // 4. テキスト・数値情報 (project_text) の UPSERT
      const textExists = db.prepare(`SELECT 1 FROM project_text WHERE proj_text_code = ?`).get(proj_no);
      if (textExists) {
        db.prepare(`UPDATE project_text SET proj_format = ?, proj_qty_format = ?, proj_char_count = ?, proj_count = ? WHERE proj_text_code = ?`).run(proj_format || '', proj_qty_format || '', proj_char_count || 0, proj_count || 0, proj_no);
      } else {
        db.prepare(`INSERT INTO project_text (proj_text_code, proj_format, proj_qty_format, proj_char_count, proj_count) VALUES (?, ?, ?, ?, ?)`).run(proj_no, proj_format || '', proj_qty_format || '', proj_char_count || 0, proj_count || 0);
      }

      // 5. カテゴリ情報 (project_categories) の UPSERT
      const catExists = db.prepare(`SELECT 1 FROM project_categories WHERE proj_no = ?`).get(proj_no);
      if (catExists) {
        db.prepare(`UPDATE project_categories SET large_category = ?, medium_category = ?, small_category = ?, language_category = ? WHERE proj_no = ?`).run(large_category || '', medium_category || '', small_category || '', language_category || '', proj_no);
      } else {
        db.prepare(`INSERT INTO project_categories (proj_no, large_category, medium_category, small_category, language_category) VALUES (?, ?, ?, ?, ?)`).run(proj_no, large_category || '', medium_category || '', small_category || '', language_category || '');
      }

      // 6. パートナー情報 (project_partner) の UPSERT
      try {
        const partExists = db.prepare(`SELECT 1 FROM project_partner WHERE proj_partner_no = ?`).get(proj_no);
        if (partExists) {
          db.prepare(`UPDATE project_partner SET proj_partner_name = ? WHERE proj_partner_no = ?`).run(proj_partner_name || '', proj_no);
        } else {
          db.prepare(`INSERT INTO project_partner (proj_partner_no, proj_partner_name) VALUES (?, ?)`).run(proj_no, proj_partner_name || '');
        }
      } catch (e: unknown) {
        const subErrMsg = e instanceof Error ? e.message : 'Unknown error';
        console.warn('project_partner save skipped', subErrMsg);
      }

      // 7. 変更履歴（project_audit_logs）への差分記録
      const auditStmt = db.prepare(`
        INSERT INTO project_audit_logs (proj_no, action_type, column_name, old_value, new_value)
        VALUES (?, ?, ?, ?, ?)
      `);

      const newData: { [key: string]: any } = {
        proj_customer,
        large_category: large_category || '',
        medium_category: medium_category || '',
        small_category: small_category || '',
        language_category: language_category || '',
        proj_partner_name: proj_partner_name || '',
        intp_name_en: intp_name_en || '',
        proj_ct_1: proj_ct_1 || '',
        proj_ct_2: proj_ct_2 || '',
        proj_ct_3: proj_ct_3 || '',
        proj_ct_4: proj_ct_4 || '',
        proj_issue: proj_issue || '',
        proj_request: proj_request || '',
        proj_possible: proj_possible || '',
        proj_date_1: proj_date_1 || '',
        proj_date_2: proj_date_2 || '',
        proj_format: proj_format || '',
        proj_qty_format: proj_qty_format || '',
        proj_char_count: proj_char_count || 0,
        proj_count: proj_count || 0,
      };

      if (!oldData) {
        for (const [col, newVal] of Object.entries(newData)) {
          auditStmt.run(proj_no, 'INSERT', col, '', String(newVal));
        }
      } else {
        for (const [col, newVal] of Object.entries(newData)) {
          const oldVal = oldData[col] !== undefined && oldData[col] !== null ? String(oldData[col]) : '';
          const newStrVal = String(newVal);

          if (oldVal !== newStrVal) {
            auditStmt.run(proj_no, 'UPDATE', col, oldVal, newStrVal);
          }
        }
      }
    });

    transaction();

    return NextResponse.json({ success: true, message: 'プロジェクト情報を保存し、変更履歴を記録しました。' });

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    const errStack = error instanceof Error ? error.stack : '';
    console.error('Projects POST API Critical Error:', errMessage, errStack);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}