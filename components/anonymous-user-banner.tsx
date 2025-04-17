"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { isAnonymousUser } from "@/lib/anonymous-auth"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export function AnonymousUserBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  // Only show for anonymous users and if not dismissed
  if (!user || !isAnonymousUser(user) || dismissed) {
    return null
  }

  return (
    <div className="bg-zinc-800 border-b border-zinc-700 py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm text-zinc-300">
          You're using Specky as a guest. Create an account to access all features and save your work.
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => router.push("/signup")}>
            Create Account
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
