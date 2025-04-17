"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/hooks/use-app-context"
import { Search, FileText, Clock, Loader2, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Document {
  id: string
  name: string
  modifiedTime: string
  thumbnailLink?: string
}

export function DocumentSelection() {
  const { setSelectedDocId, setDocContent } = useAppContext()
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // In a real app, this would fetch documents from an API
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, this would be an API call
        // For now, we'll just set empty documents
        setDocuments([])
      } catch (error) {
        console.error("Error fetching documents:", error)
        setError("Failed to load documents")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  // Filter documents when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      return
    }

    // In production, this might be a server-side search
    const filtered = documents.filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setDocuments(filtered)
  }, [searchQuery, documents])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just filter the existing documents
      const filtered = documents.filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setDocuments(filtered)
    } catch (error) {
      console.error("Error searching documents:", error)
      setError("Failed to search documents")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentSelect = async (docId: string) => {
    setIsLoading(true)
    setSelectedDocId(docId)

    try {
      // In a real implementation, this would fetch document content from an API
      // For now, we'll just close the dialog
      setIsOpen(false)
    } catch (error) {
      console.error("Error loading document:", error)
      setError("Failed to load document")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Select Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Select a Document</DialogTitle>
          <DialogDescription className="text-zinc-400">Choose a document to analyze with Specky</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 py-4">
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Button variant="outline" size="icon" className="shrink-0" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <Button className="w-full flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New PRD
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-400">{error}</div>
          ) : documents.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-400">
              <FileText className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
              <p className="mb-2">No documents found</p>
              <p className="text-xs text-zinc-500">
                Create your first document or connect to Google Docs to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  className="flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-zinc-800"
                  onClick={() => handleDocumentSelect(doc.id)}
                >
                  <FileText className="h-5 w-5 text-zinc-400" />
                  <div className="flex-grow min-w-0">
                    <div className="truncate font-medium text-white">{doc.name}</div>
                    <div className="flex items-center text-xs text-zinc-400">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(doc.modifiedTime).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
