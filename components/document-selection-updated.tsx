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
import { getUserDocuments, createDocument, getDocument } from "@/app/actions/document-actions"
import { toast } from "@/hooks/use-toast"
import { ensureAnonymousUser } from "@/lib/auth-helpers"

export function DocumentSelectionUpdated() {
  const { setSelectedDocId, setDocContent } = useAppContext()
  const [documents, setDocuments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([])
  const [isCreatingDocument, setIsCreatingDocument] = useState(false)

  // Ensure user is authenticated (anonymously or otherwise) when component mounts
  useEffect(() => {
    const initAuth = async () => {
      const { success, error } = await ensureAnonymousUser()
      if (!success) {
        console.error("Error ensuring anonymous user:", error)
        setError("Authentication failed. Please try again.")
      } else {
        // Once authenticated, fetch documents
        fetchDocuments()
      }
    }

    initAuth()
  }, [])

  // Filter documents when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents)
      return
    }

    const filtered = documents.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredDocuments(filtered)
  }, [searchQuery, documents])

  // Fetch documents from the database
  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const { documents, error } = await getUserDocuments()

      if (error) {
        setError(error)
      } else {
        setDocuments(documents)
        setFilteredDocuments(documents)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      setError("Failed to load documents")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents)
      return
    }

    const filtered = documents.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredDocuments(filtered)
  }

  // Handle document selection
  const handleDocumentSelect = async (docId: string) => {
    setIsLoading(true)
    setSelectedDocId(docId)

    try {
      const { document, error } = await getDocument(docId)

      if (error || !document) {
        toast({
          title: "Error",
          description: error || "Failed to load document",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      setDocContent(document)
      setIsOpen(false)
    } catch (error) {
      console.error("Error loading document:", error)
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new document
  const handleCreateDocument = async () => {
    setIsCreatingDocument(true)

    try {
      // Ensure user is authenticated before creating a document
      const { success, error: authError } = await ensureAnonymousUser()

      if (!success) {
        toast({
          title: "Authentication Error",
          description: authError || "Failed to authenticate",
          variant: "destructive",
        })
        setIsCreatingDocument(false)
        return
      }

      const { document_id, error } = await createDocument({
        title: "Untitled Document",
        content: {
          body: {
            content: [
              {
                paragraph: {
                  elements: [
                    {
                      textRun: {
                        content: "Start writing your document here...",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      })

      if (error || !document_id) {
        toast({
          title: "Error",
          description: error || "Failed to create document",
          variant: "destructive",
        })
        return
      }

      // Refresh the documents list
      await fetchDocuments()

      // Select the new document
      await handleDocumentSelect(document_id)

      toast({
        title: "Success",
        description: "New document created",
      })
    } catch (error) {
      console.error("Error creating document:", error)
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      })
    } finally {
      setIsCreatingDocument(false)
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
          <Button
            className="w-full flex items-center gap-2"
            onClick={handleCreateDocument}
            disabled={isCreatingDocument}
          >
            {isCreatingDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create New Document
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-400">{error}</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-400">
              <FileText className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
              <p className="mb-2">No documents found</p>
              <p className="text-xs text-zinc-500">Create your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <button
                  key={doc.id}
                  className="flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-zinc-800"
                  onClick={() => handleDocumentSelect(doc.id)}
                >
                  <FileText className="h-5 w-5 text-zinc-400" />
                  <div className="flex-grow min-w-0">
                    <div className="truncate font-medium text-white">{doc.title}</div>
                    <div className="flex items-center text-xs text-zinc-400">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(doc.updated_at || doc.created_at).toLocaleDateString()}
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
