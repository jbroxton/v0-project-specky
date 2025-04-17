"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth as useSupabaseAuth, type AuthUser } from "@/hooks/use-auth"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  authUser: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  login: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
