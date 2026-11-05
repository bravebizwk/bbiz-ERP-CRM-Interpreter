'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Activity,
  MessageSquare,
  Clock,
  Kanban as KanbanIcon,
  type LucideIcon
} from "lucide-react";

interface SidebarItem {
  path: string;
  label: string;
  icon: string | LucideIcon;
}

// DBから取得したアイコン文字列に対応するLucideアイコンのマッピング
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  products: Package,
  orders: ShoppingCart,
  routine: Activity,
  chats: MessageSquare,
  Kanban: KanbanIcon,
};

export default function Sidebar() {
  const { isOpen } = useSidebar();
  const pathname = usePathname();
  const [items, setItems] = useState<SidebarItem[]>([]);

  // DBの sidebar_menu テーブルからメニューデータを取得するAPIを呼び出し
  useEffect(() => {
    fetch('/api/sidebar')
      .then((res) => {
        if (!res.ok) throw new Error('API response was not ok');
        return res.json();
      })
      .then((data: SidebarItem[]) => {
        if (!Array.isArray(data)) throw new Error('Invalid sidebar API response');
        setItems(data);
      })
      .catch((err) => {
        console.warn('Sidebar API fetch failed:', err);
      });
  }, []);

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <nav className="sidebar-nav" aria-label="メインメニュー">
        {items.map(({ path, label, icon }, index) => {
          const isActive = pathname === path;

          // アイコンが文字列（DBから取得）の場合は iconMap から引き、すでにコンポーネントの場合はそのまま使う
          const IconComponent = typeof icon === 'string'
            ? (iconMap[icon] || LayoutDashboard)
            : icon;

          return (
            <Link
              key={`${path}-${index}`}
              href={path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent className="sidebar-icon" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
