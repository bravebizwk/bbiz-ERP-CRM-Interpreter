// src/components/Sidebar/Sidebar.tsx
import { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
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
  HelpCircle,
  type LucideIcon
} from "lucide-react";

// メニュー項目の型定義
interface SidebarItem {
  id?: string | number;
  path: string;
  label: string;
  icon: string;
}

// DBの icon カラムの文字列と lucide-react コンポーネントのマッピング
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  products: Package,
  orders: ShoppingCart,
  timeline: Clock,
  filetext: FileText,
  creditcard: CreditCard,
  Kanban: KanbanIcon,
  routine: Activity,
  chats: MessageSquare
};

export default function Sidebar() {
  const { isOpen } = useSidebar();
  const [items, setItems] = useState<SidebarItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Node.js API からサイドバーメニューを取得
    fetch("/api/sidebar")
      .then((res) => res.json())
      .then((data: SidebarItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Sidebar API Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <nav className="sidebar-nav">
          <div className="sidebar-loading">...</div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <nav className="sidebar-nav">
        {items.map((item, index) => {
          const IconComponent = iconMap[item.icon] || HelpCircle;

          return (
            <a
              key={item.id || item.path || index}
              href={item.path}
              className="sidebar-link"
            >
              {IconComponent && <IconComponent className="sidebar-icon" />}
              {isOpen && (
                <span className="sidebar-label">
                  {item.label}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
