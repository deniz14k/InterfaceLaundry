// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

function parseToken(token) {
  const decoded = jwtDecode(token);

  // Extract the ASP.NET Identity role claim
  const role =
    decoded[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] || "";

  return {
    ...decoded,
    role,
  };
}

export function AuthProvider({ children }) {
  // initialize from localStorage
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );
  const [user, setUser] = useState(() =>
    token ? parseToken(token) : null
  );

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(parseToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  // whenever token changes (e.g. page reload), re-parse it
  useEffect(() => {
    if (token) {
      setUser(parseToken(token));
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
