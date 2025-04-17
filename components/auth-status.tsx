"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2 } from "lucide-react"

export function AuthStatus() {
  const { user, loading, signOut, isAuthenticated } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-zinc-400">Loading...</span>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || "User"} />
              <AvatarFallback>{user.email?.[0].toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none text-white">{user.user_metadata?.full_name || "User"}</p>
            <p className="text-xs leading-none text-zinc-400">{user.email}</p>
          </div>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem onClick={() => router.push("/dashboard")} className="text-white hover:bg-zinc-800">
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile")} className="text-white hover:bg-zinc-800">
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={() => signOut().then(() => router.push("/"))}
            className="text-white hover:bg-zinc-800"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={() => router.push("/login")} className="text-white hover:bg-zinc-800">
        Log In
      </Button>
      <Button onClick={() => router.push("/signup")} className="bg-white text-black hover:bg-zinc-200">
        Sign Up
      </Button>
    </div>
  )
}
