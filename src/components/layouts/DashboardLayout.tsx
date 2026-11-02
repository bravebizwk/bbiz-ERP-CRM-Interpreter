import type { ReactNode } from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="dashboard-layout-shell">
        <Header />
        <div className="dashboard-layout-body">
          <aside className="dashboard-sidebar-container">
            <Sidebar />
          </aside>

          <div className="dashboard-content">
            <main className="dashboard-main">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
