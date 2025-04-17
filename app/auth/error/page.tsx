"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "unknown_error"

  const errorMessages: Record<string, string> = {
    invalid_state: "Invalid state parameter. This could be a security issue.",
    no_code: "No authorization code received from Google.",
    token_exchange: "Failed to exchange authorization code for tokens.",
    server_error: "A server error occurred during authentication.",
    invalid_tokens: "Failed to parse authentication tokens.",
    no_tokens: "No authentication tokens received.",
    unknown_error: "An unknown error occurred during authentication.",
  }

  const errorMessage = errorMessages[error] || errorMessages.unknown_error

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Authentication Error</h1>
          <p className="mt-2 text-muted-foreground">{errorMessage}</p>
        </div>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
