import { create } from 'zustand';

interface ToastState {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }>;
  addToast: (toast: Omit<ToastState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).substr(2, 9) }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export const toast = {
  success: (title: string, description?: string) => {
    useToast.getState().addToast({ title, description, variant: 'default' });
  },
  error: (title: string, description?: string) => {
    useToast.getState().addToast({ title, description, variant: 'destructive' });
  },
}; 