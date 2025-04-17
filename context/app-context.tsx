"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface GoogleUser {
  email: string
  name: string
  picture: string
}

interface FileItem {
  id: string
  name: string
  size: string
}

interface LinkItem {
  id: string
  url: string
  description: string
}

interface ProductContext {
  productName: string
  productDescription: string
  targetUsers: string
  files: FileItem[]
  links: LinkItem[]
}

interface AppContextType {
  isLoggedIn: boolean
  user: GoogleUser | null
  selectedDocId: string | null
  docContent: any | null
  productContext: ProductContext | null
  setSelectedDocId: (docId: string | null) => void
  setDocContent: (content: any | null) => void
  setProductContext: (context: ProductContext) => void
  login: () => void
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [docContent, setDocContent] = useState<any | null>(null)
  const [productContext, setProductContext] = useState<ProductContext | null>(null)

  // Check if user data exists in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("specky_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
    }

    // Load product context if available
    const storedContext = localStorage.getItem("specky_product_context")
    if (storedContext) {
      setProductContext(JSON.parse(storedContext))
    }

    // Load document content if available
    const storedDocContent = localStorage.getItem("specky_doc_content")
    const storedDocId = localStorage.getItem("specky_selected_doc_id")
    if (storedDocContent && storedDocId) {
      setDocContent(JSON.parse(storedDocContent))
      setSelectedDocId(storedDocId)
    }
  }, [])

  // Save product context to localStorage when it changes
  useEffect(() => {
    if (productContext) {
      localStorage.setItem("specky_product_context", JSON.stringify(productContext))
    }
  }, [productContext])

  // Save document content to localStorage when it changes
  useEffect(() => {
    if (docContent && selectedDocId) {
      localStorage.setItem("specky_doc_content", JSON.stringify(docContent))
      localStorage.setItem("specky_selected_doc_id", selectedDocId)
    } else if (!selectedDocId) {
      localStorage.removeItem("specky_doc_content")
      localStorage.removeItem("specky_selected_doc_id")
    }
  }, [docContent, selectedDocId])

  const login = () => {
    // In production, this would redirect to the actual auth flow
    setIsLoggedIn(true)
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    setSelectedDocId(null)
    setDocContent(null)
    localStorage.removeItem("specky_user")
    localStorage.removeItem("specky_doc_content")
    localStorage.removeItem("specky_selected_doc_id")
  }

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        selectedDocId,
        docContent,
        productContext,
        setSelectedDocId,
        setDocContent,
        setProductContext,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
