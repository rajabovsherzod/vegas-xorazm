import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Token uchun zarur bo'lgan custom tiplar
interface CustomAuthUser {
  id: string;
  name: string;
  username: string;
  role: string;
  accessToken: string;
}

export const authOptions: NextAuthOptions = {
  // 1. PROVIDERS (Backendga so'rov yuborish)
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // 🔥 MUHIM FIX: Server-side (Docker ichida) bo'lsak, ichki tarmoqdan foydalanamiz
        // Aks holda (masalan local dev da) public URL dan foydalanamiz.
        const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

        try {
          console.log(`NextAuth Login Attempt to: ${baseUrl}/auth/login`);

          const res = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          });

          const response = await res.json();

          console.log("NextAuth Backend Response:", response);

          if (res.ok && response.success) {
            const { user, accessToken } = response.data;

            // User obyektini NextAuth tushunadigan formatga o'tkazamiz
            return {
              id: user.id.toString(),
              name: user.fullName || user.username,
              username: user.username,
              role: user.role,
              accessToken: accessToken,
            } as CustomAuthUser;
          }
          
          // Agar backend xato qaytarsa
          console.error("Login failed:", response.message);
          return null;

        } catch (error) {
          console.error("Login fetch error:", error);
          return null;
        }
      },
    }),
  ],

  // 2. CALLBACKS (Ma'lumotlarni saqlash va uzatish)
  callbacks: {
    // JWT: User login qilganda ma'lumotlarni tokenga yozamiz
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomAuthUser;
        return {
          ...token,
          id: customUser.id,
          username: customUser.username,
          role: customUser.role,
          accessToken: customUser.accessToken,
        };
      }
      return token;
    },

    // SESSION: Token ichidagi ma'lumotlarni client sessionga o'tkazamiz
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
          role: token.role as string,
          accessToken: token.accessToken as string,
        };
      }
      return session;
    },
  },

  // 3. PAGES
  pages: {
    signIn: "/auth/login",
    error: "/auth/login", // Xatolik bo'lsa ham loginga qaytsin
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 kun
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Dev rejimda to'liq loglarni ko'rsatish
};