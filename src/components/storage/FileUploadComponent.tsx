'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, FolderKanban, Layers, Terminal, Download, Trash2 } from 'lucide-react';
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

    // ファイルアップロード処理（ファイル名変更 ＆ 文字数チェック機能付き）
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            addLog('アップロードするファイルが選択されていません。', 'warning');
            return;
        }

        setUploading(true);
        addLog('ファイル名のタイムスタンプ付与とアップロードを開始します...', 'info');

        try {
            // --- 1. ファイル名に _YYMMDD_hhmm を付与する処理 ---
            const originalName = file.name;
            const lastDotIndex = originalName.lastIndexOf('.');

            let baseName = originalName;
            let extension = '';

            if (lastDotIndex !== -1) {
                baseName = originalName.substring(0, lastDotIndex);
                extension = originalName.substring(lastDotIndex); // ドットを含む拡張子 (.pdf 等)
            }

            // 現在日時から YYMMDD_hhmm を生成
            const now = new Date();
            const yy = String(now.getFullYear()).slice(-2);
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');

            const timestampStr = `${yy}${mm}${dd}_${hh}${min}`;
            const newFileName = `${baseName}_${timestampStr}${extension}`;

            // --- 2. 文字数オーバーのチェック処理 ---
            const MAX_FILENAME_LENGTH = 150; // データベースや運用上の上限文字数（必要に応じて変更してください）

            if (newFileName.length > MAX_FILENAME_LENGTH) {
                throw new Error(`ファイル名が長すぎます（現在: ${newFileName.length}文字 / 上限: ${MAX_FILENAME_LENGTH}文字）。元のファイル名を短くしてください。`);
            }
            // ------------------------------------

            // 新しい名前で File オブジェクトを作り直す
            const renamedFile = new File([file], newFileName, { type: file.type });

            addLog(`ファイル名を変更しました: ${originalName} ➔ ${newFileName}`, 'info');
            // ----------------------------------------------------

            const fd = new FormData();
            fd.append('file', renamedFile); // 変更後のファイルをセット
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
            alert(errorMsg); // ユーザーにポップアップでエラーを分かりやすく通知する場合
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
        <div className={styles.container}>
            {/* ヘッダー */}
            <div className={styles.header}>
                <h3 className={styles.headerTitle}>
                    <FolderKanban className="w-5 h-5" />
                    案件データ & ファイル管理
                </h3>
                <h3> {projectData.proj_partner_name} </h3>
                <span className={styles.badge}>案件: {projNo}</span>
            </div>

            <div className={styles.body}>

                {/* 1. 基本・カテゴリ セクション（横に3つのカード） */}
                <div className={styles.section}>
                    <h4 className={`${styles.sectionTitle} ${styles.large}`}>
                        <Layers className="w-5 h-5" /> 基本・カテゴリ情報
                    </h4>

                    <div className={styles.row3Cols}>
                        <div className={styles.readOnlyCard}>
                            <span className={styles.cardLabel}>顧客名</span>
                            <div className={styles.cardValue}>{projectData.proj_customer || '-'}</div>

                            <span className={styles.cardLabel} style={{ marginTop: '8px' }}>内容</span>
                            <div className={styles.cardValue}>{projectData.language_category || '-'}</div>
                            <div className={styles.cardValue}>{projectData.large_category || '-'}</div>
                            <div className={styles.cardValue}>{projectData.medium_category || '-'}</div>
                            <div className={styles.cardValue}>{projectData.small_category || '-'}</div>
                            <div className={styles.cardValue}>{projectData.proj_char_count || '-'}</div>
                            <div className={styles.cardValue}>{projectData.proj_count || '-'}</div>
                        </div>

                        <div className={styles.readOnlyCard}>
                            <span className={styles.cardLabel}>スケジュール</span>
                            <span className={styles.cardLabel} style={{ marginTop: '4px' }}>発注日</span>
                            <div className={styles.cardValue}>{projectData.proj_issue || '-'}</div>
                            <span className={styles.cardLabel} style={{ marginTop: '4px' }}>納期</span>
                            <div className={styles.cardValue}>{projectData.proj_request || '-'}</div>
                            <span className={styles.cardLabel} style={{ marginTop: '4px' }}>納品形式</span>
                            <div className={styles.cardValue}>{projectData.proj_format || '-'}</div>
                        </div>

                        <div className={styles.readOnlyCard}>
                            <span className={styles.cardLabel}>備考</span>
                            <div className={styles.cardValue}>{projectData.proj_ct_1 || '-'}</div>
                            <div className={styles.cardValue}>{projectData.proj_ct_2 || '-'}</div>
                            <div className={styles.cardValue}>{projectData.proj_ct_3 || '-'}</div>
                            <div className={styles.cardValue}>{projectData.proj_ct_4 || '-'}</div>
                        </div>
                    </div>
                </div>


                {/* 下部エリア：3カラムのグリッドで「ファイル一覧（2カラム分）」と「ファイル添付（1カラム分）」を横並び配置 */}
                <div className={styles.row3Cols}>

                    {/* 6. 案件ファイル一覧（左側・2カラム分の幅） */}
                    <div className={`${styles.section} ${styles.colSpan2}`} style={{ marginBottom: 0 }}>
                        <div className={styles.consoleHeader} style={{ marginBottom: '12px' }}>
                            <span className={styles.consoleTitle}>
                                <FileText className="w-3.5 h-3.5" /> 案件ファイル一覧 ({files.length}件)
                            </span>
                            <span className={styles.consoleTag}>Attached Files</span>
                        </div>

                        <div className={styles.tableWrapper} style={{ maxHeight: '250px' }}>
                            {files.length === 0 ? (
                                <div className={styles.emptyText}>
                                    アップロードされたファイルはまだありません。
                                </div>
                            ) : (
                                <table className={styles.fileTable}>
                                    <thead>
                                        <tr>
                                            <th>ファイル名</th>
                                            <th style={{ width: '80px', textAlign: 'right' }}>サイズ</th>
                                            <th style={{ width: '140px' }}>アップロード日時</th>
                                            <th style={{ width: '100px' }}>担当者</th>
                                            <th style={{ width: '60px', textAlign: 'center' }}>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {files.map((f) => (
                                            <tr key={f.id}>
                                                <td className={styles.fileNameCol}>
                                                    <div className={styles.fileNameItem}>
                                                        <FileText className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                                                        <span title={f.file_name}>{f.file_name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {(f.file_size ? f.file_size / 1024 : 0).toFixed(1)} KB
                                                </td>
                                                <td>
                                                    {new Date(f.upload_date).toLocaleString()}
                                                </td>
                                                <td>
                                                    {f.upload_user || 'system'}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div className={styles.actionBtnGroup}>
                                                        <a
                                                            href={f.blob_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.iconLink}
                                                            title="ダウンロード / 表示"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFile(f.id)}
                                                            className={styles.iconBtn}
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


                    {/* 5. ファイル添付 セクション（右側・1カラム分の幅） */}
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className={styles.section} style={{ marginBottom: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h4 className={styles.sectionTitle}>
                                    <Upload className="w-4 h-4" /> ファイル添付
                                </h4>

                                <div className={styles.uploadDropzone} style={{ padding: '20px 12px' }}>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="fileInput" className={styles.dropzoneContent}>
                                        <FileText className={`w-8 h-8 ${styles.icon}`} />
                                        <span className={styles.textMain}>
                                            {file ? file.name : 'ファイルを選択'}
                                        </span>
                                        <span className={styles.textSub}>PDF, 画像, Word / Excel等</span>
                                    </label>
                                </div>

                                {file && (
                                    <div className={styles.filePreview}>
                                        <span>選択: <strong>{file.name}</strong></span>
                                        <button
                                            type="button"
                                            onClick={() => { setFile(null); addLog('選択ファイルをクリアしました。', 'warning'); }}
                                            className={styles.removeBtn}
                                        >
                                            削除
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!file || uploading}
                                className={styles.submitBtn}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        アップロード中...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Azure Blobへアップロード
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

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
