"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { storeTokens } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function AuthSuccess() {
  const router = useRouter()

  useEffect(() => {
    // Extract tokens from URL fragment
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      if (hash && hash.includes("tokens=")) {
        const tokensStr = decodeURIComponent(hash.split("tokens=")[1])
        try {
          const tokens = JSON.parse(tokensStr)
          storeTokens(tokens)

          // Clear the URL fragment and redirect to the main app
          window.history.replaceState({}, document.title, window.location.pathname)
          router.push("/dashboard")
        } catch (error) {
          console.error("Failed to parse tokens:", error)
          router.push("/auth/error?error=invalid_tokens")
        }
      } else {
        router.push("/auth/error?error=no_tokens")
      }
    }
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h1 className="mt-6 text-2xl font-semibold">Logging you in...</h1>
      <p className="mt-2 text-muted-foreground">Please wait while we complete the authentication process.</p>
    </div>
  )
}
