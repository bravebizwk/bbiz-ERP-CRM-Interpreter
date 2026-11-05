'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, FolderKanban, Calendar, FileSpreadsheet, Layers, Terminal } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState<'basic' | 'contents' | 'date' | 'text' | 'upload'>('basic');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const [mounted, setMounted] = useState(false);
