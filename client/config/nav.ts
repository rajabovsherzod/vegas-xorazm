import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Store,
  FileText,
  BadgeDollarSign,
  Layers,
  CheckCircle,
  Clock
} from "lucide-react";

import { NavItem } from "@/components/layout/app-sidebar";

export const ownerNav: NavItem[] = [
  { text: "Dashboard", url: "/owner/dashboard", icon: "LayoutDashboard" },
  { text: "Xodimlar", url: "/owner/staff", icon: "Users" },
  { text: "Mahsulotlar", url: "/owner/products", icon: "Package" },
  { text: "Moliya", url: "/owner/finance", icon: "BadgeDollarSign" },
  { text: "Sozlamalar", url: "/owner/settings", icon: "Settings" },
];

export const adminNav: NavItem[] = [
  { text: "Dashboard", url: "/admin/dashboard", icon: "LayoutDashboard" },
  { text: "Buyurtmalar", url: "/admin/orders", icon: "Clock" },
  { text: "Mahsulotlar", url: "/admin/products", icon: "Package" },
  { text: "Kategoriyalar", url: "/admin/categories", icon: "Layers" },
  { text: "Hisobotlar", url: "/admin/reports", icon: "FileText" },
];

export const sellerNav: NavItem[] = [
  { text: "Kassa", url: "/seller/pos", icon: "Store" },
  { text: "Yakunlanganlar", url: "/seller/completed", icon: "CheckCircle" },
];
