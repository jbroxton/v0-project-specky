"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth" // Changed import
import { Sidebar } from "@/components/sidebar"
import { DocumentViewer } from "@/components/document-viewer"
import { ChatWindow } from "@/components/chat-window"
import { ContextPane } from "@/components/context-pane"

export default function DocumentPage() {
  const { isAuthenticated } = useAuth() // Changed to isAuthenticated
  const router = useRouter()
  const [selectedText, setSelectedText] = useState("")
  const [isContextPaneOpen, setIsContextPaneOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")

  // Removed auto-login useEffect

  const toggleContextPane = () => {
    setIsContextPaneOpen(!isContextPaneOpen)
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex flex-1 overflow-hidden">
        <div className="border-r border-zinc-800">
          <Sidebar />
        </div>
        <div className={`flex flex-1 flex-col ${isContextPaneOpen ? "mr-80" : ""}`}>
          <div className="flex-1 overflow-hidden">
            <DocumentViewer onTextSelect={setSelectedText} setChatInput={setChatInput} />
          </div>
          <div className="h-80 border-t border-zinc-800">
            <ChatWindow
              selectedText={selectedText}
              isContextPaneOpen={isContextPaneOpen}
              toggleContextPane={toggleContextPane}
            />
          </div>
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
