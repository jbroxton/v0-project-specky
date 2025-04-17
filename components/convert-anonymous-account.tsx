"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { convertAnonymousToRegistered } from "@/lib/anonymous-auth"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function ConvertAnonymousAccount() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { success, error } = await convertAnonymousToRegistered(email, password)

      if (!success) {
        toast({
          title: "Conversion failed",
          description: error || "Failed to convert your account",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Account created successfully",
        description: "Your anonymous account has been converted to a registered account.",
      })

      // Refresh the page to update auth state
      router.refresh()
    } catch (error) {
      console.error("Error converting account:", error)
      toast({
        title: "Conversion failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>Convert your guest account to a permanent account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConvert} className="space-y-4">
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-zinc-400">
        <p>
          By creating an account, you'll be able to access all features and your data will be securely saved to your
          account.
        </p>
      </CardFooter>
    </Card>
  )
}
