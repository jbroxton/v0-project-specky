"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { toast } from "@/hooks/use-toast"
import { getOrCreateAnonymousId } from "@/lib/anonymous-id"

export interface AuthUser {
  id: string
  email: string | null
  name: string | null
  picture: string | null
  isAnonymous: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user || null)

        // Create the unified authUser object
        if (session?.user) {
          setAuthUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email || null,
            picture: session.user.user_metadata?.avatar_url || null,
            isAnonymous: false,
          })
        } else {
          // Handle anonymous user
          const anonymousId = getOrCreateAnonymousId()
          setAuthUser({
            id: anonymousId,
            email: null,
            name: null,
            picture: null,
            isAnonymous: true,
          })
        }
      } catch (error) {
        console.error("Error getting session:", error)
        setUser(null)

        // Fallback to anonymous user
        const anonymousId = getOrCreateAnonymousId()
        setAuthUser({
          id: anonymousId,
          email: null,
          name: null,
          picture: null,
          isAnonymous: true,
        })
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)

      // Update the unified authUser object
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email || null,
          picture: session.user.user_metadata?.avatar_url || null,
          isAnonymous: false,
        })
      } else {
        // Handle anonymous user
        const anonymousId = getOrCreateAnonymousId()
        setAuthUser({
          id: anonymousId,
          email: null,
          name: null,
          picture: null,
          isAnonymous: true,
        })
      }
    })

    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      })

      // Reset to anonymous user
      const anonymousId = getOrCreateAnonymousId()
      setAuthUser({
        id: anonymousId,
        email: null,
        name: null,
        picture: null,
        isAnonymous: true,
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  const login = () => {
    // Redirect to login page
    window.location.href = "/login"
  }

  return {
    user, // Original Supabase user
    authUser, // Unified user object for app consumption
    loading,
    signOut,
    login,
    isAuthenticated: !!user,
  }
}
