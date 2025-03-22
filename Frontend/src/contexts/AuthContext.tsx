import { createContext, useContext, useState, ReactNode } from "react";
import { redirect } from "@tanstack/react-router";
import AuthContextType from "../models/AuthContext";
import User from "../models/User";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (username: string, role: "admin" | "user") => {
    const newUser = { username, role };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    redirect({ to: "/" });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    redirect({ to: "/auth/login" });
  };

  const requireAuth = (allowedRoles?: string[]) => {
    if (!user) {
      redirect({ to: "/auth/login", replace: true });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      redirect({ to: "/", replace: true }); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
};


export const getCurrentUser = () => {
  const userData = localStorage.getItem("user");

  if (!userData) return null; 

  try {
    return JSON.parse(userData); 
  } catch (error) {
    console.error("Hibás felhasználói adat!", error);
    return null;
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
