import type { ReactNode } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
// ▼ ここに main.scss のインポートを追加します
import '@/styles/scss/main.scss';

export const metadata = {
    title: 'HSP Portalsite',
    description: 'Management Dashboard',
    icons: {
        icon: '/favicon.svg',
    },
};

// RootLayoutのProps型を定義
interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="ja">
            <body>
                <DashboardLayout>
                    {children}
                </DashboardLayout>
            </body>
        </html>
    );
}
