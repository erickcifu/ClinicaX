import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useQueryClient } from "@tanstack/react-query";

import {
  getCurrentUser,
  loginRequest,
} from "../api/auth.api.js";

import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from "../storage/auth.storage.js";

import { AUTH_UNAUTHORIZED_EVENT } from "../../../services/http.js";

import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    removeAccessToken();
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      const token = getAccessToken();

      if (!token) {
        if (isActive) {
          setIsLoading(false);
        }

        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (isActive) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error(
          "No fue posible restaurar la sesión",
          error
        );

        if (isActive) {
          clearSession();
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, [clearSession]);

  useEffect(() => {
    function handleUnauthorized() {
      clearSession();
      setIsLoading(false);
    }

    window.addEventListener(
      AUTH_UNAUTHORIZED_EVENT,
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        AUTH_UNAUTHORIZED_EVENT,
        handleUnauthorized
      );
    };
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      const session = await loginRequest(credentials);

      if (!session?.token || !session?.user) {
        throw new Error(
          "El servidor devolvió una sesión no válida"
        );
      }

      queryClient.clear();
      saveAccessToken(session.token);
      setUser(session.user);

      return session;
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
