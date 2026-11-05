import React from 'react';
import FileListManager from '@/components/storage/FileListManager';
import { FolderKanban, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: Promise<{
        projNo: string;
    }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
    // Next.js App Router では params は非同期の場合があるため await で取得します
    const resolvedParams = await params;
    const projNo = decodeURIComponent(resolvedParams.projNo);

    return (
        <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* ナビゲーション / ヘッダー */}
                <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/orderclients"
                            className="p-2 text-white hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center"
                            title="案件一覧に戻る"
                        >
                            <ArrowLeft className="text-white" style={{ width: '3rem', height: '3rem', color: '#80c8fb'}} />

                        </Link>



                {/* ファイル管理マネージャー（アップロード・一覧・削除・ダウンロード統合） */}
                <FileListManager projNo={projNo} currentUserName="Nishimura" />
                   
                        <Link
                            href="/orderclients"
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="案件一覧に戻る"
                        >
                            <ArrowLeft className="text-white" style={{ width: '3rem', height: '3rem', color: '#80c8fb' }} />
                        </Link>
            </div>
            </div>
            </div>
        </main>
    );
}