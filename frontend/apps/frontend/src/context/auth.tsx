import { api } from "@cv-builder/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type User = { id: string; email: string };

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "cv_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.auth.me().then((result) => {
      if (result.isOk()) {
        setUser({ id: result.value.id, email: result.value.email });
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const result = await api.auth.login(email, password);
      if (result.isOk()) {
        localStorage.setItem(TOKEN_KEY, result.value.access_token ?? "");
        const meResult = await api.auth.me();
        if (meResult.isOk()) {
          setUser({ id: meResult.value.id, email: meResult.value.email });
        }
        return null;
      }
      return result.error.message;
    },
    [],
  );

  const register = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const result = await api.auth.register({ email, password });
      if (result.isOk()) {
        return login(email, password);
      }
      return result.error.message;
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}