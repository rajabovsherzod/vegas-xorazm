import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ENV } from "@/lib/config/env";

// Token uchun zarur bo'lgan custom tiplar (Biz uni next-auth.d.ts da yaratgandik)
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

        try {
          console.log("NextAuth Login Attempt:", credentials);

          const res = await fetch(`${ENV.API_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
            cache: "no-store", // Keshlashni o'chirish
          });

          const response = await res.json();

          console.log("NextAuth Backend Response:", response);

          if (res.ok && response.success) {
            const { user, accessToken } = response.data;

            // 🚨 MUHIM: Bu yerda NextAuthga bizning custom maydonlarimiz borligini bildiramiz
            return {
              id: user.id.toString(),
              name: user.fullName, // NextAuth nomi
              username: user.username,
              role: user.role, // Custom data
              accessToken: accessToken, // Custom data
            } as CustomAuthUser; // Katta ehtimol bilan xato shu yerda yashiringan
          }
          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],

  // 2. CALLBACKS (Ma'lumotlarni saqlash va uzatish)
  callbacks: {
    // 🔥 ZIRHLI FIX: Bu yerda custom ma'lumotlarni token ichiga to'g'ri yozamiz
    async jwt({ token, user }) {
      if (user) {
        // 'user' bu yerda authorize() dan kelgan CustomAuthUser tipi bo'lishi kerak
        const customUser = user as CustomAuthUser;

        return {
          ...token,
          id: customUser.id,
          username: customUser.username,
          // ✅ XAVFSIZLIK: ROL VA TOKENNI TO'G'RI O'TKAZISH
          role: customUser.role,
          accessToken: customUser.accessToken,
        };
      }
      return token;
    },

    // SESSION CALLBACK: Token ichidagi ma'lumotni client sessionga o'tkazamiz
    async session({ session, token }) {
      // Token ichidagi ma'lumotlarni sessionga o'tkazamiz
      session.user = {
        ...session.user,
        id: token.id,
        username: token.username,
        role: token.role, // Middleware shu maydonni ko'rishi SHART!
        accessToken: token.accessToken,
      };
      return session;
    },
  },

  // 3. PAGES
  pages: {
    signIn: "/auth/login",
  },

  session: {
    strategy: "jwt",
  },
  // NEXTAUTH_SECRET albatta .env da bo'lishi kerak
  secret: process.env.NEXTAUTH_SECRET,
};