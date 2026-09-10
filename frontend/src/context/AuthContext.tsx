import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, UserRole } from "../Types/Artist";
import {
  DEMO_ARTIST,
  DEMO_PROMOTER,
  ensureDemoGigs,
} from "../Services/demoStore";
import { saveAuth, clearAuth, getStoredUser, updateStoredUser } from "../Services/authService";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loginDemo: (role: "artist" | "promoter") => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = getStoredUser();
    if (stored) {
      ensureDemoGigs();
      return stored as User;
    }
    return null;
  });

  const loginDemo = useCallback((role: "artist" | "promoter") => {
    const demo = role === "artist" ? DEMO_ARTIST : DEMO_PROMOTER;
    ensureDemoGigs();
    saveAuth(`demo-token-${demo.id}`, demo);
    setUser(demo);
  }, []);

  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      // Demo shortcuts
      if (email.toLowerCase() === DEMO_ARTIST.email) {
        loginDemo("artist");
        return;
      }
      if (email.toLowerCase() === DEMO_PROMOTER.email) {
        loginDemo("promoter");
        return;
      }

      // Fall through to real API if available
      const { login } = await import("../Services/authService");
      const res = await login({ email, password });
      const mapped: User = {
        ...res.user,
        role:
          res.user.role === "artist"
            ? "artist"
            : res.user.role === "client"
              ? "promoter"
              : (res.user.role as UserRole),
      };
      saveAuth(res.token, mapped);
      setUser(mapped);
    },
    [loginDemo]
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    }) => {
      const { register: apiRegister } = await import("../Services/authService");
      const role =
        input.role === "promoter" ? "client" : input.role === "artist" ? "artist" : "client";
      const res = await apiRegister({
        name: input.name,
        email: input.email,
        password: input.password,
        role: role as "client" | "artist",
      });
      const mapped: User = {
        ...res.user,
        role: input.role,
      };
      saveAuth(res.token, mapped);
      setUser(mapped);
    },
    []
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    const next = updateStoredUser(patch);
    if (next) setUser(next as User);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loginDemo,
      loginWithCredentials,
      register,
      updateUser,
      logout,
    }),
    [user, loginDemo, loginWithCredentials, register, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
