'use client';
import React, { useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
}

export default function ProjectFormModal({ isOpen, onClose, onSubmitSuccess }: ModalProps) {
    const [activeTab, setActiveTab] = useState<'basic' | 'contents' | 'date' | 'text'>('basic');
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        proj_no: '',
        proj_customer: '',
        proj_partner_name: '',
        intp_name_en: '',
        // カテゴリ
        large_category: '',
        medium_category: '',
        small_category: '',
        language_category: '',
        // コンテンツ
        proj_ct_1: '',
        proj_ct_2: '',
        proj_ct_3: '',
        proj_ct_4: '',
        // 日付・スケジュール
        proj_issue: '',
        proj_request: '',
        proj_possible: '',
        proj_date_1: '',
        proj_date_2: '',
        // テキスト・フォーマット
        proj_format: '',
        proj_qty_format: '',
        proj_char_count: 0,
        proj_count: 0,
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name.includes('count') ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage(null);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error(`プロジェクトの登録に失敗しました (${res.status})`);
            }

            alert('プロジェクト情報の登録が完了しました');
            if (onSubmitSuccess) onSubmitSuccess();
            onClose();
        } catch (err) {
            console.error('Submit Error:', err);
            setErrorMessage(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.container} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#f8fafc' }}>プロジェクト新規登録</h2>
                    <button style={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div style={styles.tabs}>
                    <button type="button" style={activeTab === 'basic' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('basic')}>基本・カテゴリ</button>
                    <button type="button" style={activeTab === 'contents' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('contents')}>コンテンツ (CT)</button>
                    <button type="button" style={activeTab === 'date' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('date')}>日付・スケジュール</button>
                    <button type="button" style={activeTab === 'text' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('text')}>フォーマット・数値</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.body}>
                        {errorMessage && <p style={{ color: '#ef4444', marginBottom: '16px' }}>{errorMessage}</p>}

                        {/* 基本情報・カテゴリ・パートナー・通訳者 */}
                        {activeTab === 'basic' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>案件番号 (proj_no) *</label>
                                    <input type="text" name="proj_no" value={formData.proj_no} onChange={handleChange} style={styles.input} required placeholder=" 例: P-001" />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>顧客名 (proj_customer) *</label>
                                    <input type="text" name="proj_customer" value={formData.proj_customer} onChange={handleChange} style={styles.input} required placeholder=" 株式会社A" />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>パートナー名 (proj_partner_name)</label>
                                    <input type="text" name="proj_partner_name" value={formData.proj_partner_name} onChange={handleChange} style={styles.input} placeholder=" パートナー名" />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>通訳者名 英語 (intp_name_en)</label>
                                    <input type="text" name="intp_name_en" value={formData.intp_name_en} onChange={handleChange} style={styles.input} placeholder=" Interpreter Name" />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>大カテゴリ</label>
                                    <select name="large_category" value={formData.large_category} onChange={handleChange} style={styles.input}>
                                        <option value="">選択してください</option>
                                        <option value="四半期決算短信">四半期決算短信</option>
                                        <option value="決算短信">決算短信</option>
                                        <option value="リリース">リリース</option>
                                        <option value="IR資料">IR資料</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>中カテゴリ</label>
                                    <select name="medium_category" value={formData.medium_category} onChange={handleChange} style={styles.input}>
                                        <option value="">選択してください</option>
                                        <option value="第一">第一</option>
                                        <option value="第二">第二</option>
                                        <option value="第三">第三</option>
                                        <option value="第四">第四</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>小カテゴリ</label>
                                    <input type="text" name="small_category" value={formData.small_category} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>言語カテゴリ</label>
                                    <select name="language_category" value={formData.language_category} onChange={handleChange} style={styles.input}>
                                        <option value="">選択してください</option>
                                        <option value="英訳">英訳</option>
                                        <option value="和訳">和訳</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* コンテンツ (CT) */}
                        {activeTab === 'contents' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>CT 1</label>
                                    <input type="text" name="proj_ct_1" value={formData.proj_ct_1} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>CT 2</label>
                                    <input type="text" name="proj_ct_2" value={formData.proj_ct_2} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>CT 3</label>
                                    <input type="text" name="proj_ct_3" value={formData.proj_ct_3} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>CT 4</label>
                                    <input type="text" name="proj_ct_4" value={formData.proj_ct_4} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                        )}

                        {/* 日付・スケジュール */}
                        {activeTab === 'date' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>発行日 (proj_issue)</label>
                                    <input type="text" name="proj_issue" value={formData.proj_issue} onChange={handleChange} style={styles.input} placeholder="YYYY-MM-DD" />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>リクエスト (proj_request)</label>
                                    <input type="text" name="proj_request" value={formData.proj_request} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>可能日 (proj_possible)</label>
                                    <input type="text" name="proj_possible" value={formData.proj_possible} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>日付 1 (proj_date_1)</label>
                                    <input type="text" name="proj_date_1" value={formData.proj_date_1} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>日付 2 (proj_date_2)</label>
                                    <input type="text" name="proj_date_2" value={formData.proj_date_2} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                        )}

                        {/* テキスト・フォーマット・数値 */}
                        {activeTab === 'text' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>フォーマット (proj_format)</label>
                                    <input type="text" name="proj_format" value={formData.proj_format} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>数量形式 (proj_qty_format)</label>
                                    <input type="text" name="proj_qty_format" value={formData.proj_qty_format} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>文字数 (proj_char_count)</label>
                                    <input type="number" name="proj_char_count" value={formData.proj_char_count} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>カウント (proj_count)</label>
                                    <input type="number" name="proj_count" value={formData.proj_count} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={styles.footer}>
                        <button type="button" style={styles.cancelBtn} onClick={onClose} disabled={submitting}>
                            キャンセル
                        </button>
                        <button type="submit" style={styles.saveBtn} disabled={submitting}>
                            {submitting ? '保存中...' : '保存する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    container: {
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        width: '90%',
        maxWidth: '650px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
    },
    header: {
        padding: '16px 24px',
        backgroundColor: '#111827',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        fontSize: '1.5rem',
        cursor: 'pointer',
    },
    tabs: {
        display: 'flex',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #334155',
    },
    tabBtn: {
        flex: 1,
        padding: '12px 8px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#94a3b8',
        fontSize: '0.85rem',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
    },
    activeTabBtn: {
        flex: 1,
        padding: '12px 8px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#38bdf8',
        fontSize: '0.85rem',
        cursor: 'pointer',
        borderBottom: '2px solid #38bdf8',
        fontWeight: 600,
    },
    body: {
        padding: '20px 24px',
        maxHeight: '60vh',
        overflowY: 'auto',
    },
    formGroup: {
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        fontSize: '0.85rem',
        color: '#cbd5e1',
        marginBottom: '6px',
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '6px',
        color: '#f8fafc',
        outline: 'none',
        boxSizing: 'border-box',
    },
    footer: {
        padding: '16px 24px',
        backgroundColor: '#111827',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
    },
    cancelBtn: {
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        backgroundColor: '#334155',
        color: '#f8fafc',
        border: 'none',
    },
    saveBtn: {
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        backgroundColor: '#21559d',
        color: '#ffffff',
        border: 'none',
        fontWeight: 600,
    },
};