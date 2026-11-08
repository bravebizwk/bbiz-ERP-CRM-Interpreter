import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// 1. 一覧取得 (GET) - project_master から高速かつ安定して取得
export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT 
        proj_no,
        proj_customer,
        proj_partner_name,
        '' AS proj_partner_code,
        intp_name_en,
        large_category,
        medium_category,
        small_category,
        language_category,
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
        proj_count,
        COALESCE(status, '確認中') AS status
      FROM project_master
      ORDER BY updated_at DESC
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

// 2. 登録・更新 & 変更履歴の記録 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      proj_no,
      proj_customer,
      large_category = '',
      medium_category = '',
      small_category = '',
      language_category = '',
      proj_partner_code = '',
      proj_partner_name = '',
      intp_name_en = '',
      proj_ct_1 = '',
      proj_ct_2 = '',
      proj_ct_3 = '',
      proj_ct_4 = '',
      proj_issue = '',
      proj_request = '',
      proj_possible = '',
      proj_date_1 = '',
      proj_date_2 = '',
      proj_format = '',
      proj_qty_format = '',
      proj_char_count = 0,
      proj_count = 0,
      status = '確認中'
    } = body;

    if (!proj_no || !proj_customer) {
      return NextResponse.json({ error: '案件番号と顧客名は必須です。' }, { status: 400 });
    }

    // 変更前データの取得 (project_master から)
    const existingStmt = db.prepare(`SELECT * FROM project_master WHERE proj_no = ?`);
    const oldData: any = existingStmt.get(proj_no);

    const transaction = db.transaction(() => {
      // 1. project_master への Upsert (新規なら INSERT、存在すれば UPDATE)
      const upsertStmt = db.prepare(`
        INSERT INTO project_master (
          proj_no, proj_customer, proj_partner_name, intp_name_en,
          large_category, medium_category, small_category, language_category,
          proj_ct_1, proj_ct_2, proj_ct_3, proj_ct_4,
          proj_issue, proj_request, proj_possible, proj_date_1, proj_date_2,
          proj_format, proj_qty_format, proj_char_count, proj_count, status, updated_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
        )
        ON CONFLICT(proj_no) DO UPDATE SET
          proj_customer = excluded.proj_customer,
          proj_partner_name = excluded.proj_partner_name,
          intp_name_en = excluded.intp_name_en,
          large_category = excluded.large_category,
          medium_category = excluded.medium_category,
          small_category = excluded.small_category,
          language_category = excluded.language_category,
          proj_ct_1 = excluded.proj_ct_1,
          proj_ct_2 = excluded.proj_ct_2,
          proj_ct_3 = excluded.proj_ct_3,
          proj_ct_4 = excluded.proj_ct_4,
          proj_issue = excluded.proj_issue,
          proj_request = excluded.proj_request,
          proj_possible = excluded.proj_possible,
          proj_date_1 = excluded.proj_date_1,
          proj_date_2 = excluded.proj_date_2,
          proj_format = excluded.proj_format,
          proj_qty_format = excluded.proj_qty_format,
          proj_char_count = excluded.proj_char_count,
          proj_count = excluded.proj_count,
          status = excluded.status,
          updated_at = CURRENT_TIMESTAMP
      `);

      upsertStmt.run(
        proj_no, proj_customer, proj_partner_name, intp_name_en,
        large_category, medium_category, small_category, language_category,
        proj_ct_1, proj_ct_2, proj_ct_3, proj_ct_4,
        proj_issue, proj_request, proj_possible, proj_date_1, proj_date_2,
        proj_format, proj_qty_format, proj_char_count, proj_count, status
      );

      // 2. project_audit_logs への差分記録
      const auditStmt = db.prepare(`
        INSERT INTO project_audit_logs (proj_no, action_type, column_name, old_value, new_value)
        VALUES (?, ?, ?, ?, ?)
      `);

      const newData: Record<string, any> = {
        proj_customer,
        proj_partner_name,
        intp_name_en,
        large_category,
        medium_category,
        small_category,
        language_category,
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
        proj_count,
        status
      };

      if (!oldData) {
        // 新規登録時 (INSERT) のログ記録
        for (const [col, newVal] of Object.entries(newData)) {
          if (newVal !== '' && newVal !== 0 && newVal !== null) {
            auditStmt.run(proj_no, 'INSERT', col, '', String(newVal));
          }
        }
      } else {
        // 更新時 (UPDATE) の差分ログ記録
        for (const [col, newVal] of Object.entries(newData)) {
          const oldVal = oldData[col] !== undefined && oldData[col] !== null ? String(oldData[col]) : '';
          const newStrVal = newVal !== undefined && newVal !== null ? String(newVal) : '';

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