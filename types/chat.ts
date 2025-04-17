export interface Message {
  id?: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: Date
  created_at?: string
  tokens_used?: number
  model?: string
  metadata?: Record<string, any>
}

export interface Conversation {
  id: string
  title?: string
  user_id?: string | null
  anonymous_id?: string | null
  document_id?: string | null
  document_title?: string | null
  model?: string
  created_at?: string
  updated_at?: string
  is_archived?: boolean
  metadata?: Record<string, any>
}

export interface ChatContextType {
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  error: string | null
  selectedModel: string
  setSelectedModel: (model: string) => void
  sendMessage: (content: string) => Promise<void>
  startNewConversation: () => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>
  conversations: Conversation[]
  loadConversations: () => Promise<void>
}
