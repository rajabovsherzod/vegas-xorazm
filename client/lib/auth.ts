import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  // 1. PROVIDERS
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
          // EXPRESS BACKENDGA SO'ROV YUBORAMIZ
          const res = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const response = await res.json();

          // Agar backend muvaffaqiyatli javob qaytarsa (token + user)
          if (res.ok && response.success) {
            const { user, accessToken } = response.data;
            
            // NextAuth ga qaytaramiz (bu ma'lumot JWT ichiga tushadi)
            return {
              id: user.id.toString(),
              name: user.fullName,
              username: user.username,
              role: user.role,
              accessToken: accessToken, // Tokenni saqlab olamiz
            };
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
    // JWT yaratilayotganda ishlaydi
    async jwt({ token, user }) {
      if (user) {
        // Login bo'lgan paytda userni token ichiga yozamiz
        return {
          ...token,
          id: user.id,
          username: user.username,
          role: user.role,
          accessToken: user.accessToken,
        };
      }
      return token;
    },

    // Clientga session berilayotganda ishlaydi
    async session({ session, token }) {
      // Token ichidagi ma'lumotlarni sessionga o'tkazamiz
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          role: token.role,
          accessToken: token.accessToken, // Tokenni clientga beramiz (API so'rovlar uchun)
        },
      };
    },
  },

  // 3. PAGES (Bizning chiroyli login sahifamiz)
  pages: {
    signIn: "/", // Login page manzili
  },

  session: {
    strategy: "jwt",
  },
  secret: "bu_juda_maxfiy_kalit_front_uchun", // .env ga olgan ma'qul
};