import { create } from 'zustand';
import type { Theme, Toast, ToastType } from '@/types';
import { nanoid } from 'nanoid';
import { THEME_STORAGE_KEY } from '@/lib/constants';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Toast
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) ?? 'system';
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Theme
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    set({ theme });
  },

  // Toast
  toasts: [],
  addToast: (type, message, duration) => {
    const id = nanoid();
    const defaultDurations: Record<ToastType, number | undefined> = {
      success: 3000,
      error: undefined, // manual close
      warning: 5000,
      info: 3000,
    };
    const toast: Toast = { id, type, message, duration: duration ?? defaultDurations[type] };
    set((s) => ({ toasts: [...s.toasts.slice(-2), toast] })); // max 3
    if (toast.duration) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, toast.duration);
    }
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
