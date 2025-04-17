"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Loader2, ArrowRight } from "lucide-react"
import { signInAnonymously } from "@/lib/anonymous-auth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSkipLoading, setIsSkipLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // Check if login was successful
      if (data.user) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        // Redirect to dashboard
        router.push("/dashboard")
        router.refresh() // Refresh to update auth state in components
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipLogin = async () => {
    setIsSkipLoading(true)

    try {
      const { success, error } = await signInAnonymously()

      if (!success) {
        toast({
          title: "Anonymous login failed",
          description: error || "Failed to create anonymous session",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Welcome to Specky!",
        description: "You're using the app as a guest. Your data will be saved to your anonymous account.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Skip login error:", error)
      toast({
        title: "Anonymous login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSkipLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Log in to your account</h1>
        <p className="text-zinc-400">Enter your email and password to continue</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-zinc-800 border-zinc-700"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-zinc-800 border-zinc-700"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-zinc-900 px-2 text-zinc-400">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-zinc-700 hover:bg-zinc-800"
        onClick={handleSkipLogin}
        disabled={isSkipLoading}
      >
        {isSkipLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating guest session...
          </>
        ) : (
          <>
            Skip Login
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <div className="text-center text-sm">
        <p className="text-zinc-400">
          Don't have an account?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/signup")}>
            Sign up
          </Button>
        </p>
      </div>
    </div>
  )
}
