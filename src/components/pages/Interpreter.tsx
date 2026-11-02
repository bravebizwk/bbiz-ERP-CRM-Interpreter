'use client';
import { useState, useEffect } from 'react';

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

    useEffect(() => {
        const loadInterpreters = async () => {
            try {
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

        void loadInterpreters();
    }, []);

    return (
        <div className="card" style={{ padding: '24px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '24px' }}>Interpreter</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>通訳者一覧（データベース結合データ連携）</p>

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
        </div>
    );
}
