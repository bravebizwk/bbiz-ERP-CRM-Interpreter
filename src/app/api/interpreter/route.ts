import { loadSqlite3 } from '@/lib/sqlite';
import type { RunResult } from 'sqlite3';
import { NextResponse } from 'next/server';
import path from 'path';

// データベースのパス
const dbPath = path.resolve(process.cwd(), 'dashboard.sqlite');

// 1. 一覧取得 (GET)
export async function GET() {
    const sqlite3: typeof import('sqlite3') = loadSqlite3();
    const db = new sqlite3.Database(dbPath);

    return new Promise<NextResponse>((resolve) => {
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
                console.error('Interpreter database query failed:', err);
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            } else {
                resolve(NextResponse.json(rows));
            }
        });
    });
}

// 2. 新規登録 (POST)
export async function POST(request: Request) {
    const sqlite3: typeof import('sqlite3') = loadSqlite3();
    const db = new sqlite3.Database(dbPath);

    try {
        const body = await request.json();

        return new Promise<NextResponse>((resolve) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // 1. interpreter テーブル
                const stmtIntp = db.prepare(`
                    INSERT INTO interpreter (intp_name_en, intp_name_kanji, intp_name_middle)
                    VALUES (?, ?, ?)
                `);
                stmtIntp.run(
                    body.intp_name_en || '',
                    body.intp_name_kanji || '',
                    body.intp_name_middle || '',
                    function (this: RunResult, err: Error | null) {
                        if (err) {
                            db.run('ROLLBACK');
                            db.close();
                            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
                            return;
                        }

                        const newIntpNo = this.lastID;

                        // 2. interpreter_info テーブル
                        const stmtInfo = db.prepare(`
                            INSERT INTO interpreter_info (intp_no, intp_country, intp_add, intp_add_kanji)
                            VALUES (?, ?, ?, ?)
                        `);
                        stmtInfo.run(newIntpNo, body.intp_country || '', body.intp_add || '', body.intp_add_kanji || '');
                        stmtInfo.finalize();

                        // 3. interpreter_px テーブル
                        const stmtPx = db.prepare(`
                            INSERT INTO interpreter_px (intp_no, intp_cat_1, intp_cat_2, intp_px)
                            VALUES (?, ?, ?, ?)
                        `);
                        stmtPx.run(newIntpNo, body.intp_cat_1 || '', body.intp_cat_2 || '', Number(body.intp_px) || 0);
                        stmtPx.finalize();

                        // 4. interpreter_bank テーブル
                        const stmtBank = db.prepare(`
                            INSERT INTO interpreter_bank (intp_no, intp_bank, intp_swiftcode, intp_bankaccount, intp_onlinepay, intp_onlinepayaccount)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `);
                        stmtBank.run(
                            newIntpNo,
                            body.intp_bank || '',
                            body.intp_swiftcode || '',
                            body.intp_bankaccount || '',
                            body.intp_onlinepay || '',
                            body.intp_onlinepayaccount || ''
                        );
                        stmtBank.finalize();

                        // 5. interpreter_contact テーブル
                        const stmtContact = db.prepare(`
                            INSERT INTO interpreter_contact (intp_no, intp_email, intp_mobile, intp_sns, intp_sns1, intp_sns2)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `);
                        stmtContact.run(
                            newIntpNo,
                            body.intp_email || '',
                            body.intp_mobile || '',
                            body.intp_sns || '',
                            body.intp_sns1 || '',
                            body.intp_sns2 || '',
                            function (errContact: Error | null) {
                                if (errContact) {
                                    db.run('ROLLBACK');
                                    db.close();
                                    resolve(NextResponse.json({ error: errContact.message }, { status: 500 }));
                                    return;
                                }

                                db.run('COMMIT', (errCommit: Error | null) => {
                                    db.close();
                                    if (errCommit) {
                                        resolve(NextResponse.json({ error: errCommit.message }, { status: 500 }));
                                    } else {
                                        resolve(NextResponse.json({ success: true, intp_no: newIntpNo }, { status: 201 }));
                                    }
                                });
                            }
                        );
                        stmtContact.finalize();
                    }
                );
                stmtIntp.finalize();
            });
        });
    } catch (error) {
        db.close();
        console.error('API POST Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'サーバーエラーが発生しました' },
            { status: 500 }
        );
    }
}
