import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Store,
  FileText,
  BadgeDollarSign
} from "lucide-react";

import { NavItem } from "@/components/layout/app-sidebar";

// 🔥 MUHIM: title o'rniga text bo'lishi kerak edi
export const ownerNav: NavItem[] = [
  { text: "Dashboard", url: "/owner/dashboard", icon: "LayoutDashboard" },
  { text: "Xodimlar", url: "/owner/staff", icon: "Users" },
  { text: "Mahsulotlar", url: "/owner/products", icon: "Package" },
  { text: "Moliya", url: "/owner/finance", icon: "BadgeDollarSign" },
  { text: "Sozlamalar", url: "/owner/settings", icon: "Settings" },
];

export const adminNav: NavItem[] = [
  { text: "Kassa", url: "/admin/orders", icon: "ShoppingCart" },
  { text: "Mahsulotlar", url: "/admin/products", icon: "Package" },
  { text: "Hisobotlar", url: "/admin/reports", icon: "FileText" },
];

export const sellerNav: NavItem[] = [
  { text: "Savdo oynasi (POS)", url: "/seller/pos", icon: "Store" },
  { text: "Mening savdolarim", url: "/seller/history", icon: "FileText" },
];