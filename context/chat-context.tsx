"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import type { Message, Conversation, ChatContextType } from "@/types/chat"
import { DEFAULT_MODEL } from "@/lib/deepinfra"
import {
  createConversation,
  addMessage,
  generateResponse,
  getConversation,
  getUserConversations,
} from "@/app/actions/chat-actions"
import { useAppContext } from "@/hooks/use-app-context"
import { v4 as uuidv4 } from "uuid"

// Create the context
export const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Provider component
export function ChatProvider({ children }: { children: ReactNode }) {
  const { selectedDocId, docContent } = useAppContext()
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL)
  const [conversations, setConversations] = useState<Conversation[]>([])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load conversations
  const loadConversations = async () => {
    try {
      const { conversations, error } = await getUserConversations()
      if (error) {
        setError(error)
      } else {
        setConversations(conversations)
      }
    } catch (err) {
      setError("Failed to load conversations")
      console.error(err)
    }
  }

  // Start a new conversation
  const startNewConversation = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { conversation_id, error } = await createConversation({
        title: "New Conversation",
        document_id: selectedDocId || undefined,
        document_title: docContent?.title,
        model: selectedModel,
      })

      if (error) {
        setError(error)
        return
      }

      // Load the new conversation
      await loadConversation(conversation_id)

      // Refresh the conversations list
      await loadConversations()
    } catch (err) {
      setError("Failed to start new conversation")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load a conversation
  const loadConversation = async (conversationId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { conversation, messages: conversationMessages, error } = await getConversation(conversationId)

      if (error) {
        console.error("Error loading conversation:", error)
        setError(error)
        setIsLoading(false)
        return
      }

      if (conversation) {
        setCurrentConversation(conversation)
        setMessages(conversationMessages)
        if (conversation.model) {
          setSelectedModel(conversation.model)
        }
      }
    } catch (err) {
      setError("Failed to load conversation")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Send a message
  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // If no conversation exists, create one first
      if (!currentConversation) {
        const { conversation_id, error: createError } = await createConversation({
          title: "New Conversation",
          document_id: selectedDocId || undefined,
          document_title: docContent?.title,
          model: selectedModel,
        })

        if (createError) {
          setError(createError)
          setIsLoading(false)
          return
        }

        if (!conversation_id) {
          setError("Failed to create conversation: No ID returned")
          setIsLoading(false)
          return
        }

        // Set the current conversation with the new ID
        setCurrentConversation({
          id: conversation_id,
          title: "New Conversation",
        })

        // Add user message to UI immediately for better UX
        const userMessage: Message = {
          id: uuidv4(),
          role: "user",
          content,
          timestamp: new Date(),
        }

        setMessages([userMessage])

        // Add message to database
        const { message_id, error: addError } = await addMessage(conversation_id, userMessage)

        if (addError) {
          console.error("Error adding message to database:", addError)
          setError(addError)
          setIsLoading(false)
          return
        }

        // Generate AI response
        const { response, error: genError } = await generateResponse(conversation_id, [userMessage], selectedModel)

        if (genError) {
          setError(genError)
          setIsLoading(false)
          return
        }

        // Add AI response to UI
        const assistantMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        }

        setMessages([userMessage, assistantMessage])

        // Refresh conversations list to update last message time
        await loadConversations()
        setIsLoading(false)
        return
      }

      // We have a valid conversation at this point
      const conversationId = currentConversation.id

      // Add user message to UI immediately for better UX
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Add message to database
      const { message_id, error: addError } = await addMessage(conversationId, userMessage)

      if (addError) {
        console.error("Error adding message to database:", addError)
        setError(addError)
        setIsLoading(false)
        return
      }

      // Get all messages for context
      const allMessages = [...messages, userMessage]

      // Generate AI response
      const { response, error: genError } = await generateResponse(conversationId, allMessages, selectedModel)

      if (genError) {
        setError(genError)
        setIsLoading(false)
        return
      }

      // Add AI response to UI
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Refresh conversations list to update last message time
      await loadConversations()
    } catch (err) {
      setError("Failed to send message")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value: ChatContextType = {
    currentConversation,
    messages,
    isLoading,
    error,
    selectedModel,
    setSelectedModel,
    sendMessage,
    startNewConversation,
    loadConversation,
    conversations,
    loadConversations,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
