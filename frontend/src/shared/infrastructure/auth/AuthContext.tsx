"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/shared/infrastructure/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "staff" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, employeeId?: string, role?: "admin" | "staff") => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Extraer rol del usuario (buscar en app_metadata primero, luego user_metadata)
  const extractRole = useCallback((user: User | null): UserRole => {
    if (!user) return null;

    // Primero buscar en app_metadata (establecido por el trigger o admin)
    const appRole = user.app_metadata?.role;
    if (appRole === 'admin' || appRole === 'staff') {
      return appRole;
    }

    // Fallback a user_metadata (establecido durante el registro)
    const userRole = user.user_metadata?.role;
    if (userRole === 'admin' || userRole === 'staff') {
      return userRole;
    }

    // Default a staff
    return "staff";
  }, []);

  // Inicializar sesión
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setRole(extractRole(session?.user ?? null));
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        setRole(extractRole(session?.user ?? null));
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, extractRole]);

  // Sign In
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      setSession(data.session);
      setUser(data.user);
      setRole(extractRole(data.user));

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Error de autenticación"
      };
    }
  };

  // Sign Up (para botones/staff o admin)
  const signUp = async (email: string, password: string, fullName: string, employeeId?: string, role: "admin" | "staff" = "staff") => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            employee_id: employeeId,
            role: role,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // Si Supabase requiere confirmación de email
      if (data.user && !data.session) {
        return { error: null, needsConfirmation: true };
      }

      // Si el registro es inmediato (sin confirmación)
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setRole(extractRole(data.user));
      }

      return { error: null, needsConfirmation: false };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Registration error",
      };
    }
  };

  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
  };

  // Refresh Session
  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    setSession(session);
    setUser(session?.user ?? null);
    setRole(extractRole(session?.user ?? null));
  };

  const value: AuthContextType = {
    user,
    session,
    role,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
