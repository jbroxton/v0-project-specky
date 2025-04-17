"use client"

import { useContext } from "react"
import { ChatContext } from "@/context/chat-context"
import type { ChatContextType } from "@/types/chat"

// Hook to use the chat context
export function useChat(): ChatContextType {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
