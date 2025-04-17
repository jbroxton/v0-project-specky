"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ensureAnonymousUser } from "@/lib/auth-helpers"
import { Loader2 } from "lucide-react"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { success, error } = await ensureAnonymousUser()

        if (!success) {
          console.error("Error ensuring anonymous user:", error)
          setError(error || "Authentication failed")
        }
      } catch (err) {
        console.error("Error in auth initialization:", err)
        setError("Authentication failed")
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-zinc-400">Initializing application...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Authentication Error</p>
          <p className="text-zinc-400">{error}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
