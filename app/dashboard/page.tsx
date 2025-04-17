"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/hooks/use-app-context"
import { Sidebar } from "@/components/sidebar"
import { DocumentViewer } from "@/components/document-viewer"
import { ChatWindow } from "@/components/chat-window"
import { EnhancedFixesList, type Fix } from "@/components/enhanced-fixes-list"
import { ContextPane } from "@/components/context-pane"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1 overflow-hidden">
        <div className="border-r border-zinc-800">
          <Sidebar />
        </div>
        <div className={`flex flex-1 flex-col ${isContextPaneOpen ? "mr-80" : ""}`}>
          {/* Database setup notice */}

          {selectedDocId ? (
            // Split screen layout when document is selected
            <>
              <div className="flex-1 overflow-hidden border-b border-zinc-800">
                <DocumentViewer
                  onTextSelect={setSelectedText}
                  setChatInput={setChatInput}
                  fixes={fixes}
                  hoveredFixId={hoveredFixId}
                  selectedFixId={selectedFixId}
                  onReturnToList={handleReturnToList}
                />
              </div>
              <div className="h-[40%] min-h-[300px]">
                {currentView === "chat" ? (
                  <ChatWindow
                    selectedText={selectedText}
                    isContextPaneOpen={isContextPaneOpen}
                    toggleContextPane={toggleContextPane}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    onViewChange={setCurrentView}
                    currentView={currentView}
                  />
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={setupDatabase}
                          className="mr-2 bg-zinc-800 border-zinc-700"
                        >
                          Setup Database
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={testDeepInfraAPI}
                          className="mr-2 bg-zinc-800 border-zinc-700"
                        >
                          Test DeepInfra API
                        </Button>
                        {/* View toggle buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant={currentView === "chat" ? "default" : "outline"}
                            size="sm"
                            className="h-8"
                            onClick={() => setCurrentView("chat")}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                          <Button
                            variant={currentView === "fixes" ? "default" : "outline"}
                            size="sm"
                            className="h-8"
                            onClick={() => setCurrentView("fixes")}
                          >
                            Fixes{" "}
                            {fixes.filter((f) => f.applied === null).length > 0 && (
                              <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {fixes.filter((f) => f.applied === null).length}
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <EnhancedFixesList
                      fixes={fixes}
                      onFixAction={handleFixAction}
                      onFixHover={handleFixHover}
                      onFixSelect={handleFixSelect}
                      selectedFixId={selectedFixId}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            // Full screen chat when no document is selected
            <div className="flex-1 overflow-hidden">
              <ChatWindow
                selectedText={selectedText}
                isContextPaneOpen={isContextPaneOpen}
                toggleContextPane={toggleContextPane}
                chatInput={chatInput}
                setChatInput={setChatInput}
                onViewChange={setCurrentView}
                currentView={currentView}
              />
            </div>
          )}
        </div>
        {isContextPaneOpen && (
          <div className="fixed right-0 top-0 h-full z-20">
            <ContextPane onClose={toggleContextPane} initialText={selectedText} />
          </div>
        )}
      </div>
    </div>
  )
}
