"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { isAnonymousUser } from "@/lib/anonymous-auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const currentUser = session?.user || null
        setUser(currentUser)

        // Check if user is anonymous
        setIsAnonymous(currentUser ? isAnonymousUser(currentUser) : false)
      } catch (error) {
        console.error("Error getting session:", error)
        setUser(null)
        setIsAnonymous(false)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      setIsAnonymous(currentUser ? isAnonymousUser(currentUser) : false)
    })

    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isAnonymous,
  }
}
