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
  Clock,
  Monitor,
  Server,
  QrCode,
  ScanLine
} from "lucide-react";

import { NavItem } from "@/components/layout/app-sidebar";

export const ownerNav: NavItem[] = [
  { text: "Dashboard", url: "/owner/dashboard", icon: "LayoutDashboard" },
  { text: "Xodimlar", url: "/owner/staff", icon: "Users" },
];

export const adminNav: NavItem[] = [
  { text: "Dashboard", url: "/admin/dashboard", icon: "LayoutDashboard" },
  { text: "Buyurtmalar", url: "/admin/orders", icon: "Clock" },
  { text: "Mahsulotlar", url: "/admin/products", icon: "Package" },
  { text: "Kategoriyalar", url: "/admin/categories", icon: "Layers" },
  { text: "Kirimlar tarixi", url: "/admin/stock-history", icon: "FileText" },
  { text: "QR Kod", url: "/admin/qr-code", icon: "QrCode" },
  { text: "Scanner Test", url: "/admin/qr-scanner-test", icon: "ScanLine" },
];

export const superAdminNav: NavItem[] = [
  { text: "Frontend Errors", url: "/superadmin/frontend-errors", icon: "Monitor" },
  { text: "Backend Errors", url: "/superadmin/backend-errors", icon: "Server" },
];

export const sellerNav: NavItem[] = [
  { text: "Kassa", url: "/seller/pos", icon: "Store" },
  { text: "Yakunlanganlar", url: "/seller/completed", icon: "CheckCircle" },
];
