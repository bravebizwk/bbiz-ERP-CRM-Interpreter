import React from 'react';
import FileListManager from '@/components/storage/FileListManager';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './ProjectDetailPage.module.scss'; // 作成したSCSSをインポート

interface PageProps {
    params: Promise<{
        projNo: string;
    }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const projNo = decodeURIComponent(resolvedParams.projNo);

    return (
        <main className="min-h-screen bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* SCSSモジュールによるレスポンシブコンテナ */}
                <div className={styles.container}>

                    {/* 左側：戻るボタン（上下配置） */}
                    {/* 左側：戻るボタン（上端と下端に1つずつ配置） */}
                    <div className={styles.backButtonWrapper}>
                        {/* 上端のボタン */}
                        <Link
                            href="/orderclients"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.75rem',
                                borderRadius: '0.75rem',

                            }}
                            title="案件一覧に戻る（上）"
                        >
                            <ArrowLeft style={{ width: '2rem', height: '2rem', color: '#80c8fb' }} />
                        </Link>


                    </div>


                    {/* 右側：ファイルマネージャー */}
                    <div className={styles.managerWrapper}>
                        <FileListManager projNo={projNo} currentUserName="Nishimura" />
                    </div>

                </div>

                {/* 下端のボタン */}
                <Link
                    href="/orderclients"
                    style={{
                        display: 'flex',
                        alignItems: 'left',
                        justifyContent: 'left',
                        padding: '0.75rem',
                        borderRadius: '0.75rem',

                    }}
                    title="案件一覧に戻る（下）"
                >
                    <ArrowLeft style={{ width: '2rem', height: '2rem', color: '#80c8fb' }} />
                </Link>

            </div>
        </main>
    );
}
