import { createContext, useContext, useState, ReactNode } from "react";
import { redirect,useNavigate  } from "@tanstack/react-router";
import AuthContextType from "../models/AuthContext";
import User from "../models/User";


const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const register = async (name: string, email: string, password: string, phone: string) => {
      const userToRegister = { name, email, password, phone };
    try {
      const response = await fetch("https://localhost:7197/api/Users/Registration", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userToRegister),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      console.log('Registration successful:', data);
      navigate({ to: "/auth/login", replace: true });   
         return;
    }catch (error){
      console.error('Registration error:', error);
      //alert('Regisztrációs hiba: ' + (error instanceof Error ? error.message : 'Ismeretlen hiba'));  
    };
  };

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
        // throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login successful:', data);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      navigate({ to: "/", replace: true });
      return;
    }catch(error){
      console.error('Login error:', error);
      localStorage.removeItem('user');
      //alert('Login failed. Please check your credentials.');
    };
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate({ to: "/auth/login" });
  };

  const requireAuth = (allowedRoles?: number[]) => {
    if (!user) {
      redirect({ to: "/auth/login", replace: true });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.roleId)) {
      redirect({ to: "/", replace: true }); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, login,register, logout, requireAuth }}>
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
