import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(
  () => localStorage.getItem("auth") === "true"
);

const login = (username: String, password: String) => {
  if (username === "admin" && password === "admin") {
    localStorage.setItem("auth", "true");
    setIsAuthenticated(true);
    return true;
  }
  return false;
};

const logout = () => {
  localStorage.removeItem("auth");
  setIsAuthenticated(false);
};

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}