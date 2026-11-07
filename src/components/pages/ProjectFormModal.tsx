'use client';
import React, { useState, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
    initialProjNo?: string; // 👈 追加：初期案件番号を受け取るプロパティ
}

export default function ProjectFormModal({ isOpen, onClose, onSubmitSuccess, initialProjNo }: ModalProps) {
    const [activeTab, setActiveTab] = useState<'basic' | 'contents' | 'date' | 'text'>('basic');
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 各種サジェスト用および自動読み込み用のデータ保持
    const [allProjects, setAllProjects] = useState<any[]>([]);
    const [projectNoOptions, setProjectNoOptions] = useState<string[]>([]);
    const [customerOptions, setCustomerOptions] = useState<string[]>([]);
    const [partnerOptions, setPartnerOptions] = useState<string[]>([]);
    const [interpreterOptions, setInterpreterOptions] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [selectedLarge, setSelectedLarge] = useState("");
    const [selectedMedium, setSelectedMedium] = useState("");

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

    // モーダルが開いた時に各種候補データおよび全プロジェクト詳細を取得し、initialProjNo があれば反映
    useEffect(() => {
        if (!isOpen) return;

        const fetchOptionsAndLoadProject = async () => {
            try {
                const [
                    projRes,
                    custRes,
                    partRes,
                    intpRes,
                    categoryRes
                ] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/customers'),
                    fetch('/api/partners'),
                    fetch('/api/interpreters-list'),
                    fetch('/api/category-master')
                ]);

                let fetchedProjects: any[] = [];
                if (projRes.ok) {
                    fetchedProjects = await projRes.json();
                    setAllProjects(fetchedProjects);
                    setProjectNoOptions(fetchedProjects.map((p: any) => p.proj_no));
                }

                if (custRes.ok) {
                    const customers = await custRes.json();
                    setCustomerOptions(customers.map((c: any) => typeof c === 'object' && c !== null ? c.proj_customer : c));
                }

                if (partRes.ok) setPartnerOptions(await partRes.json());
                if (intpRes.ok) setInterpreterOptions(await intpRes.json());
                if (categoryRes.ok) {
                    const catData = await categoryRes.json();
                    setCategories(catData);

                    // 💡 モーダルオープン時に initialProjNo が指定されている場合、データを自動ロードする
                    if (initialProjNo && fetchedProjects.length > 0) {
                        const foundProject = fetchedProjects.find((p: any) => p.proj_no === initialProjNo);
                        if (foundProject) {
                            setFormData({
                                proj_no: foundProject.proj_no || '',
                                proj_customer: foundProject.proj_customer || '',
                                proj_partner_name: foundProject.proj_partner_name || '',
                                intp_name_en: foundProject.intp_name_en || '',
                                large_category: foundProject.large_category || '',
                                medium_category: foundProject.medium_category || '',
                                small_category: foundProject.small_category || '',
                                language_category: foundProject.language_category || '',
                                proj_ct_1: foundProject.proj_ct_1 || '',
                                proj_ct_2: foundProject.proj_ct_2 || '',
                                proj_ct_3: foundProject.proj_ct_3 || '',
                                proj_ct_4: foundProject.proj_ct_4 || '',
                                proj_issue: foundProject.proj_issue || '',
                                proj_request: foundProject.proj_request || '',
                                proj_possible: foundProject.proj_possible || '',
                                proj_date_1: foundProject.proj_date_1 || '',
                                proj_date_2: foundProject.proj_date_2 || '',
                                proj_format: foundProject.proj_format || '',
                                proj_qty_format: foundProject.proj_qty_format || '',
                                proj_char_count: foundProject.proj_char_count || 0,
                                proj_count: foundProject.proj_count || 0,
                            });

                            // カテゴリコードの逆引き
                            const largeCats = catData.filter((x: any) => x.category_type === 'LARGE');
                            const matchedLarge = largeCats.find((item: any) => item.category_name === foundProject.large_category);
                            if (matchedLarge) {
                                setSelectedLarge(matchedLarge.category_code);
                                const mediumCats = catData.filter((x: any) => x.category_type === 'MEDIUM' && x.parent_code === matchedLarge.category_code);
                                const matchedMedium = mediumCats.find((item: any) => item.category_name === foundProject.medium_category);
                                if (matchedMedium) setSelectedMedium(matchedMedium.category_code);
                            }
                        } else {
                            // 該当データがない場合は新規として案件番号だけセット
                            setFormData(prev => ({ ...prev, proj_no: initialProjNo }));
                        }
                    }
                }

            } catch (err: unknown) {
                console.error('候補データの取得に失敗しました:', err);
            }
        };

        void fetchOptionsAndLoadProject();
    }, [isOpen, initialProjNo]);

    if (!isOpen) return null;

    // カテゴリのフィルタリング定義
    const largeCategories = categories.filter(
        x => x.category_type === 'LARGE'
    );

    const mediumCategories = categories.filter(
        x =>
            x.category_type === 'MEDIUM' &&
            (!selectedLarge || x.parent_code === selectedLarge)
    );

    const smallCategories = categories.filter(
        x =>
            x.category_type === 'SMALL' &&
            (!selectedMedium || x.parent_code === selectedMedium)
    );

    const languageCategories = categories.filter(
        x => x.category_type === 'LANGUAGE'
    );

    // 一般の入力ハンドラー
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name.includes('count')
                ? Number(value)
                : value,
        }));
    };



    // 案件番号（proj_no）専用のハンドラー（入力時に既存データを自動読み込み）
    const handleProjNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputNo = e.target.value;
        setFormData(prev => ({ ...prev, proj_no: inputNo }));

        // 既存のプロジェクトデータから一致するものを検索
        const foundProject = allProjects.find(p => p.proj_no === inputNo);

        if (foundProject) {
            setFormData({
                proj_no: foundProject.proj_no || '',
                proj_customer: foundProject.proj_customer || '',
                proj_partner_name: foundProject.proj_partner_name || '',
                intp_name_en: foundProject.intp_name_en || '',
                large_category: foundProject.large_category || '',
                medium_category: foundProject.medium_category || '',
                small_category: foundProject.small_category || '',
                language_category: foundProject.language_category || '',
                proj_ct_1: foundProject.proj_ct_1 || '',
                proj_ct_2: foundProject.proj_ct_2 || '',
                proj_ct_3: foundProject.proj_ct_3 || '',
                proj_ct_4: foundProject.proj_ct_4 || '',
                proj_issue: foundProject.proj_issue || '',
                proj_request: foundProject.proj_request || '',
                proj_possible: foundProject.proj_possible || '',
                proj_date_1: foundProject.proj_date_1 || '',
                proj_date_2: foundProject.proj_date_2 || '',
                proj_format: foundProject.proj_format || '',
                proj_qty_format: foundProject.proj_qty_format || '',
                proj_char_count: foundProject.proj_char_count || 0,
                proj_count: foundProject.proj_count || 0,
            });

            const matchedLarge = largeCategories.find(item => item.category_name === foundProject.large_category);
            if (matchedLarge) setSelectedLarge(matchedLarge.category_code);

            const matchedMedium = mediumCategories.find(item => item.category_name === foundProject.medium_category);
            if (matchedMedium) setSelectedMedium(matchedMedium.category_code);
        }
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
                throw new Error(`プロジェクト情報の保存に失敗しました (${res.status})`);
            }

            alert('プロジェクト情報の保存が完了しました');
            if (onSubmitSuccess) onSubmitSuccess();
            onClose();
        } catch (err: unknown) {
            console.error('Submit Error:', err);
            const errMsg = err instanceof Error ? err.message : '予期せぬエラーが発生しました';
            setErrorMessage(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.container} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#f8fafc' }}>プロジェクト登録・編集</h2>
                    <button style={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div style={styles.tabs}>
                    <button type="button" style={activeTab === 'basic' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('basic')}>基本・カテゴリ</button>
                    <button type="button" style={activeTab === 'text' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('text')}>フォーマット・数値</button>
                    <button type="button" style={activeTab === 'date' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('date')}>日付・スケジュール</button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.body}>
                        {errorMessage && <p style={{ color: '#ef4444', marginBottom: '16px' }}>{errorMessage}</p>}

                        {activeTab === 'basic' && (
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>案件番号 (proj_no) *</label>
                                    <input
                                        type="text"
                                        name="proj_no"
                                        value={formData.proj_no}
                                        onChange={handleProjNoChange}
                                        style={styles.input}
                                        required
                                        placeholder=" 例: P-001"
                                        list="project-no-options"
                                        autoComplete="off"
                                    />
                                    <datalist id="project-no-options">
                                        {projectNoOptions.map((no, index) => (
                                            <option key={index} value={no} />
                                        ))}
                                    </datalist>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>顧客名 (proj_customer) *</label>
                                    <input
                                        type="text"
                                        name="proj_customer"
                                        value={formData.proj_customer}
                                        onChange={handleChange}
                                        style={styles.input}
                                        required
                                        placeholder=" 顧客名を選択または入力"
                                        list="customer-options"
                                        autoComplete="off"
                                    />
                                    <datalist id="customer-options">
                                        {customerOptions.map((cust, index) => (
                                            <option key={index} value={cust} />
                                        ))}
                                    </datalist>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>パートナー名 (proj_partner_name)</label>
                                    <input
                                        type="text"
                                        name="proj_partner_name"
                                        value={formData.proj_partner_name}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder=" パートナー名を選択または入力"
                                        list="partner-options"
                                        autoComplete="off"
                                    />
                                    <datalist id="partner-options">
                                        {partnerOptions.map((part, index) => (
                                            <option key={index} value={part} />
                                        ))}
                                    </datalist>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>通訳者名 英語 (intp_name_en)</label>
                                    <input
                                        type="text"
                                        name="intp_name_en"
                                        value={formData.intp_name_en}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder=" 通訳者名を選択または入力"
                                        list="interpreter-options"
                                        autoComplete="off"
                                    />
                                    <datalist id="interpreter-options">
                                        {interpreterOptions.map((intp, index) => (
                                            <option key={index} value={intp} />
                                        ))}
                                    </datalist>
                                </div>

                                {/* 大カテゴリ・中カテゴリ・小カテゴリを3つ横並び */}
                                <div style={styles.rowGroup}>
                                    <div style={styles.columnItem}>
                                        <label style={styles.label}>大カテゴリ</label>
                                        <select
                                            name="large_category"
                                            value={formData.large_category}
                                            onChange={(e) => {
                                                const selectedName = e.target.value;
                                                const foundLarge = largeCategories.find(item => item.category_name === selectedName);
                                                setSelectedLarge(foundLarge ? foundLarge.category_code : '');

                                                setFormData(prev => ({
                                                    ...prev,
                                                    large_category: selectedName,
                                                    medium_category: '',
                                                    small_category: ''
                                                }));
                                                setSelectedMedium('');
                                            }}
                                            style={styles.input}
                                        >
                                            <option value="">選択</option>
                                            {largeCategories.map((item) => (
                                                <option key={item.category_code} value={item.category_name}>
                                                    {item.category_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={styles.columnItem}>
                                        <label style={styles.label}>中カテゴリ</label>
                                        <select
                                            name="medium_category"
                                            value={formData.medium_category}
                                            onChange={(e) => {
                                                const selectedName = e.target.value;
                                                const foundMedium = mediumCategories.find(item => item.category_name === selectedName);
                                                setSelectedMedium(foundMedium ? foundMedium.category_code : '');

                                                setFormData(prev => ({
                                                    ...prev,
                                                    medium_category: selectedName,
                                                    small_category: ''
                                                }));
                                            }}
                                            style={styles.input}
                                        >
                                            <option value="">選択</option>
                                            {mediumCategories.map((item) => (
                                                <option key={item.category_code} value={item.category_name}>
                                                    {item.category_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={styles.columnItem}>
                                        <label style={styles.label}>小カテゴリ</label>
                                        <select
                                            name="small_category"
                                            value={formData.small_category}
                                            onChange={handleChange}
                                            style={styles.input}
                                        >
                                            <option value="">選択</option>
                                            {smallCategories.map((item) => (
                                                <option key={item.category_code} value={item.category_name}>
                                                    {item.category_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>言語カテゴリ</label>
                                    <select
                                        name="language_category"
                                        value={formData.language_category}
                                        onChange={handleChange}
                                        style={styles.input}
                                    >
                                        <option value="">選択してください</option>
                                        {languageCategories.map((item) => (
                                            <option key={item.category_code} value={item.category_name}>
                                                {item.category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={styles.RightBottun}>
                                    <button
                                        type="button"
                                        style={styles.nextBtn}
                                        onClick={() => setActiveTab('text')}
                                    >
                                        文字数へ &gt;
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'date' && (
                            <div>
                                {[
                                    { key: 'proj_issue', label: '発行日 (proj_issue)' },
                                    { key: 'proj_request', label: 'リクエスト (proj_request)' },
                                    { key: 'proj_possible', label: '可能日 (proj_possible)' },
                                    { key: 'proj_date_1', label: '日付 1 (proj_date_1)' },
                                    { key: 'proj_date_2', label: '日付 2 (proj_date_2)' },
                                ].map(({ key, label }) => (
                                    <div key={key} style={styles.formGroup}>
                                        <label style={styles.label}>{label}</label>
                                        <input
                                            type="date"
                                            name={key}
                                            value={formData[key as keyof typeof formData] as string}
                                            onChange={handleChange}
                                            style={{ ...styles.input, cursor: 'pointer' }}
                                            onClick={(e) => {
                                                try {
                                                    (e.currentTarget as HTMLInputElement).showPicker();
                                                } catch (err) {
                                                    // フォールバック
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                                <div style={styles.RightBottun}>
                                    <button
                                        type="button"
                                        style={styles.nextBtn}
                                        onClick={() => setActiveTab('basic')}
                                    >
                                        カテゴリへ &gt;
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'text' && (
                            <div>
                                <div style={styles.rowGroup}>
                                    <div style={styles.columnItem}>
                                        <label style={styles.label}>フォーマット (proj_format)</label>
                                        <input type="text" name="proj_format" value={formData.proj_format} onChange={handleChange} style={styles.input} />
                                    </div>
                                    <div style={styles.columnItem}>
                                        <label style={styles.label}>数量形式 (proj_qty_format)</label>
                                        <input type="text" name="proj_qty_format" value={formData.proj_qty_format} onChange={handleChange} style={styles.input} />
                                    </div>
                                </div>

                                <div style={styles.rowGroup}>
                                    <div style={styles.columnItem}>
                                        <label style={styles.label}>文字数 (proj_char_count)</label>
                                        <input type="number" name="proj_char_count" value={formData.proj_char_count} onChange={handleChange} style={styles.input} />
                                    </div>
                                    <div style={styles.columnItem}>
                                        <label style={styles.label}>カウント (proj_count)</label>
                                        <input type="number" name="proj_count" value={formData.proj_count} onChange={handleChange} style={styles.input} />
                                    </div>
                                </div>

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
                                <div style={styles.RightBottun}>
                                    <button
                                        type="button"
                                        style={styles.nextBtn}
                                        onClick={() => setActiveTab('date')}
                                    >
                                        スケジュールへ &gt;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={styles.footer}>
                        <button type="button" style={styles.cancelBtn} onClick={onClose} disabled={submitting}>
                            キャンセル
                        </button>
                        <button type="submit" style={styles.saveBtn} disabled={submitting}>
                            {submitting ? '保存中...' : '保存 / 更新する'}
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
        maxHeight: '85vh',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '16px 24px',
        backgroundColor: '#111827',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
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
        flexShrink: 0,
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
    form: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
    },
    body: {
        padding: '20px 24px',
        flex: 1,
        overflowY: 'auto',
    },
    formGroup: {
        marginBottom: '16px',
    },
    rowGroup: {
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
    },
    columnItem: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
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
        fontSize: '1.12rem',
    },
    footer: {
        padding: '16px 24px',
        backgroundColor: '#111827',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        flexShrink: 0,
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
        backgroundColor: '#227aa2',
        color: '#ffffff',
        border: 'none',
        fontWeight: 600,
    },
    nextBtn: {
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        backgroundColor: '#2279a2ba',
        color: '#ffffff',
        border: 'none',
        fontWeight: 600,
    },
    RightBottun: {
        display: 'flex',
        justifyContent: 'flex-end',
        flex: 1,
    },
};