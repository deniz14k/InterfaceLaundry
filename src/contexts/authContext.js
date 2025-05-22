// src/contexts/authContext.js
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

function parseToken(token) {
  const decoded = jwtDecode(token);

  return {
    ...decoded,
    // ASP.NET Identity role claim
    role: decoded[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] || null,
    // NameIdentifier claim holds the phone
    phone: decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] || null,
    // Name claim holds the real user name
    name: decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    ] || null,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );
  const [user, setUser] = useState(() => {
    const tok = localStorage.getItem("token");
    return tok ? parseToken(tok) : null;
  });

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
