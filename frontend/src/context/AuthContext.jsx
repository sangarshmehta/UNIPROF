import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getStoredGender,
  getStoredName,
  getStoredRole,
  getStoredToken,
  login as loginRequest,
  register as registerRequest,
  saveSession,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [role, setRole] = useState(getStoredRole());
  const [name, setName] = useState(getStoredName());
  const [gender, setGender] = useState(getStoredGender());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    saveSession({ token, role, name, gender });
  }, [token, role, name, gender]);

  async function login(email, password, profile = {}) {
    const result = await loginRequest({ email, password });
    setToken(result?.token || getStoredToken());
    setRole(result?.role || "");
    setName(result?.name || profile.name || getStoredName() || "");
    setGender(result?.gender || profile.gender || getStoredGender() || "");
    return result;
  }

  async function register({ name: profileName, gender: profileGender, email, password }) {
    setIsLoading(true);
    try {
      await registerRequest({ name: profileName, gender: profileGender, email, password });
      const loginResult = await login(email, password, {
        name: profileName || "",
        gender: profileGender || "",
      });
      return loginResult;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    clearSession();
    setToken("");
    setRole("");
    setName("");
    setGender("");
  }

  const user = useMemo(
    () => ({
      token,
      role,
      name,
      gender,
    }),
    [token, role, name, gender],
  );

  const value = useMemo(
    () => ({
      token,
      role,
      name,
      gender,
      user,
      isLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      register,
    }),
    [token, role, name, gender, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
