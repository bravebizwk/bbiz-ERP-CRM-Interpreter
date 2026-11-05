'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, FolderKanban, Calendar, FileSpreadsheet, Layers, Terminal, Download, Trash2 } from 'lucide-react';
import styles from './FileUploadComponent.module.scss';

interface ProjectFile {
    id: number;
    proj_no: string;
    file_name: string;
    blob_url: string;
    file_size: number;
    mime_type: string;
    upload_date: string;
    upload_user: string;
}

interface FileUploadProps {
    projNo: string; // 対象の案件番号
    uploadUser?: string; // アップロード者（任意）
    onUploadSuccess?: () => void; // アップロード成功時のコールバック
}

interface LogEntry {
    id: string;
    timestamp: string;
    type: 'info' | 'success' | 'error' | 'warning';
    message: string;
}

export default function FileUploadComponent({ projNo, uploadUser = 'system', onUploadSuccess }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<ProjectFile[]>([]);

    // ハイドレーションエラー防止用のマウント状態
    const [mounted, setMounted] = useState(false);

    const [logs, setLogs] = useState<LogEntry[]>([
        { id: '1', timestamp: '', type: 'info', message: 'コンポーネントが初期化されました。案件番号: ' + projNo }
    ]);

    const [customerOptions, setCustomerOptions] = useState<string[]>([]);
    const [partnerOptions, setPartnerOptions] = useState<string[]>([]);
    const [interpreterOptions, setInterpreterOptions] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        proj_no: projNo,
        proj_customer: '',
        proj_partner_name: '',
        intp_name_en: '',
        large_category: '',
        medium_category: '',
        small_category: '',
        language_category: '',
        proj_ct_1: '',
        proj_ct_2: '',
        proj_ct_3: '',
        proj_ct_4: '',
        proj_issue: '',
        proj_request: '',
        proj_possible: '',
        proj_date_1: '',
        proj_date_2: '',
        proj_format: '',
        proj_qty_format: '',
        proj_char_count: 0,
        proj_count: 0,
    });

    const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        const newLog: LogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            type,
            message,
        };
        setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
    };

    // ファイル一覧の取得
    const fetchFiles = async () => {
        try {
            const res = await fetch(`/api/files/list?proj_no=${projNo}`);
            const data = await res.json();
            if (data.success) {
                setFiles(data.files);
            }
        } catch (err) {
            console.error('Failed to fetch files:', err);
        }
    };

    useEffect(() => {
        setMounted(true);
        setLogs([
            { id: '1', timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'コンポーネントが初期化されました。案件番号: ' + projNo }
        ]);

        const fetchData = async () => {
            try {
                const [custRes, partRes, intpRes] = await Promise.all([
                    fetch('/api/customers'),
                    fetch('/api/partners'),
                    fetch('/api/interpreters-list')
                ]);

                if (custRes.ok) setCustomerOptions(await custRes.json());
                if (partRes.ok) setPartnerOptions(await partRes.json());
                if (intpRes.ok) setInterpreterOptions(await intpRes.json());
                addLog('顧客・パートナー・通訳者の候補データをロードしました。', 'success');
            } catch (err) {
                console.error('候補データの取得に失敗しました:', err);
                addLog('候補データの取得に失敗しました。', 'warning');
            }
        };

        void fetchData();
        void fetchFiles();
    }, [projNo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name.includes('count') ? Number(value) : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            addLog(`ファイルが選択されました: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`, 'info');
        }
    };

    const handleUploadAndSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            addLog('アップロードするファイルが選択されていません。', 'warning');
            return;
        }

        setUploading(true);
        addLog('Azure Blob Storage へのファイルアップロードを開始します...', 'info');

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('proj_no', projNo);
            fd.append('upload_user', uploadUser);

            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: fd,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'アップロードに失敗しました。');
            }

            addLog('Azure Blob へのアップロードおよび DB 登録が完了しました！', 'success');
            setFile(null);

            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            await fetchFiles();

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err: any) {
            const errorMsg = err.message || '予期せぬエラーが発生しました。';
            addLog(`エラー: ${errorMsg}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        if (!confirm('このファイルを削除（非表示）してもよろしいですか？')) return;

        try {
            const res = await fetch('/api/files/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId, deletedUser: uploadUser }),
            });
            const data = await res.json();
            if (data.success) {
                addLog('ファイルを論理削除しました。', 'warning');
                await fetchFiles();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Failed to delete file:', err);
        }
    };

    return (
        <div className={styles.container} style={{ width: '80%', maxWidth: '900px', margin: '0 auto' }}>
            {/* ヘッダー */}
            <div className={styles.header}>
                <h3 className={styles.headerTitle}>
                    <FolderKanban className="w-5 h-5" />
                    案件データ & ファイル管理
                </h3>
                <span className={styles.badge}>案件: {projNo}</span>
            </div>

            <form onSubmit={handleUploadAndSave}>
                <div className={styles.body} style={{ maxHeight: '75vh', overflowY: 'auto' }}>

                    {/* 1. 基本・カテゴリ セクション */}
                    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                            <Layers className="w-4 h-4" /> 基本・カテゴリ情報
                        </h4>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>顧客名 (proj_customer)</label>
                            <input
                                type="text"
                                name="proj_customer"
                                value={formData.proj_customer}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="顧客名を選択または入力"
                                list="customer-options"
                                autoComplete="off"
                            />
                            <datalist id="customer-options">
                                {customerOptions.map((cust, i) => <option key={i} value={cust} />)}
                            </datalist>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>パートナー名 (proj_partner_name)</label>
                            <input
                                type="text"
                                name="proj_partner_name"
                                value={formData.proj_partner_name}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="パートナー名を選択または入力"
                                list="partner-options"
                                autoComplete="off"
                            />
                            <datalist id="partner-options">
                                {partnerOptions.map((part, i) => <option key={i} value={part} />)}
                            </datalist>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>通訳者名 英語 (intp_name_en)</label>
                            <input
                                type="text"
                                name="intp_name_en"
                                value={formData.intp_name_en}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="通訳者名を選択または入力"
                                list="interpreter-options"
                                autoComplete="off"
                            />
                            <datalist id="interpreter-options">
                                {interpreterOptions.map((intp, i) => <option key={i} value={intp} />)}
                            </datalist>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>大カテゴリ</label>
                                <select name="large_category" value={formData.large_category} onChange={handleChange} className={styles.select}>
                                    <option value="">選択してください</option>
                                    <option value="四半期決算短信">四半期決算短信</option>
                                    <option value="決算短信">決算短信</option>
                                    <option value="リリース">リリース</option>
                                    <option value="IR資料">IR資料</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>中カテゴリ</label>
                                <select name="medium_category" value={formData.medium_category} onChange={handleChange} className={styles.select}>
                                    <option value="">選択してください</option>
                                    <option value="第一">第一</option>
                                    <option value="第二">第二</option>
                                    <option value="第三">第三</option>
                                    <option value="第四">第四</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>小カテゴリ</label>
                                <input type="text" name="small_category" value={formData.small_category} onChange={handleChange} className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>言語カテゴリ</label>
                                <select name="language_category" value={formData.language_category} onChange={handleChange} className={styles.select}>
                                    <option value="">選択してください</option>
                                    <option value="英訳">英訳</option>
                                    <option value="和訳">和訳</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 2. コンテンツ (CT) セクション */}
                    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                            <FileText className="w-4 h-4" /> コンテンツ (CT)
                        </h4>
                        <div className={styles.row}>
                            {[1, 2, 3, 4].map((num) => (
                                <div key={num} className={styles.formGroup}>
                                    <label className={styles.label}>CT {num}</label>
                                    <input
                                        type="text"
                                        name={`proj_ct_${num}`}
                                        value={formData[`proj_ct_${num}` as keyof typeof formData] as string}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder={`コンテンツ ${num} を入力`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. 日付・スケジュール セクション */}
                    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                            <Calendar className="w-4 h-4" /> スケジュール
                        </h4>
                        <div className={styles.row}>
                            {[
                                { key: 'proj_issue', label: '発行日 (proj_issue)' },
                                { key: 'proj_request', label: 'リクエスト (proj_request)' },
                                { key: 'proj_possible', label: '可能日 (proj_possible)' },
                                { key: 'proj_date_1', label: '日付 1 (proj_date_1)' },
                                { key: 'proj_date_2', label: '日付 2 (proj_date_2)' },
                            ].map(({ key, label }) => (
                                <div key={key} className={styles.formGroup}>
                                    <label className={styles.label}>{label}</label>
                                    <input
                                        type="date"
                                        name={key}
                                        value={formData[key as keyof typeof formData] as string}
                                        onChange={handleChange}
                                        className={styles.input}
                                        onClick={(e) => {
                                            try { (e.currentTarget as HTMLInputElement).showPicker(); } catch (err) { }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. フォーマット・数値 セクション */}
                    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                            <FileSpreadsheet className="w-4 h-4" /> フォーマット・数値
                        </h4>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>フォーマット (proj_format)</label>
                                <input type="text" name="proj_format" value={formData.proj_format} onChange={handleChange} className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>数量形式 (proj_qty_format)</label>
                                <input type="text" name="proj_qty_format" value={formData.proj_qty_format} onChange={handleChange} className={styles.input} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>文字数 (proj_char_count)</label>
                                <input type="number" name="proj_char_count" value={formData.proj_char_count} onChange={handleChange} className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>カウント (proj_count)</label>
                                <input type="number" name="proj_count" value={formData.proj_count} onChange={handleChange} className={styles.input} />
                            </div>
                        </div>
                    </div>

                    {/* 5. ファイル添付 セクション（タグなし・1画面内） */}
                    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                            <Upload className="w-4 h-4" /> ファイル添付
                        </h4>

                        <div className={styles.uploadDropzone}>
                            <input
                                id="fileInput"
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="fileInput" className={styles.dropzoneContent}>
                                <FileText className={`w-10 h-10 ${styles.icon}`} />
                                <span className={styles.textMain}>
                                    {file ? file.name : 'クリックしてファイルを選択'}
                                </span>
                                <span className={styles.textSub}>PDF, 画像, Word / Excel 等</span>
                            </label>
                        </div>

                        {file && (
                            <div className={styles.filePreview}>
                                <span>選択中: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</span>
                                <button
                                    type="button"
                                    onClick={() => { setFile(null); addLog('選択ファイルをクリアしました。', 'warning'); }}
                                    className={styles.removeBtn}
                                >
                                    削除
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className={styles.submitBtn}
                            style={{ marginTop: '16px' }}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    アップロード中...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Azure Blobへアップロード & 登録
                                </>
                            )}
                        </button>
                    </div>

                    {/* 6. 案件ファイル一覧（実行ログ欄のフォーマットに完全統一） */}
                    <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                        <div className={styles.consoleHeader} style={{ marginBottom: '12px' }}>
                            <span className={styles.consoleTitle}>
                                <FileText className="w-3.5 h-3.5" /> 案件ファイル一覧 ({files.length}件)
                            </span>
                            <span className={styles.consoleTag}>Attached Files</span>
                        </div>
                        <div className={styles.consoleBody} style={{ maxHeight: '150px' }}>
                            {files.length === 0 ? (
                                <div style={{ padding: '8px', color: '#94a3b8', textAlign: 'center' }}>
                                    アップロードされたファイルはまだありません。
                                </div>
                            ) : (
                                files.map((f) => (
                                    <div key={f.id} className={`${styles.logRow} info`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '6px 10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                                            <FileText className="w-4 h-4 text-sky-400 flex-shrink-0" />
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{f.file_name}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: '8px' }}>
                                                    {(f.file_size ? f.file_size / 1024 : 0).toFixed(1)} KB ・ アップロード者: {f.upload_user || 'system'} ({new Date(f.upload_date).toLocaleString()})
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                                            <a
                                                href={f.blob_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ padding: '4px', color: '#38bdf8', borderRadius: '4px' }}
                                                title="ダウンロード / 表示"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteFile(f.id)}
                                                style={{ background: 'none', border: 'none', padding: '4px', color: '#fca5a5', cursor: 'pointer', borderRadius: '4px' }}
                                                title="削除"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* 実行ログ・ステータス欄 */}
                <div className={styles.consoleContainer}>
                    <div className={styles.consoleHeader}>
                        <span className={styles.consoleTitle}>
                            <Terminal className="w-3.5 h-3.5" /> 実行ログ・ステータス
                        </span>
                        <span className={styles.consoleTag}>Realtime Console</span>
                    </div>
                    <div className={styles.consoleBody}>
                        {logs.map((log) => (
                            <div key={log.id} className={`${styles.logRow} ${styles[log.type]}`}>
                                <span className={styles.timestamp}>
                                    [{mounted ? log.timestamp : '--:--:--'}]
                                </span>
                                <span className={styles.message}>{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
}




import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Dashboard from '@/components/pages/Dashboard';
import Users from '@/components/pages/Users';
import Products from '@/components/pages/Products';
import Orders from '@/components/pages/Orders';
import RegDoc from '@/components/pages/RegDoc';
import Smpl1 from '@/components/pages/1';
import Smpl2 from '@/components/pages/2';
import Smpl3 from '@/components/pages/3';
import Smpl4 from '@/components/pages/4';
import Smpl5 from '@/components/pages/5';
import Smpl6 from '@/components/pages/6';
import KanbanPage from '@/components/pages/kanban-page';
import MonthlyPayment from '@/components/pages/MonthlyPayment';
import Items from '@/components/pages/Items';
import Interpreter from '@/components/pages/Interpreter';
import OrderClients from '@/components/pages/OrderClients';

function NotFound() {
    return (
        <section className="not-found-page">
            <h1>ページが見つかりません</h1>
            <p>URLを確認するか、サイドバーからページを選択してください。</p>
        </section>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/orders" element={<Orders />} />

                    <Route path="/orderclients" element={<OrderClients />} />


                    <Route path="/registereddocument" element={<RegDoc />} />
                    <Route path="/1" element={<Smpl1 />} />
                    <Route path="/2" element={<Smpl2 />} />
                    <Route path="/3" element={<Smpl3 />} />
                    <Route path="/4" element={<Smpl4 />} />
                    <Route path="/5" element={<Smpl5 />} />
                    <Route path="/6" element={<Smpl6 />} />
                    <Route path="/chat" element={<Smpl6 />} />
                    <Route path="/monthly-payment" element={<MonthlyPayment />} />
                    <Route path="/interpreter" element={<Interpreter />} />
                    <Route path="/kanban" element={<KanbanPage />} />
                    <Route path="/items" element={<Items />} />
                    <Route path="/item-list" element={<Items />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
