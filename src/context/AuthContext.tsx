"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface AuthContextType {
  user: any;
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  logout: async () => {},
  refreshAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     🔄 REFRESH AUTH (Reusable)
  ================================= */
  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data?.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Refresh auth error:", error);
      setUser(null);
    }
  }, []);

  /* ===============================
     🧠 INITIAL AUTH CHECK
  ================================= */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          setUser(data?.user || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ===============================
     🚪 LOGOUT
  ================================= */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);