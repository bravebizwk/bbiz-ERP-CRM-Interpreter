'use client';

import React, { useState } from 'react';
import './InterpreterFormModal.scss'; //スタイル定義用

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
}

export default function InterpreterFormModal({ isOpen, onClose, onSubmitSuccess }: ModalProps) {
    const [activeTab, setActiveTab] = useState<'basic' | 'info' | 'price' | 'bank' | 'contact'>('basic');

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
        try {
            const res = await fetch('/api/interpreter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                alert('保存が完了しました');
                if (onSubmitSuccess) onSubmitSuccess();
                onClose();
            }
        } catch (err) {
            console.error('保存エラー:', err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>通訳者情報の新規登録</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* タブナビゲーション */}
                <div className="modal-tabs">
                    <button className={activeTab === 'basic' ? 'active' : ''} onClick={() => setActiveTab('basic')}>基本情報</button>
                    <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>住所・国</button>
                    <button className={activeTab === 'price' ? 'active' : ''} onClick={() => setActiveTab('price')}>単価・区分</button>
                    <button className={activeTab === 'bank' ? 'active' : ''} onClick={() => setActiveTab('bank')}>口座情報</button>
                    <button className={activeTab === 'contact' ? 'active' : ''} onClick={() => setActiveTab('contact')}>連絡先</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* 基本情報 (interpreter) */}
                        {activeTab === 'basic' && (
                            <div className="form-section">
                                <div className="form-group">
                                    <label>氏名（漢字）</label>
                                    <input type="text" name="intp_name_kanji" value={formData.intp_name_kanji} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>氏名（英語）</label>
                                    <input type="text" name="intp_name_en" value={formData.intp_name_en} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>ミドルネーム</label>
                                    <input type="text" name="intp_name_middle" value={formData.intp_name_middle} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {/* 住所・国 (interpreter_info) */}
                        {activeTab === 'info' && (
                            <div className="form-section">
                                <div className="form-group">
                                    <label>国籍 / 居住国</label>
                                    <input type="text" name="intp_country" value={formData.intp_country} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>住所（英語）</label>
                                    <input type="text" name="intp_add" value={formData.intp_add} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>住所（漢字）</label>
                                    <input type="text" name="intp_add_kanji" value={formData.intp_add_kanji} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {/* 単価・区分 (interpreter_px) */}
                        {activeTab === 'price' && (
                            <div className="form-section">
                                <div className="form-group">
                                    <label>カテゴリ 1</label>
                                    <input type="text" name="intp_cat_1" value={formData.intp_cat_1} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>カテゴリ 2</label>
                                    <input type="text" name="intp_cat_2" value={formData.intp_cat_2} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>単価 (px)</label>
                                    <input type="number" step="0.01" name="intp_px" value={formData.intp_px} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {/* 銀行情報 (interpreter_bank) */}
                        {activeTab === 'bank' && (
                            <div className="form-section">
                                <div className="form-group">
                                    <label>銀行名</label>
                                    <input type="text" name="intp_bank" value={formData.intp_bank} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>SWIFTコード</label>
                                    <input type="text" name="intp_swiftcode" value={formData.intp_swiftcode} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>口座番号</label>
                                    <input type="text" name="intp_bankaccount" value={formData.intp_bankaccount} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>オンライン決済名 (PayPal等)</label>
                                    <input type="text" name="intp_onlinepay" value={formData.intp_onlinepay} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>オンライン決済アカウント</label>
                                    <input type="text" name="intp_onlinepayaccount" value={formData.intp_onlinepayaccount} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {/* 連絡先 (interpreter_contact) */}
                        {activeTab === 'contact' && (
                            <div className="form-section">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="intp_email" value={formData.intp_email} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>携帯番号</label>
                                    <input type="text" name="intp_mobile" value={formData.intp_mobile} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>SNS (Main)</label>
                                    <input type="text" name="intp_sns" value={formData.intp_sns} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>SNS 1</label>
                                    <input type="text" name="intp_sns1" value={formData.intp_sns1} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>SNS 2</label>
                                    <input type="text" name="intp_sns2" value={formData.intp_sns2} onChange={handleChange} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>キャンセル</button>
                        <button type="submit" className="save-btn">保存する</button>
                    </div>
                </form>
            </div>
        </div>
    );
}