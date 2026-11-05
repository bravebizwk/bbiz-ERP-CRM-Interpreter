'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { Menu } from 'lucide-react'; // アイコンの例

export default function Header() {
  const { isOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <header className="admin-header">
      {/* サイドバー開閉ボタンの例 */}
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        <Menu />
      </button>
        <div className="header-log-companyname">
          <img src="/logo.png" alt="Site Logo" className="logo" />
          <div className="header-title">BraveBiz</div>
          {/*  <p className="header-page-title">{pageTitles[pathname] ?? "ページ"}</p>*/}
          <p className="header-page-title"></p>
        </div>
      <div className="header-title">BraveBiz</div>
    </header>
  );
}