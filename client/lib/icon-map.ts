import * as LucideIcons from 'lucide-react';

// Biz faqat kerakli iconlarni tanlab olamiz.
export const iconMap = {
    LayoutDashboard: LucideIcons.LayoutDashboard,
    ShoppingCart: LucideIcons.ShoppingCart,
    Package: LucideIcons.Package,
    Users: LucideIcons.Users,
    Settings: LucideIcons.Settings,
    FileText: LucideIcons.FileText,
    BadgeDollarSign: LucideIcons.BadgeDollarSign,
    // Agar boshqa iconlar ishlatilsa, shu yerga qo'shiladi
};

export type IconName = keyof typeof iconMap;