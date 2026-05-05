"use client";

import { create } from "zustand";
import type { UserProfile } from "@/types";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }
    const data = await res.json();
    set({ user: data.user });
  },

  signup: async (email, password, displayName) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Signup failed");
    }
    const data = await res.json();
    set({ user: data.user });
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
