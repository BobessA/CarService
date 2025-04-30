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

  const login = async (email: string, password: string) => {

    try {
      const base64Credentials = btoa(`${email}:${password}`);
      const response = await fetch('https://localhost:7197/api/Users/Login', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Credentials}`
        },
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      localStorage.setItem("user", JSON.stringify(data));


    }catch(error){
      console.error('Login error:', error);
      localStorage.removeItem('user');
      alert('Login failed. Please check your credentials.');
    };
    //I know this used to be redirect, but it didn't work :(
    window.location.href = "/";
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
    console.log(userData); 
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
