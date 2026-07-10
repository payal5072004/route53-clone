"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

interface AuthContextValue {
  username: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session on first load (session persistence requirement).
  useEffect(() => {
    const storedUser = localStorage.getItem("r53_user");
    const storedToken = localStorage.getItem("r53_token");
    if (storedUser && storedToken) {
      setUsername(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (usernameInput: string, password: string) => {
      const res = await api.post("/api/auth/login", {
        username: usernameInput,
        password,
      });
      localStorage.setItem("r53_token", res.data.token);
      localStorage.setItem("r53_user", res.data.username);
      setUsername(res.data.username);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // even if the call fails, still clear the local session
    }
    localStorage.removeItem("r53_token");
    localStorage.removeItem("r53_user");
    setUsername(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ username, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
