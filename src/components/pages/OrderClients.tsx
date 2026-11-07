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
    proj_partner_name?: string;
    intp_name_en?: string;
}

export default function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [customerFilter, setCustomerFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ヘッダーのスタイル（ここで文字色などを一括管理）
    const thStyle: React.CSSProperties = {
        padding: '12px 8px',
        color: '#8ed5f8c5', // 👈 ここの色を変えれば全てに反映されます
        textAlign: 'left',
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
                                <th style={thStyle}>顧客名</th>
                                <th style={thStyle}>パートナー名</th>
                                <th style={thStyle}>通訳者名 (EN)</th>
                                <th style={thStyle}>大カテゴリ</th>
                                <th style={thStyle}>中カテゴリ</th>
                                <th style={thStyle}>小カテゴリ</th>
                                <th style={thStyle}>言語</th>
                                <th style={thStyle}>CT1</th>
                                <th style={thStyle}>CT2</th>
                                <th style={thStyle}>CT3</th>
                                <th style={thStyle}>CT4</th>
                                <th style={thStyle}>発行日</th>
                                <th style={thStyle}>リクエスト</th>
                                <th style={thStyle}>可能日</th>
                                <th style={thStyle}>フォーマット</th>
                                <th style={thStyle}>数量形式</th>
                                <th style={thStyle}>文字数</th>
                                <th style={thStyle}>カウント</th>
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
                                    </td><td style={{ padding: '12px 8px' }}>{proj.proj_customer}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_partner_name || '-'}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.intp_name_en || '-'}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.large_category || '-'}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.medium_category || '-'}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.small_category || '-'}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.language_category || '-'}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_ct_1}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_ct_2}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_ct_3}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_ct_4}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_issue}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_request}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_possible}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_format}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_qty_format}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_char_count}</td>
                                        <td style={{ padding: '12px 8px' }}>{proj.proj_count}</td></tr>
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
