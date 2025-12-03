import { create } from "zustand";

interface UIStore {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;

  // Mobile sidebar
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  openMobileSidebar: () => void;

  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),

  // Mobile sidebar
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),

  // Modals
  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // Theme
  theme: "system",
  setTheme: (theme) => set({ theme }),
}));

