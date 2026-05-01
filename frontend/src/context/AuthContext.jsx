import React, { createContext, useEffect, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = (data) => {
    setUser(data);
    localStorage.setItem("userInfo", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
  };

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${user?.token}` }
  });

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}