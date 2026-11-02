'use client'; 

import type { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';

interface DashboardLayoutProps {
  children?: ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { isOpen } = useSidebar();

  return (
    <div className="dashboard-layout-shell">
      <Header />
      <div className="dashboard-layout-body">
        <aside className={`dashboard-sidebar-container ${isOpen ? 'open' : 'closed'}`}>
          <Sidebar />
        </aside>

        <div className="dashboard-content">
          <main className="dashboard-main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
