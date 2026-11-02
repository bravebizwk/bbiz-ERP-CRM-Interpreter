'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';


import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  Activity,
  MessageSquare,
  Clock,
  Kanban as KanbanIcon,
  type LucideIcon
} from "lucide-react";

interface SidebarItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const items: SidebarItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "Users", icon: Users },
  { path: "/products", label: "Products", icon: Package },
  { path: "/orders", label: "Orders", icon: ShoppingCart },
  { path: "/interpreter", label: "Interpreter", icon: Clock },
  { path: "/registereddocument", label: "Registered documents", icon: FileText },
  { path: "/1", label: "Documents", icon: FileText },
  { path: "/2", label: "Customer payments", icon: CreditCard },
  { path: "/3", label: "Payment history", icon: CreditCard },
  { path: "/4", label: "Agreements", icon: FileText },
  { path: "/monthly-payment", label: "Monthly payments", icon: CreditCard },
  { path: "/5", label: "Routine", icon: Activity },
  { path: "/kanban", label: "Kanban", icon: KanbanIcon },
  { path: "/chat", label: "Chats", icon: MessageSquare },
  { path: "/items", label: "Items", icon: Package },
];

export default function Sidebar() {
  const { isOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <nav className="sidebar-nav" aria-label="メインメニュー">
        {items.map(({ path, label, icon: Icon }) => {
          // 現在のパスと一致しているかを判定してアクティブクラスを付与
          const isActive = pathname === path;

          return (
            <Link
              key={path}
              href={path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="sidebar-icon" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}