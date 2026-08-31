import { create } from "zustand";
import api from "../services/api.js";

export const useAuthStore = create((set, get) => ({
  admin: (() => {
    try {
      const stored = localStorage.getItem("otaku_admin_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("otaku_admin_token") || null,
  isAuthenticated: !!localStorage.getItem("otaku_admin_token"),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.status && res.token) {
        localStorage.setItem("otaku_admin_token", res.token);
        localStorage.setItem("otaku_admin_user", JSON.stringify(res.admin));
        set({
          admin: res.admin,
          token: res.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return { success: true };
      }
      throw new Error(res.message || "Login failed");
    } catch (err) {
      set({ loading: false, error: err.message || "Failed to sign in" });
      return { success: false, error: err.message || "Failed to sign in" };
    }
  },

  logout: () => {
    localStorage.removeItem("otaku_admin_token");
    localStorage.removeItem("otaku_admin_user");
    set({
      admin: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("otaku_admin_token");
    if (!token) {
      set({ isAuthenticated: false, admin: null, token: null });
      return;
    }

    try {
      const res = await api.get("/auth/me");
      if (res.status && res.admin) {
        localStorage.setItem("otaku_admin_user", JSON.stringify(res.admin));
        set({ admin: res.admin, isAuthenticated: true });
      } else {
        get().logout();
      }
    } catch {
      get().logout();
    }
  },
}));

export default useAuthStore;
