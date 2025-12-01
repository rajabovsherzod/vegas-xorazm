import { getSession, signOut } from "next-auth/react";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  ValidationError,
  ConflictError,
} from "./errors";

const API_URL = "http://localhost:5000/api/v1"; // .env dan olsa ham bo'ladi

interface RequestOptions extends RequestInit {
  skipContentType?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // 1. Tokenni olish
    let token: string | undefined;
    
    if (typeof window === 'undefined') {
       // Server-side: NextAuth'ning getServerSession'idan foydalanish kerak
       // Lekin bu yerda oddiy getSession() serverda ishlamasligi mumkin yoki context kerak.
       // Next.js 13+ da server componentlarda headers() yoki cookies() orqali token olish tavsiya qilinadi.
       // Hozircha, agar serverda bo'lsak, va getSession ishlamasa, biz bu qismni o'tkazib yuborishimiz mumkin,
       // yoki authOptions ni import qilib getServerSession(authOptions) ishlatishimiz kerak.
       
       // FIX: Server componentlardan to'g'ridan-to'g'ri chaqirilganda sessiya muammosi bo'lishi mumkin.
       // Vaqtincha "Server Error" oldini olish uchun try-catch qo'yamiz.
       try {
         const { authOptions } = await import("@/lib/auth"); 
         const { getServerSession } = await import("next-auth");
         const session = await getServerSession(authOptions);
         token = session?.user?.accessToken;
       } catch (e) {
         console.log("Serverda session olishda xatolik (ehtimol static generatsiya):", e);
       }
    } else {
       // Client-side
       const session = await getSession();
       token = session?.user?.accessToken;
    }

    const { skipContentType, ...fetchOptions } = options;

    // 2. Headerni sozlash
    const headers: Record<string, string> = {
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!skipContentType) {
      headers["Content-Type"] = "application/json";
    }

    try {
      // 3. So'rov yuborish
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        headers,
        cache: 'no-store' // SSR paytida keshlash muammosini oldini olish uchun
      });

      // 4. Xatolarni ushlash
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // 5. Muvaffaqiyatli javob
      // Bizning backend { success: true, data: ..., message: ... } qaytaradi
      const resJson = await response.json();
      
      // DEBUG: Backenddan nima kelayotganini ko'rish uchun
      console.log(`API Response [${endpoint}]:`, resJson);

      // Agar backend massiv qaytarsa va u data ichida bo'lmasa (ba'zi backendlar to'g'ridan to'g'ri array qaytaradi)
      if(Array.isArray(resJson)) return resJson as T;

      // Backend { success, data, message } formatida qaytaradi
      // data ni qaytaramiz
      return resJson.data !== undefined ? resJson.data : resJson; 

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new ServerError("Tarmoq yoki Server xatoligi");
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = "Noma'lum xatolik";
    try {
      const errorData = await response.json();
      // Bizning backend "message" maydonida xatoni yuboradi
      errorMessage = errorData.message || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }

    switch (response.status) {
      case 401:
        // Token eskirdi yoki noto'g'ri -> Logout
        await signOut({ redirect: true, callbackUrl: "/" });
        throw new AuthenticationError(errorMessage);
      case 403:
        throw new AuthorizationError(errorMessage);
      case 404:
        throw new NotFoundError(errorMessage);
      case 409:
        throw new ConflictError(errorMessage);
      case 400:
        throw new ValidationError(errorMessage);
      case 500:
        throw new ServerError(errorMessage);
      default:
        throw new AppError(errorMessage, "UNKNOWN", response.status);
    }
  }

  // --- Qulay Metodlar ---

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();