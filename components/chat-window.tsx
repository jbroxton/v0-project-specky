"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppContext } from "@/hooks/use-app-context"
import { Loader2, ArrowUp, PlusCircle, Database, CloudIcon, Plus, X, ChevronUp, MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"
import { SpinningCube } from "@/components/spinning-cube"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useChat } from "@/hooks/use-chat"
import { DEEPINFRA_MODELS } from "@/lib/deepinfra"
import { useAuth } from "@/components/auth/auth-provider"

interface ChatWindowProps {
  selectedText?: string
  isContextPaneOpen: boolean
  toggleContextPane: () => void
  chatInput?: string
  setChatInput?: (text: string) => void
  onViewChange?: (view: "chat" | "fixes") => void
  currentView: "chat" | "fixes"
}

export function ChatWindow({
  selectedText = "",
  isContextPaneOpen,
  toggleContextPane,
  chatInput = "",
  setChatInput,
  onViewChange,
  currentView,
}: ChatWindowProps) {
  const router = useRouter()
  const { authUser } = useAuth()
  const { selectedDocId, docContent, setSelectedDocId, setDocContent } = useAppContext()
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    startNewConversation,
    selectedModel,
    setSelectedModel,
    conversations,
    loadConversation,
    currentConversation,
  } = useChat()

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Update input when chatInput prop changes
  useEffect(() => {
    if (chatInput) {
      setInput(chatInput)
      if (setChatInput) {
        setChatInput("")
      }
    }
  }, [chatInput, setChatInput])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return

    sendMessage(input)
    setInput("")
  }

  // Function to clear the selected document
  const clearSelectedDocument = () => {
    setSelectedDocId(null)
    setDocContent(null)
  }

  // Function to start a new chat
  const handleNewChat = () => {
    startNewConversation()
  }

  // Switch to chat view
  const switchToChat = () => {
    if (onViewChange) {
      onViewChange("chat")
    }
  }

  // Switch to fixes view
  const switchToFixes = () => {
    if (onViewChange) {
      onViewChange("fixes")
    }
  }

  // Format model name for display
  const formatModelName = (modelId: string): string => {
    const modelMap: Record<string, string> = {
      [DEEPINFRA_MODELS.MISTRAL_7B]: "Mistral 7B",
      [DEEPINFRA_MODELS.MIXTRAL_8X7B]: "Mixtral 8x7B",
      [DEEPINFRA_MODELS.LLAMA_3_8B]: "Llama 3 8B",
      [DEEPINFRA_MODELS.LLAMA_3_70B]: "Llama 3 70B",
      [DEEPINFRA_MODELS.GEMMA_7B]: "Gemma 7B",
      [DEEPINFRA_MODELS.STABLE_LM]: "StableLM 3B",
    }

    return modelMap[modelId] || modelId.split("/").pop() || modelId
  }

  return (
    <div className="flex h-full flex-col">
      {currentView === "chat" && (
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-4 pb-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <SpinningCube />
                <h2 className="mt-4 text-xl font-medium">How can I help with your product requirements?</h2>
                <p className="mt-2 text-zinc-400 max-w-md">
                  I can analyze requirements, suggest improvements, break down features into tasks, and more.
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                  <Button
                    variant="outline"
                    className="text-left h-auto py-3 px-4"
                    onClick={() => setInput("Check these requirements for clarity and completeness.")}
                  >
                    <div>
                      <p className="font-medium">Check requirements</p>
                      <p className="text-xs text-zinc-400">Analyze for clarity and completeness</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left h-auto py-3 px-4"
                    onClick={() => setInput("Suggest a structure for this PRD.")}
                  >
                    <div>
                      <p className="font-medium">Suggest structure</p>
                      <p className="text-xs text-zinc-400">Get PRD organization ideas</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left h-auto py-3 px-4"
                    onClick={() => setInput("Break this feature into implementable tasks.")}
                  >
                    <div>
                      <p className="font-medium">Break into tasks</p>
                      <p className="text-xs text-zinc-400">Create actionable work items</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left h-auto py-3 px-4"
                    onClick={() => setInput("Extract user stories from this document.")}
                  >
                    <div>
                      <p className="font-medium">Extract user stories</p>
                      <p className="text-xs text-zinc-400">Generate user stories from requirements</p>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id || message.timestamp?.getTime()} className="flex items-start gap-3">
                {message.role === "assistant" ? (
                  <div className="mt-1 h-8 w-8 flex items-center justify-center">
                    <SpinningCube />
                  </div>
                ) : (
                  <Avatar className="mt-1 h-8 w-8 bg-zinc-700">
                    <AvatarFallback>{authUser?.name?.charAt(0) || "U"}</AvatarFallback>
                    <AvatarImage src={authUser?.picture || "/placeholder.svg"} alt={authUser?.name || "User"} />
                  </Avatar>
                )}
                <div className="prose prose-sm prose-invert max-w-none flex-1">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 flex items-center justify-center">
                  <SpinningCube />
                </div>
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 flex items-center justify-center text-red-500">
                  <X className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-red-500">Error: {error}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => startNewConversation()}>
                    Try again
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      <div className="border-t border-zinc-800 bg-black">
        {/* Action bar with chips and integration buttons */}
        <div className="border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Document chip */}
            {selectedDocId && docContent && (
              <div className="flex items-center bg-zinc-800 rounded-full px-3 py-1 text-sm">
                <span className="truncate max-w-[200px]">{docContent.title}</span>
                {docContent.version && <span className="ml-1 text-xs text-zinc-400">v{docContent.version}</span>}
                <button className="ml-2 text-zinc-400 hover:text-white" onClick={clearSelectedDocument}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* View toggle buttons */}
            {selectedDocId && (
              <div className="flex gap-2">
                <Button
                  variant={currentView === "chat" ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={switchToChat}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
                <Button
                  variant={currentView === "fixes" ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={switchToFixes}
                >
                  Fixes{" "}
                  <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    5
                  </span>
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Conversation selector */}
            {conversations.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    {currentConversation?.title || "Conversations"}
                    <ChevronUp className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {conversations.map((conv) => (
                    <DropdownMenuItem
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className={currentConversation?.id === conv.id ? "bg-zinc-700" : ""}
                    >
                      {conv.title || "Untitled Conversation"}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={handleNewChat}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* New chat button */}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">New Chat</span>
            </Button>

            {/* AI Model selection dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {formatModelName(selectedModel)}
                  <ChevronUp className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setSelectedModel(DEEPINFRA_MODELS.MISTRAL_7B)}
                  className={selectedModel === DEEPINFRA_MODELS.MISTRAL_7B ? "bg-zinc-700" : ""}
                >
                  Mistral 7B
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedModel(DEEPINFRA_MODELS.MIXTRAL_8X7B)}
                  className={selectedModel === DEEPINFRA_MODELS.MIXTRAL_8X7B ? "bg-zinc-700" : ""}
                >
                  Mixtral 8x7B
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedModel(DEEPINFRA_MODELS.LLAMA_3_8B)}
                  className={selectedModel === DEEPINFRA_MODELS.LLAMA_3_8B ? "bg-zinc-700" : ""}
                >
                  Llama 3 8B
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedModel(DEEPINFRA_MODELS.GEMMA_7B)}
                  className={selectedModel === DEEPINFRA_MODELS.GEMMA_7B ? "bg-zinc-700" : ""}
                >
                  Gemma 7B
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedModel(DEEPINFRA_MODELS.STABLE_LM)}
                  className={selectedModel === DEEPINFRA_MODELS.STABLE_LM ? "bg-zinc-700" : ""}
                >
                  StableLM 3B
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Integration buttons */}
            <Button variant="outline" size="sm" className="h-8">
              <Database className="h-4 w-4 mr-2" />
              Jira
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <CloudIcon className="h-4 w-4 mr-2" />
              Google
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-2" />
              New Integration
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleContextPane}
              className={isContextPaneOpen ? "bg-zinc-800" : ""}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Product Context
            </Button>
          </div>
        </div>

        {/* Chat input form - only show in chat view */}
        {currentView === "chat" && (
          <div className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="relative"
            >
              <Input
                placeholder="Message Specky..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="border-zinc-700 bg-zinc-900 pr-10 py-6 text-white placeholder-zinc-400"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-white p-1 text-black hover:bg-zinc-200"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
