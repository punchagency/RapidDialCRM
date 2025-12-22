import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { User } from "@/lib/types";

type AuthResponse = {
  token: string;
  user: User;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  googleLogin: (idToken: string) => Promise<AuthResponse>;
  register: (payload: { name: string; email: string; password: string; role?: string; territory?: string }) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth.user";
const AUTH_TOKEN_KEY = "auth_token"; // legacy key used by other helpers

type StoredAuth = {
  access_token: string;
  user: User;
  refresh_token?: string | null;
};

const readStoredAuth = (): StoredAuth | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = readStoredAuth();
    return stored?.access_token || localStorage.getItem(AUTH_TOKEN_KEY);
  });
  const [user, setUser] = useState<User | null>(() => readStoredAuth()?.user || null);
  const [loading, setLoading] = useState<boolean>(!!token);

  const persistAuth = (payload: AuthResponse) => {
    const authToStore: StoredAuth = {
      access_token: payload.token,
      user: payload.user,
    };
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authToStore));
    localStorage.setItem(AUTH_TOKEN_KEY, payload.token); // keep for helpers expecting this key
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await CustomServerApi.me();
        if (error || !data) {
          throw new Error(error || "Unable to fetch profile");
        }
        setUser(data);
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ access_token: token, user: data })
        );
      } catch (err) {
        console.warn("Auth bootstrap failed, clearing session", err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data, error } = await CustomServerApi.login(email, password);
    if (error || !data) {
      throw new Error(error || "Login failed");
    }
    const payload: AuthResponse = { token: data.token, user: data.user };
    persistAuth(payload);
    return payload;
  };

  const googleLogin = async (idToken: string) => {
    const { data, error } = await CustomServerApi.googleLogin(idToken);
    if (error || !data) {
      throw new Error(error || "Google login failed");
    }
    const payload: AuthResponse = { token: data.token, user: data.user };
    persistAuth(payload);
    return payload;
  };

  const register = async (payload: { name: string; email: string; password: string; role?: string; territory?: string }) => {
    const { data, error } = await CustomServerApi.register(payload);
    if (error || !data) {
      throw new Error(error || "Registration failed");
    }
    const result: AuthResponse = { token: data.token, user: data.user };
    persistAuth(result);
    return result;
  };

  const refreshUser = async (): Promise<User | null> => {
    if (!token) return null;
    try {
      const { data, error } = await CustomServerApi.me();
      if (error || !data) {
        throw new Error(error || "Unable to refresh user");
      }
      setUser(data);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ access_token: token, user: data })
      );
      return data;
    } catch (err) {
      clearAuth();
      return null;
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      googleLogin,
      register,
      logout: clearAuth,
      refreshUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

