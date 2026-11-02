// sidebarData.js

import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart
} from "lucide-react";

export const sidebarItems = [
  {
    id: 1,
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard
  },
  {
    id: 2,
    label: "Users",
    path: "/users",
    icon: Users
  },
  {
    id: 3,
    label: "Products",
    path: "/products",
    icon: Package
  },
  {
    id: 4,
    label: "Orders",
    path: "/orders",
    icon: ShoppingCart
  }
];