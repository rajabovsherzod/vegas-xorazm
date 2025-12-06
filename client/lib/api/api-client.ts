import { getSession, signOut } from "next-auth/react";
import { ENV } from "@/lib/config/env";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  ValidationError,
  ConflictError,
} from "./errors";

interface RequestOptions extends RequestInit {
  skipContentType?: boolean;
}

class ApiClient {
  private getBaseUrl(): string {
    // Agar kod Serverda (Docker ichida) ishlayotgan bo'lsa
    if (typeof window === 'undefined') {
      // Docker ichidagi backend manzili (service nomi orqali)
      // Lekin biz docker-compose da 'backend' deb nomlaganmiz
      return process.env.BACKEND_URL || "http://backend:5000/api/v1"; 
    }
    // Agar kod Brauzerda ishlayotgan bo'lsa
    return ENV.API_URL || "http://localhost:5000/api/v1";
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const baseUrl = this.getBaseUrl();
    let token: string | undefined;

    if (typeof window === 'undefined') {
      try {
        const { authOptions } = await import("@/lib/auth");
        const { getServerSession } = await import("next-auth");
        const session = await getServerSession(authOptions);
        token = session?.user?.accessToken;
      } catch (e) {
        console.log("Serverda session olishda xatolik:", e);
      }
    } else {
      const session = await getSession();
      token = session?.user?.accessToken;
    }

    const { skipContentType, ...fetchOptions } = options;

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
      // Dinamik aniqlangan BaseURL dan foydalanamiz
      const fullUrl = `${baseUrl}${endpoint}`;
      console.log(`[ApiClient] Requesting: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        cache: 'no-store'
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const resJson = await response.json();

      if (Array.isArray(resJson)) {
        return resJson as T;
      }

      if (resJson.data !== undefined) {
        return resJson.data as T;
      } else {
        return resJson as T;
      }

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("[ApiClient] Error:", error);
      throw new ServerError("Tarmoq yoki Server xatoligi");
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = "Noma'lum xatolik";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }

    switch (response.status) {
      case 401:
        if (typeof window !== 'undefined') {
           await signOut({ redirect: true, callbackUrl: "/" });
        }
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