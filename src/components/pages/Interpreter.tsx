'use client';
import { useState, useEffect } from 'react';
import InterpreterFormModal from './InterpreterFormModal'; // ※ Interpreter.tsx と同じ階層に置く場合のパスです

interface Interpreter {
    intp_no: number;
    intp_name_en: string;
    intp_name_kanji?: string;
    intp_email?: string;
    intp_add?: string;
}

export default function Interpreter() {
    const [interpreters, setInterpreters] = useState<Interpreter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // モーダルの開閉を管理するステート

    const loadInterpreters = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/interpreter');
            if (!response.ok) {
                throw new Error(`通訳者情報の取得に失敗しました (${response.status})`);
            }

            const data: Interpreter[] = await response.json();
            setInterpreters(data);
        } catch (err) {
            console.error('Interpreters API Fetch Error:', err);
            setError(err instanceof Error ? err.message : '通訳者情報を取得できませんでした。');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadInterpreters();
    }, []);

    return (
        <div className="card" style={{ padding: '24px' }}>
            {/* タイトルと新規登録ボタンを横並びに配置 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ marginBottom: '4px', fontSize: '24px' }}>Interpreter</h1>
                    <p style={{ color: '#666', margin: 0 }}>通訳者一覧（データベース結合データ連携）</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#21559d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    + 新規登録
                </button>
            </div>

            {loading ? (
                <p style={{ color: '#888' }}>読み込み中...</p>
            ) : error ? (
                <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', color: '#555' }}>
                                <th style={{ padding: '12px 8px' }}>ID</th>
                                <th style={{ padding: '12px 8px' }}>名前 (英語 / 漢字)</th>
                                <th style={{ padding: '12px 8px' }}>メールアドレス</th>
                                <th style={{ padding: '12px 8px' }}>住所</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interpreters.map((intp) => (
                                <tr key={intp.intp_no} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{intp.intp_no}</td>
                                    <td style={{ padding: '12px 8px' }}>
                                        {intp.intp_name_en} {intp.intp_name_kanji ? `(${intp.intp_name_kanji})` : ''}
                                    </td>
                                    <td style={{ padding: '12px 8px' }}>{intp.intp_email || '-'}</td>
                                    <td style={{ padding: '12px 8px' }}>{intp.intp_add || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 新規登録用モーダルウィンドウ */}
            <InterpreterFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitSuccess={() => {
                    // 登録成功時に一覧データを再取得して画面を更新する
                    void loadInterpreters();
                }}
            />
        </div>
    );
}