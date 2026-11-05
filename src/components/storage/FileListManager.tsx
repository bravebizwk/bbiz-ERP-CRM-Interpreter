'use client';

import React, { useEffect, useState, useCallback } from 'react';
import FileUploadComponent from '@/components/storage/FileUploadComponent';
import { FileText, Download, Trash2, RefreshCw } from 'lucide-react';

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

interface FileListManagerProps {
    projNo: string;
    currentUserName?: string;
}

export default function FileListManager({ projNo, currentUserName = '西村' }: FileListManagerProps) {
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(false);

    // ファイル一覧の取得
    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/files/list?proj_no=${projNo}`);
            const data = await res.json();
            if (data.success) {
                setFiles(data.files);
            }
        } catch (err) {
            console.error('Failed to fetch files:', err);
        } finally {
            setLoading(false);
        }
    }, [projNo]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    // 論理削除の実行
    const handleDelete = async (fileId: number) => {
        if (!confirm('このファイルを削除（非表示）してもよろしいですか？')) return;

        try {
            const res = await fetch('/api/files/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId, deletedUser: currentUserName }),
            });
            const data = await res.json();
            if (data.success) {
                fetchFiles(); // 一覧を再取得
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Failed to delete file:', err);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-4">
            {/* アップロードセクション */}
            <FileUploadComponent projNo={projNo} uploadUser={currentUserName} onUploadSuccess={fetchFiles} />

            {/* ファイル一覧セクション */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        案件ファイル一覧 ({files.length}件)
                    </h3>
                    <button
                        onClick={fetchFiles}
                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50"
                        title="更新"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {files.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">アップロードされたファイルはまだありません。</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {files.map((file) => (
                            <div key={file.id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-3 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3 truncate">
                                    <FileText className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-gray-800 truncate">{file.file_name}</p>
                                        <p className="text-xs text-gray-400">
                                            {(file.file_size ? file.file_size / 1024 : 0).toFixed(1)} KB ・ アップロード者: {file.upload_user || '不明'} ({new Date(file.upload_date).toLocaleString()})
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    <a
                                        href={file.blob_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="ダウンロード / 表示"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="削除"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}