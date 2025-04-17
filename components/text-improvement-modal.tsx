"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, X, Check, MessageSquare } from "lucide-react"

interface TextImprovementModalProps {
  originalText: string
  position: { x: number; y: number }
  onClose: () => void
  onAccept: (text: string) => void
  onCopyToChat: (text: string) => void
}

export function TextImprovementModal({
  originalText,
  position,
  onClose,
  onAccept,
  onCopyToChat,
}: TextImprovementModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [improvedText, setImprovedText] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [activeTab, setActiveTab] = useState("improve")

  // Simulate generating improved text
  const generateImprovement = () => {
    setIsLoading(true)

    // Mock improved text based on the original
    setTimeout(() => {
      let improved = ""

      if (originalText.toLowerCase().includes("user") || originalText.toLowerCase().includes("problem")) {
        improved = `EMEA users often report that the homepage feels overwhelming and unstructured. In user interviews and support feedback, we've heard phrases like "I don't know where to start" or "the interface feels cluttered," particularly from users trying to quickly access recent projects or understand what needs attention.`
      } else if (originalText.toLowerCase().includes("requirement")) {
        improved = `The system must respond to all user requests within 500ms under normal load conditions (up to 1000 concurrent users) and maintain a 99.9% uptime.`
      } else {
        improved =
          originalText.length > 50
            ? `${originalText.substring(0, originalText.length / 2)}... [Improved version with more clarity and specificity]`
            : `${originalText} (Enhanced with additional context)`
      }

      setImprovedText(improved)
      setIsLoading(false)
    }, 1000)
  }

  // Handle accept with normal formatting
  const handleAcceptWithNormalFormatting = () => {
    onAccept(improvedText)
  }

  // Generate improvement when component mounts
  useEffect(() => {
    generateImprovement()
  }, [])

  return (
    <div
      className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-[450px] max-w-[90vw]"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: "translate(-50%, 20px)",
      }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Tabs defaultValue="improve" onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="h-8">
                <TabsTrigger value="improve" className="text-sm px-3">
                  Improve
                </TabsTrigger>
                <TabsTrigger value="rephrase" className="text-sm px-3">
                  Rephrase
                </TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Tabs>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="border-l-4 border-green-500 pl-3 py-1 mb-3">
              <h3 className="text-green-500 text-xs font-medium mb-1">
                {activeTab === "improve" ? "Clarified Text" : "Rephrased Text"}
              </h3>
              <div
                className="text-white text-sm"
                style={{
                  fontWeight: "normal",
                  fontStyle: "normal",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                {improvedText}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-3">
          <Button size="sm" onClick={handleAcceptWithNormalFormatting} disabled={isLoading} className="h-8">
            <Check className="h-3.5 w-3.5 mr-1" />
            Accept
          </Button>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generateImprovement} disabled={isLoading} className="h-8">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyToChat(improvedText)}
              disabled={isLoading}
              className="h-8"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Copy to Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
