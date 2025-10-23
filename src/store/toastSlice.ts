import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: "info" | "success" | "warning" | "error";
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { id, ...action.payload };

      // Keep max 5 toasts
      state.toasts = [newToast, ...state.toasts.slice(0, 4)];
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions;
export default toastSlice.reducer;
