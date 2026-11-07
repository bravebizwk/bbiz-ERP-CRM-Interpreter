'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProjectFormModal from './ProjectFormModal';

interface Project {
    proj_no: string;
    proj_customer: string;
    proj_ct_1: string;
    proj_ct_2: string;
    proj_ct_3: string;
    proj_ct_4: string;
    proj_issue: string;
    proj_request: string;
    proj_possible: string;
    proj_date_1: string;
    proj_date_2: string;
    proj_format: string;
    proj_qty_format: string;
    proj_char_count: number;
    proj_count: number;
    large_category?: string;
    medium_category?: string;
    small_category?: string;
    language_category?: string;
    proj_partner_code?: string;
    intp_name_en?: string;
    status?: string; // 👈 ステータス用プロパティを追加
}

export default function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [customerFilter, setCustomerFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // どのマスター項目のモーダルを開いているかを管理（nullなら閉じてる状態）
    const [activeMasterModal, setActiveMasterModal] = useState<string | null>(null);

    // ヘッダーのスタイル（ここで文字色などを一括管理）
    const thStyle: React.CSSProperties = {
        padding: '12px 8px',
        color: '#8ed5f8c5',
        textAlign: 'left',
    };

    // 💡 ステータスに応じたバッジの配色関数を追加
    const getStatusStyle = (status: string = '確認中') => {
        switch (status) {
            case '確認中':
                return { backgroundColor: '#96d7df', color: '#4d86b9' };
            case '進行中':
                return { backgroundColor: '#fef7e0', color: '#5474a0' };
            case '完了':
                return { backgroundColor: '#eebf8e', color: '#7e238c' };
            default:
                return { backgroundColor: '#f1f3f4', color: '#3c4043' };
        }
    };

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/projects');
            if (!response.ok) {
                throw new Error(`プロジェクト情報の取得に失敗しました (${response.status})`);
            }
            const data: Project[] = await response.json();
            setProjects(data);
        } catch (err) {
            console.error('Projects API Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadProjects();
    }, []);

    const filteredProjects = projects.filter((proj) => {
        return customerFilter === "" || proj.proj_customer === customerFilter;
    });

    // ステータスの循環リスト
    const STATUS_CYCLE = ['確認中', '進行中', '完了'];

    // ステータスをクリックしたときの処理
    const handleStatusClick = async (currentOrder: Project) => {
        const currentStatus = currentOrder.status || '確認中';
        const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
        const nextStatus = currentIndex !== -1 && currentIndex < STATUS_CYCLE.length - 1
            ? STATUS_CYCLE[currentIndex + 1]
            : STATUS_CYCLE[0];

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proj_no: currentOrder.proj_no,
                    proj_customer: currentOrder.proj_customer,
                    status: nextStatus,
                }),
            });

            if (!response.ok) {
                throw new Error('ステータスの更新に失敗しました。');
            }

            // 画面上のステータスを即座に反映させるためローカルステートを更新
            setProjects(prev => prev.map(p => p.proj_no === currentOrder.proj_no ? { ...p, status: nextStatus } : p));

        } catch (err) {
            console.error('Status Update Error:', err);
            alert('ステータスの変更に失敗しました。');
        }
    };

    return (
        <div className="card">
            <div className="card-order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h1 style={{ marginBottom: '4px', fontSize: '24px' }}>Projects</h1>
                    <p style={{ color: '#666', margin: 0 }}></p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2279a2ba',
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

            <div className="orders-select-filter-bar-vertual" style={{ margin: '16px 0' }}>
                <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">顧客名（全て）</option>
                    {[...new Set(projects.map((p) => p.proj_customer))].map((customer) => (
                        <option key={customer} value={customer}>
                            {customer}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p style={{ color: '#888' }}>読み込み中...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #75abdb' }}>
                                <th style={thStyle}>案件番号</th>
                                <th style={{ ...thStyle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveMasterModal('customer')} title="クリックして顧客マスタを管理">ステータス / 顧客名</th>
                                <th style={{ ...thStyle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveMasterModal('project_partner')} title="クリックしてパートナーマスタを管理">Partner</th>
                                <th style={{ ...thStyle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveMasterModal('interpreter')} title="クリックして翻訳者マスタを管理">翻訳</th>
                                <th style={{ ...thStyle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveMasterModal('category')} title="クリックして大カテゴリマスタを管理">大カテゴリ</th>
                                <th style={{ ...thStyle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveMasterModal('category')} title="クリックして中カテゴリマスタを管理">中カテゴリ</th>
                                <th style={{ ...thStyle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveMasterModal('category')} title="クリックして小カテゴリマスタを管理">小カテゴリ</th>
                                <th style={thStyle}>文字数</th>
                                <th style={thStyle}>量</th>
                                <th style={{ ...thStyle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveMasterModal('language')} title="クリックして言語マスタを管理">言語</th>
                                <th style={thStyle}>発行日</th>
                                <th style={thStyle}>要求日</th>
                                <th style={thStyle}>可能日</th>
                                <th style={{ ...thStyle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveMasterModal('format')} title="クリックして形式マスタを管理">形式</th>
                                <th style={{ ...thStyle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveMasterModal('format')} title="クリックして数量形式マスタを管理">数量形式</th>
                            </tr>
                        </thead>
                        <tbody>
                                {filteredProjects.map((proj, index) => (
                                    <tr key={`${proj.proj_no}-${index}`} style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '12px 8px' }}>
                                        <Link
                                            href={`/projects/${proj.proj_no}`}
                                            style={{ color: '#a3f8fc', textDecoration: 'underline', fontWeight: 500 }}
                                        >
                                            {proj.proj_no}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '12px 8px' }}>{proj.proj_customer || '-'}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.proj_partner_code || '-'}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.intp_name_en || '-'}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.large_category || '-'}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.medium_category || '-'}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.small_category || '-'}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.proj_char_count}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.proj_count}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.language_category || '-'}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.proj_issue}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.proj_request}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.proj_possible}</td>
                                    <td>                                        {/* 💡 各行のステータスバッジ（クリックで循環） */}
                                        <span
                                            onClick={() => handleStatusClick(proj)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                                transition: 'opacity 0.2s',
                                                ...getStatusStyle(proj.status)
                                            }}
                                            title="クリックしてステータスを変更"
                                        >
                                            {proj.status || '確認中'}
                                        </span></td>
                                    <td style={{ padding: '12px 8px' }}>{proj.proj_format}</td>
                                    <td style={{ padding: '12px 8px' }}>{proj.proj_qty_format}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ProjectFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitSuccess={() => {
                    void loadProjects();
                }}
            />
        </div>
    );
}