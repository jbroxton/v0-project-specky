"use client"

import { useEffect } from "react"
import { ChatWindow } from "@/components/chat-window"
import { useChat } from "@/context/chat-context"

export default function ChatTestPage() {
  const { startNewConversation, currentConversation } = useChat()

  // Start a new conversation when the page loads if there isn't one already
  useEffect(() => {
    if (!currentConversation) {
      startNewConversation()
    }
  }, [currentConversation, startNewConversation])

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <header className="border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold">Chat Test Page</h1>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatWindow isContextPaneOpen={false} toggleContextPane={() => {}} currentView="chat" />
      </div>
    </div>
  )
}
