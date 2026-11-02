'use client';

import React, { useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
}

export default function InterpreterFormModal({ isOpen, onClose, onSubmitSuccess }: ModalProps) {
    const [activeTab, setActiveTab] = useState<'basic' | 'info' | 'price' | 'bank' | 'contact'>('basic');
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 各テーブルのフォーム状態管理
    const [formData, setFormData] = useState({
        // interpreter
        intp_name_en: '',
        intp_name_kanji: '',
        intp_name_middle: '',
        // interpreter_info
        intp_country: '',
        intp_add: '',
        intp_add_kanji: '',
        // interpreter_px
        intp_cat_1: '',
        intp_cat_2: '',
        intp_px: 0,
        // interpreter_bank
        intp_bank: '',
        intp_swiftcode: '',
        intp_bankaccount: '',
        intp_onlinepay: '',
        intp_onlinepayaccount: '',
        // interpreter_contact
        intp_email: '',
        intp_mobile: '',
        intp_sns: '',
        intp_sns1: '',
        intp_sns2: '',
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage(null);

        try {
            const res = await fetch('/api/interpreter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error(`登録に失敗しました (${res.status})`);
            }

            alert('通訳者情報の登録が完了しました');
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
                    <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#f8fafc' }}>通訳者新規登録</h2>
                    <button style={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                {/* タブナビゲーション */}
                <div style={styles.tabs}>
                    <button style={activeTab === 'basic' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('basic')}>基本情報</button>
                    <button style={activeTab === 'info' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('info')}>住所・国</button>
                    <button style={activeTab === 'price' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('price')}>単価・区分</button>
                    <button style={activeTab === 'bank' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('bank')}>口座情報</button>
                    <button style={activeTab === 'contact' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('contact')}>連絡先</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.body}>
                        {errorMessage && <p style={{ color: '#ef4444', marginBottom: '16px' }}>{errorMessage}</p>}

                        {/* 基本情報 (interpreter) */}
                        {activeTab === 'basic' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>氏名（英語） *</label>
                                    <input type="text" name="intp_name_en" value={formData.intp_name_en} onChange={handleChange} style={styles.input} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>氏名（漢字）</label>
                                    <input type="text" name="intp_name_kanji" value={formData.intp_name_kanji} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>ミドルネーム</label>
                                    <input type="text" name="intp_name_middle" value={formData.intp_name_middle} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                        )}

                        {/* 住所・国 (interpreter_info) */}
                        {activeTab === 'info' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>国 / 地域</label>
                                    <input type="text" name="intp_country" value={formData.intp_country} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>住所（英語）</label>
                                    <input type="text" name="intp_add" value={formData.intp_add} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>住所（漢字）</label>
                                    <input type="text" name="intp_add_kanji" value={formData.intp_add_kanji} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                        )}

                        {/* 単価・区分 (interpreter_px) */}
                        {activeTab === 'price' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>カテゴリ 1</label>
                                    <input type="text" name="intp_cat_1" value={formData.intp_cat_1} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>カテゴリ 2</label>
                                    <input type="text" name="intp_cat_2" value={formData.intp_cat_2} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>単価 (px)</label>
                                    <input type="number" step="0.01" name="intp_px" value={formData.intp_px} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                        )}

                        {/* 銀行情報 (interpreter_bank) */}
                        {activeTab === 'bank' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>銀行名</label>
                                    <input type="text" name="intp_bank" value={formData.intp_bank} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SWIFTコード</label>
                                    <input type="text" name="intp_swiftcode" value={formData.intp_swiftcode} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>口座番号</label>
                                    <input type="text" name="intp_bankaccount" value={formData.intp_bankaccount} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>オンライン決済名</label>
                                    <input type="text" name="intp_onlinepay" value={formData.intp_onlinepay} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>オンライン決済アカウント</label>
                                    <input type="text" name="intp_onlinepayaccount" value={formData.intp_onlinepayaccount} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                        )}

                        {/* 連絡先 (interpreter_contact) */}
                        {activeTab === 'contact' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>メールアドレス</label>
                                    <input type="email" name="intp_email" value={formData.intp_email} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>携帯電話番号</label>
                                    <input type="text" name="intp_mobile" value={formData.intp_mobile} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SNS</label>
                                    <input type="text" name="intp_sns" value={formData.intp_sns} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SNS 1</label>
                                    <input type="text" name="intp_sns1" value={formData.intp_sns1} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SNS 2</label>
                                    <input type="text" name="intp_sns2" value={formData.intp_sns2} onChange={handleChange} style={styles.input} />
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

// 簡易的なインラインスタイル定義（SCSSファイルに切り出しても問題ありません）
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