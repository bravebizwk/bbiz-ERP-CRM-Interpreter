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

    // データベースから取得した案件データを保持するステート
    const [projectData, setProjectData] = useState({
        proj_no: projNo,
        proj_customer: '-',
        proj_partner_name: '-',
        intp_name_en: '-',
        large_category: '-',
        medium_category: '-',
        small_category: '-',
        language_category: '-',
        proj_ct_1: '-',
        proj_ct_2: '-',
        proj_ct_3: '-',
        proj_ct_4: '-',
        proj_issue: '-',
        proj_request: '-',
        proj_possible: '-',
        proj_date_1: '-',
        proj_date_2: '-',
        proj_format: '-',
        proj_qty_format: '-',
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
                // 既存のプロジェクトデータを取得
                const projRes = await fetch(`/api/projects?proj_no=${projNo}`);

                if (projRes.ok) {
                    const projData = await projRes.json();
                    const targetProj = Array.isArray(projData)
                        ? projData.find((p: any) => p.proj_no === projNo)
                        : projData;

                    if (targetProj) {
                        setProjectData((prev) => ({
                            ...prev,
                            ...targetProj,
                        }));
                        addLog('データベースから既存の案件データをロードしました。', 'success');
                    }
                }
            } catch (err) {
                console.error('データの取得に失敗しました:', err);
                addLog('データの取得に失敗しました。', 'warning');
            }
        };

        void fetchData();
        void fetchFiles();
    }, [projNo]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            addLog(`ファイルが選択されました: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`, 'info');
        }
    };

    // ファイルアップロード処理
    const handleUpload = async (e: React.FormEvent) => {
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

    // 文字列表記用のヘルパーコンポーネント
    const ReadOnlyField = ({ label, value }: { label: string; value: string | number | undefined }) => (
        <div style={{ marginBottom: '12px' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>{label}</span>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '0.875rem' }}>
                {value || '-'}
            </div>
        </div>
    );

    return (
        <div className={styles.container} style={{ width: '90%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* ヘッダー */}
            <div className={styles.header}>
                <h3 className={styles.headerTitle}>
                    <FolderKanban className="w-5 h-5" />
                    案件データ & ファイル管理
                </h3>
                <h3> {projectData.proj_partner_name} </h3>
                <span className={styles.badge}>案件: {projNo}</span>
            </div>

            <div className={styles.body} style={{ maxHeight: '75vh', overflowY: 'auto' }}>

                {/* 1. 基本・カテゴリ セクション（文字列表記） */}
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                        <Layers className="w-4 h-4" /> 基本・カテゴリ情報
                    </h4>

                    <ReadOnlyField label="顧客名 (proj_customer)" value={projectData.proj_customer} />
                    <ReadOnlyField label="パートナー名 (proj_partner_name)" value={projectData.proj_partner_name} />
                    <ReadOnlyField label="通訳者名 英語 (intp_name_en)" value={projectData.intp_name_en} />

                    <div className={styles.row}>
                        <ReadOnlyField label="大カテゴリ" value={projectData.large_category} />
                        <ReadOnlyField label="中カテゴリ" value={projectData.medium_category} />
                    </div>

                    <div className={styles.row}>
                        <ReadOnlyField label="小カテゴリ" value={projectData.small_category} />
                        <ReadOnlyField label="言語カテゴリ" value={projectData.language_category} />
                    </div>
                </div>

                {/* 2. コンテンツ (CT) セクション（文字列表記） */}
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                        <FileText className="w-4 h-4" /> コンテンツ (CT)
                    </h4>
                    <div className={styles.row}>
                        <ReadOnlyField label="CT 1" value={projectData.proj_ct_1} />
                        <ReadOnlyField label="CT 2" value={projectData.proj_ct_2} />
                    </div>
                    <div className={styles.row}>
                        <ReadOnlyField label="CT 3" value={projectData.proj_ct_3} />
                        <ReadOnlyField label="CT 4" value={projectData.proj_ct_4} />
                    </div>
                </div>

                {/* 3. 日付・スケジュール セクション（文字列表記） */}
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                        <Calendar className="w-4 h-4" /> スケジュール
                    </h4>
                    <div className={styles.row}>
                        <ReadOnlyField label="発行日 (proj_issue)" value={projectData.proj_issue} />
                        <ReadOnlyField label="リクエスト (proj_request)" value={projectData.proj_request} />
                    </div>
                    <div className={styles.row}>
                        <ReadOnlyField label="可能日 (proj_possible)" value={projectData.proj_possible} />
                        <ReadOnlyField label="日付 1 (proj_date_1)" value={projectData.proj_date_1} />
                    </div>
                    <div className={styles.row}>
                        <ReadOnlyField label="日付 2 (proj_date_2)" value={projectData.proj_date_2} />
                        <div />
                    </div>
                </div>

                {/* 4. フォーマット・数値 セクション（文字列表記） */}
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                        <FileSpreadsheet className="w-4 h-4" /> フォーマット・数値
                    </h4>
                    <div className={styles.row}>
                        <ReadOnlyField label="フォーマット (proj_format)" value={projectData.proj_format} />
                        <ReadOnlyField label="数量形式 (proj_qty_format)" value={projectData.proj_qty_format} />
                    </div>
                    <div className={styles.row}>
                        <ReadOnlyField label="文字数 (proj_char_count)" value={projectData.proj_char_count} />
                        <ReadOnlyField label="カウント (proj_count)" value={projectData.proj_count} />
                    </div>
                </div>

                {/* 5. ファイル添付 セクション */}
                <form onSubmit={handleUpload}>
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
                </form>

                {/* 6. 案件ファイル一覧（Bootstrapテーブル形式で縦に整列） */}
                <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div className={styles.consoleHeader} style={{ marginBottom: '12px' }}>
                        <span className={styles.consoleTitle}>
                            <FileText className="w-3.5 h-3.5" /> 案件ファイル一覧 ({files.length}件)
                        </span>
                        <span className={styles.consoleTag}>Attached Files</span>
                    </div>

                    <div className={styles.consoleBody} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {files.length === 0 ? (
                            <div style={{ padding: '12px', color: '#94a3b8', textAlign: 'center' }}>
                                アップロードされたファイルはまだありません。
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: '#f8fafc' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                                        <th style={{ padding: '6px 8px', fontWeight: 600 }}>ファイル名</th>
                                        <th style={{ padding: '6px 8px', fontWeight: 600, width: '80px', textAlign: 'right' }}>サイズ</th>
                                        <th style={{ padding: '6px 8px', fontWeight: 600, width: '160px' }}>アップロード日時</th>
                                        <th style={{ padding: '6px 8px', fontWeight: 600, width: '120px' }}>アップロード者</th>
                                        <th style={{ padding: '6px 8px', fontWeight: 600, width: '60px', textAlign: 'center' }}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((f) => (
                                        <tr key={f.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                                            <td style={{ padding: '6px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <FileText className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" style={{ marginTop: '2px' }} />
                                                    <span style={{ fontWeight: 600, color: '#f8fafc' }} title={f.file_name}>{f.file_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '6px 8px', textAlign: 'right', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                                                {(f.file_size ? f.file_size / 1024 : 0).toFixed(1)} KB
                                            </td>
                                            <td style={{ padding: '6px 8px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                                                {new Date(f.upload_date).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '6px 8px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                                                {f.upload_user || 'system'}
                                            </td>
                                            <td style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                    <a
                                                        href={f.blob_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ padding: '2px 4px', color: '#38bdf8', borderRadius: '4px' }}
                                                        title="ダウンロード / 表示"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteFile(f.id)}
                                                        style={{ background: 'none', border: 'none', padding: '2px 4px', color: '#fca5a5', cursor: 'pointer', borderRadius: '4px' }}
                                                        title="削除"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
        </div>
    );
}
