import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Tokenni olish (Secret .env faylda bo'lishi shart)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ----------------------------------------------------------------------
  // A. USER LOGIN QILMAGAN BO'LSA (MEHMON)
  // ----------------------------------------------------------------------
  if (!token) {
    const protectedPaths = ["/owner", "/cashier", "/seller", "/superadmin", "/dashboard"];

    // Agar himoyalangan yo'lga kirmoqchi bo'lsa -> Login sahifasiga
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    // Boshqa holatlarda (masalan, home page yoki login) indamaymiz
    return NextResponse.next();
  }

  // ----------------------------------------------------------------------
  // B. USER LOGIN QILGAN (ROLI BOR)
  // ----------------------------------------------------------------------
  const role = token.role as string;

  // Har bir rol uchun TO'G'RI BO'LGAN "Home" manzilini aniqlaymiz
  let correctDashboard = "/login";

  switch (role) {
    case "owner":
      correctDashboard = "/owner/dashboard";
      break;
    case "cashier":
      correctDashboard = "/cashier/orders"; // Kassir uchun asosiy joy
      break;
    case "developer":
      correctDashboard = "/superadmin/error-logs"; // Developer uchun asosiy joy
      break;
    case "seller":
      correctDashboard = "/seller/pos";   // Seller uchun asosiy joy
      break;
    default:
      correctDashboard = "/unauthorized"; // Noma'lum rol
  }

  // 1-SENARIY: Login sahifasida yoki Bosh sahifada bo'lsa -> Dashboardga otamiz
  if (pathname === "/auth/login" || pathname === "/login" || pathname === "/") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  // 2-SENARIY: ROLGA MOS KELMAYDIGAN JOYGA KIRSA (Strict RBAC)
  // Bu yerda mantiq: Agar Owner "/cashier" ga kirsa, uni "/login" ga emas, 
  // to'g'ridan-to'g'ri "/owner/dashboard" ga otamiz. Bu UX uchun yaxshiroq.

  if (pathname.startsWith("/owner") && role !== "owner") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  if (pathname.startsWith("/cashier") && role !== "cashier" && role !== "owner") {
    // Owner kassir panelga kirishi mumkin
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  if (pathname.startsWith("/seller") && role !== "seller") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  // SuperAdmin - faqat developer
  if (pathname.startsWith("/superadmin") && role !== "developer") {
    return NextResponse.redirect(new URL(correctDashboard, req.url));
  }

  // Hammasi joyida bo'lsa, yo'lida davom etsin
  return NextResponse.next();
}

// Config: Middleware qaysi yo'llarda ishlashini belgilaydi
export const config = {
  matcher: [
    "/",
    "/login",
    "/auth/login",
    "/owner/:path*",
    "/cashier/:path*",
    "/seller/:path*",
    "/superadmin/:path*",
    "/dashboard/:path*",
    "/unauthorized"
  ],
};