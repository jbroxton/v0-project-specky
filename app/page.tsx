"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/hooks/use-app-context"
import { Button } from "@/components/ui/button"
import { CheckSquare, FileText, Zap, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Home() {
  const { isLoggedIn, login } = useAppContext()
  const router = useRouter()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard")
    }
  }, [isLoggedIn, router])

  const handleLogin = () => {
    login()
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="border-b border-zinc-800">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold">Speqq</span>

            <nav className="hidden md:flex items-center gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-zinc-800 px-2">
                    Product
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Overview</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Features</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Use Cases</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Integrations</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-zinc-800 px-2">
                    Docs
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Getting Started</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">API Reference</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Tutorials</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Best Practices</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-zinc-800 px-2">
                    Pricing
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Plans</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Enterprise</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Compare</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-zinc-800">Contact Sales</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleLogin} className="text-white hover:bg-zinc-800">
              Sign In
            </Button>
            <Button onClick={handleLogin} className="bg-white text-black hover:bg-zinc-200">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-4xl text-center">
              {/* Apple-inspired headline and subtext */}
              <h1 className="font-display tracking-tight mb-6 text-3xl font-semibold md:text-4xl lg:text-5xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Elevate your product requirements.
              </h1>
              <div className="mb-10 mx-auto max-w-2xl">
                <div className="text-xl font-light text-zinc-400">
                  Define, refine, and deliver exceptional product requirements with precision and clarity.
                </div>
              </div>

              {/* Pulsing button */}
              <Button
                size="lg"
                onClick={handleLogin}
                className="mb-16 bg-white text-black hover:bg-zinc-200 sm:w-auto pulse-button"
              >
                Get Started
              </Button>

              {/* Feature boxes */}
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
                <div className="group relative overflow-visible rounded-3xl bg-transparent p-5 transition-all duration-300 hover:bg-zinc-900/10 border border-zinc-500/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/30 mb-3">
                    <CheckSquare className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="mb-1.5 text-base font-medium">Requirement Analysis</h3>
                  <div className="h-16 flex items-center">
                    <div className="text-xs text-zinc-400 font-light">
                      Analyze requirements for clarity and completeness with AI-powered insights.
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-visible rounded-3xl bg-transparent p-5 transition-all duration-300 hover:bg-zinc-900/10 border border-zinc-500/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/30 mb-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="mb-1.5 text-base font-medium">PRD Structuring</h3>
                  <div className="h-16 flex items-center">
                    <div className="text-xs text-zinc-400 font-light">
                      Get intelligent suggestions for organizing PRDs and documentation.
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-visible rounded-3xl bg-transparent p-5 transition-all duration-300 hover:bg-zinc-900/10 border border-zinc-500/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/30 mb-3">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="mb-1.5 text-base font-medium">Task Breakdown</h3>
                  <div className="h-16 flex items-center">
                    <div className="text-xs text-zinc-400 font-light">
                      Break down features into implementable tasks for development teams.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-6">
        <div className="container px-4 text-center text-zinc-500">
          <p>© {new Date().getFullYear()} Speqq. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
