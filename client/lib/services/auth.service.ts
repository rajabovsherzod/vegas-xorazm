import { api } from "@/lib/api/api-client";

export interface UserProfile {
  id: number;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
}

export const authService = {
  getMe: () => {
    return api.get<UserProfile>("/auth/me");
  },
};