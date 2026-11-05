'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
    projNo: string; // 対象の案件番号
    uploadUser?: string; // アップロード者（任意）
    onUploadSuccess?: () => void; // アップロード成功時のコールバック
}

export default function FileUploadComponent({ projNo, uploadUser = 'system', onUploadSuccess }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ファイル選択時のハンドラー
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    // アップロード実行処理
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('proj_no', projNo);
            formData.append('upload_user', uploadUser);

            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'アップロードに失敗しました。');
            }

            setMessage({ type: 'success', text: 'ファイルのアップロードとデータベース登録が完了しました！' });
            setFile(null);

            // フォームをリセット
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || '予期せぬエラーが発生しました。' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 max-w-xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                案件ファイルアップロード (案件: {projNo})
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors bg-gray-50">
                    <input
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                        <FileText className="w-10 h-10 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                            {file ? file.name : 'クリックしてファイルを選択、またはドラッグ＆ドロップ'}
                        </span>
                        <span className="text-xs text-gray-400">PDF, 画像, Word/Excel 等</span>
                    </label>
                </div>

                {file && (
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-indigo-50 p-3 rounded-md">
                        <span>選択中: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="text-red-500 hover:underline font-medium"
                        >
                            削除
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            アップロード中...
                        </>
                    ) : (
                        'Azure Blobへアップロード & DB登録'
                    )}
                </button>
            </form>

            {message && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    );
}