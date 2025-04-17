"use client"

import { useAppContext } from "@/hooks/use-app-context"
import { DocumentSelection } from "@/components/document-selection"
import { FileText } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function AIAssistant() {
  const { selectedDocId } = useAppContext()
  const { isAuthenticated } = useAuth()

  if (!selectedDocId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <FileText className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <h1 className="mb-6 text-4xl font-bold">Select a Document</h1>
          <p className="mb-8 text-lg text-zinc-400">
            Choose a document from the sidebar or select one below to get started with Specky.
          </p>
          <DocumentSelection />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-zinc-400">Select a document to view its content.</p>
    </div>
  )
}
