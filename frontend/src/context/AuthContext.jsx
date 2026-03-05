import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On app load, try to restore session from localStorage
 useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api.getMe()
        .then((data) => setUser(data.user))
        .catch(async () => {
          // Token may be expired — try to decode user from token directly
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload && payload.sub) {
              // Token still has user info, keep session alive
              setUser({ id: payload.sub, username: "User", email: "" });
            } else {
              localStorage.removeItem("access_token");
            }
          } catch {
            localStorage.removeItem("access_token");
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const data = await api.register({ username, email, password });
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
