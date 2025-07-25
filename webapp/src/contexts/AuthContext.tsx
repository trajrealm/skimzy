// src/contexts/AuthContext.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext, DecodedToken } from "./AuthContextTypes";

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const decodeToken = (token: string): DecodedToken | null => {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  };
 
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  );
  const [user, setUser] = useState<DecodedToken | null>(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    return storedToken ? decodeToken(storedToken) : null;
  });

  const navigate = useNavigate();

  const login = (newToken: string) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
    setUser(decodeToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
