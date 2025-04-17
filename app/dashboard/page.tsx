"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/hooks/use-app-context"
import type { Fix } from "@/components/enhanced-fixes-list"
import { toast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { UserDocumentsList } from "@/components/dashboard/user-documents-list"
import { RecentConversations } from "@/components/dashboard/recent-conversations"
import { UserStats } from "@/components/dashboard/user-stats"
import { useAuth } from "@/hooks/use-auth"

export default function Dashboard() {
  const { isLoggedIn, selectedDocId } = useAppContext()
  const router = useRouter()
  const [selectedText, setSelectedText] = useState("")
  const [isContextPaneOpen, setIsContextPaneOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [currentView, setCurrentView] = useState<"chat" | "fixes">("chat")
  const [fixes, setFixes] = useState<Fix[]>([])
  const [hoveredFixId, setHoveredFixId] = useState<string | null>(null)
  const [selectedFixId, setSelectedFixId] = useState<string | null>(null)
  const [showFixAnimation, setShowFixAnimation] = useState<string | null>(null)
  const [isLoadingFixes, setIsLoadingFixes] = useState(false)
  const { user } = useAuth()

  // Removed auto-login useEffect

  // Load fixes when a document is selected
  useEffect(() => {
    if (selectedDocId) {
      setIsLoadingFixes(true)

      // Fetch fixes for the document
      const fetchFixes = async () => {
        try {
          // In a real implementation, this would be an API call
          // For now, we'll just set empty fixes
          setFixes([])
        } catch (error) {
          console.error("Error fetching fixes:", error)
        } finally {
          setIsLoadingFixes(false)
        }
      }

      fetchFixes()
    }
  }, [selectedDocId])

  const toggleContextPane = () => {
    setIsContextPaneOpen(!isContextPaneOpen)
  }

  // Handle fix action (accept/reject) with animation
  const handleFixAction = (id: string, apply: boolean) => {
    if (apply) {
      // Show animation
      setShowFixAnimation(id)

      // After animation completes, update the fix status
      setTimeout(() => {
        setFixes(fixes.map((fix) => (fix.id === id ? { ...fix, applied: apply } : fix)))
        setShowFixAnimation(null)

        // Auto-navigate to the next fix after a short delay
        setTimeout(() => {
          const currentIndex = fixes.findIndex((fix) => fix.id === id)
          const nextUnappliedFix = fixes.find((fix, index) => index > currentIndex && fix.applied === null)
          if (nextUnappliedFix) {
            setSelectedFixId(nextUnappliedFix.id)
          } else {
            setSelectedFixId(null)
          }
        }, 500)
      }, 1000)
    } else {
      // For rejection, just update the status immediately
      setFixes(fixes.map((fix) => (fix.id === id ? { ...fix, applied: apply } : fix)))
    }
  }

  // Handle fix hover
  const handleFixHover = (id: string | null) => {
    setHoveredFixId(id)
  }

  // Add a handler for fix selection
  const handleFixSelect = (id: string) => {
    setSelectedFixId(id)
  }

  // Add a handler for returning to the list
  const handleReturnToList = () => {
    setSelectedFixId(null)
  }

  const setupDatabase = async () => {
    try {
      const response = await fetch("/api/setup-database")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Database Setup Successful",
          description: "Database tables and RLS policies have been created.",
        })
      } else {
        toast({
          title: "Database Setup Failed",
          description: data.error || "An unknown error occurred.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error setting up database:", error)
      toast({
        title: "Database Setup Failed",
        description: "An error occurred while setting up the database.",
        variant: "destructive",
      })
    }
  }

  const testDeepInfraAPI = async () => {
    try {
      const response = await fetch("/api/test-deepinfra")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "DeepInfra API Test Successful",
          description: data.message,
        })
      } else {
        toast({
          title: "DeepInfra API Test Failed",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing DeepInfra API:", error)
      toast({
        title: "DeepInfra API Test Failed",
        description: "An error occurred while testing the API connection.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user?.user_metadata?.full_name || user?.email || "User"}
          </h1>
          <p className="text-zinc-400">Here's an overview of your activity</p>
        </div>

        <div className="mb-8">
          <UserStats />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <UserDocumentsList />
          <RecentConversations />
        </div>
      </main>
    </div>
  )
}
