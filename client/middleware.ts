import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Tokenni olish
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ----------------------------------------------------------------------
  // A. USER LOGIN QILMAGAN BO'LSA (MEHMON)
  // ----------------------------------------------------------------------
  if (!token) {
    // 🔥 "admin" yo'li ham qo'shildi
    const protectedPaths = ["/owner", "/admin", "/cashier", "/seller", "/superadmin", "/dashboard"];

    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // ----------------------------------------------------------------------
  // B. USER LOGIN QILGAN (ROLI BOR)
  // ----------------------------------------------------------------------
  const role = token.role as string;

  // Har bir rol uchun o'zining "Home" (Dashboard) manzili
  let correctDashboard = "/auth/login";

  switch (role) {
    case "owner":
      correctDashboard = "/owner/dashboard";
      break;
    case "admin": // 🔥 YANGI: Admin dashboardga borishi kerak
      correctDashboard = "/admin/dashboard";
      break;
    case "cashier":
      correctDashboard = "/cashier/orders";
      break;
    case "developer":
      correctDashboard = "/superadmin/error-logs";
      break;
    case "seller":
      correctDashboard = "/seller/pos";
      break;
    default:
      correctDashboard = "/unauthorized";
  }

  // 1-SENARIY: Login yoki Bosh sahifada bo'lsa -> O'z Dashboardiga otamiz
  if (pathname === "/auth/login" || pathname === "/login" || pathname === "/") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  // 2-SENARIY: ROLGA MOS KELMAYDIGAN JOYGA KIRSA (Xavfsizlik)
  
  // Owner faqat o'ziga
  if (pathname.startsWith("/owner") && role !== "owner") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  // 🔥 Admin panelga faqat Admin va Owner kira olsin
  if (pathname.startsWith("/admin") && role !== "admin" && role !== "owner") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  // Cashier panelga Cashier, Admin va Owner kira olsin (ixtiyoriy, yoki qat'iy qilish mumkin)
  if (pathname.startsWith("/cashier") && role !== "cashier" && role !== "admin" && role !== "owner") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  // Seller panelga faqat Seller (va balki boshliqlar)
  if (pathname.startsWith("/seller") && role !== "seller" && role !== "owner") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  // SuperAdmin - faqat developer
  if (pathname.startsWith("/superadmin") && role !== "developer") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  return NextResponse.next();
}

// Config: Qaysi yo'llarda ishlashi kerak
export const config = {
  matcher: [
    "/",
    "/login",
    "/auth/login",
    "/owner/:path*",
    "/admin/:path*", // 🔥 QO'SHILDI
    "/cashier/:path*",
    "/seller/:path*",
    "/superadmin/:path*",
    "/dashboard/:path*",
    "/unauthorized"
  ],
};