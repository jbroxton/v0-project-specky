"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"

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

export interface AppContextType {
  selectedDocId: string | null
  docContent: any | null
  productContext: ProductContext | null
  setSelectedDocId: (docId: string | null) => void
  setDocContent: (content: any | null) => void
  setProductContext: (context: ProductContext) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [docContent, setDocContent] = useState<any | null>(null)
  const [productContext, setProductContext] = useState<ProductContext | null>(null)

  // Load product context if available
  useEffect(() => {
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

  return (
    <AppContext.Provider
      value={{
        selectedDocId,
        docContent,
        productContext,
        setSelectedDocId,
        setDocContent,
        setProductContext,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
