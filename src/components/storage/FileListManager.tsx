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

       
        </div>
    );
}