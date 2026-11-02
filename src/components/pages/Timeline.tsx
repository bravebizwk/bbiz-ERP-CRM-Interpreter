'use client';
import { useState, useEffect } from 'react';

// 通訳者データの型定義
interface Interpreter {
    intp_no: number;
    intp_name_en: string;
    intp_name_kanji?: string;
    intp_email?: string;
    intp_add?: string;
}

export default function Interpreters() {
    // useState に型を指定する
    const [interpreters, setInterpreters] = useState<Interpreter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/interpreters')
            .then((res) => res.json())
            .then((data) => {
                setInterpreters(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Interpreters API Fetch Error:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="card" style={{ padding: '24px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '24px' }}>Interpreters</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>通訳者一覧（データベース結合データ連携）</p>

            {loading ? (
                <p style={{ color: '#888' }}>読み込み中...</p>
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