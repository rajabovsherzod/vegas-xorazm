import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL; 
          
          // Agar baseUrl bo'lmasa, xato qaytarish
          if (!baseUrl) throw new Error("API URL topilmadi");

          const { data } = await axios.post(`${baseUrl}/auth/login`, {
            username: credentials?.username,
            password: credentials?.password,
          });

          // Agar login muvaffaqiyatli bo'lsa
          if (data && data.success && data.token) {
            // 🔥 BU YERDA TYPESCRIPT XATOSINI YO'QOTAMIZ
            // Biz yuqorida User tipini kengaytirganimiz uchun endi bemalol
            // role, username, accessToken larni qaytarishimiz mumkin.
            return {
              id: String(data.data.user.id), // ID string bo'lishi kerak
              name: data.data.user.fullName,
              username: data.data.user.username,
              role: data.data.user.role,
              accessToken: data.token,
              // email va image shart emas, agar User tipida optional (?) qilingan bo'lsa
            };
          }

          return null;
        } catch (error: any) {
          console.error("Login Error:", error.response?.data?.message || error.message);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Login paytida kelgan ma'lumotlarni JWT ga saqlaymiz
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // JWT dagi ma'lumotlarni Sessionga chiqaramiz (Frontend uchun)
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 kun
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};