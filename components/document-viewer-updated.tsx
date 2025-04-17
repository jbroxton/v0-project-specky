"use client"

import { useEffect, useState } from "react"
import { DocumentViewer } from "@/components/document-viewer"
import { useAppContext } from "@/hooks/use-app-context"
import { getDocument } from "@/app/actions/document-actions"
import { getDocumentComments } from "@/app/actions/comment-actions"
import { getDocumentFixes, updateFix } from "@/app/actions/fix-actions"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ensureAnonymousUser } from "@/lib/auth-helpers"

interface DocumentViewerWrapperProps {
  onTextSelect?: (text: string) => void
  setChatInput?: (text: string) => void
  className?: string
  onReturnToList?: () => void
  isContextPaneOpen?: boolean
}

export function DocumentViewerWrapper(props: DocumentViewerWrapperProps) {
  const { selectedDocId, setDocContent } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [fixes, setFixes] = useState<any[]>([])
  const [hoveredFixId, setHoveredFixId] = useState<string | null>(null)
  const [selectedFixId, setSelectedFixId] = useState<string | null>(null)

  // Ensure user is authenticated when component mounts
  useEffect(() => {
    const initAuth = async () => {
      await ensureAnonymousUser()
    }

    initAuth()
  }, [])

  // Load document data when selectedDocId changes
  useEffect(() => {
    if (selectedDocId) {
      loadDocumentData()
    }
  }, [selectedDocId])

  // Load document data from the database
  const loadDocumentData = async () => {
    if (!selectedDocId) return

    setIsLoading(true)

    try {
      // Ensure user is authenticated before loading data
      const { success, error: authError } = await ensureAnonymousUser()

      if (!success) {
        toast({
          title: "Authentication Error",
          description: authError || "Failed to authenticate",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Get document content
      const { document, error } = await getDocument(selectedDocId)

      if (error || !document) {
        toast({
          title: "Error",
          description: error || "Failed to load document",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Set document content in app context
      setDocContent(document)

      // Get document comments
      const { comments, error: commentsError } = await getDocumentComments(selectedDocId)

      if (!commentsError) {
        setComments(comments)
      }

      // Get document fixes
      const { fixes, error: fixesError } = await getDocumentFixes(selectedDocId)

      if (!fixesError) {
        setFixes(fixes)
      }
    } catch (error) {
      console.error("Error loading document data:", error)
      toast({
        title: "Error",
        description: "Failed to load document data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle fix hover
  const handleFixHover = (id: string | null) => {
    setHoveredFixId(id)
  }

  // Handle fix selection
  const handleFixSelect = (id: string) => {
    setSelectedFixId(id)
  }

  // Handle fix application
  const handleFixApplied = async (fixId: string) => {
    try {
      // Update the fix in the database
      const { success, error } = await updateFix(fixId, { applied: true })

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      // Update the local state
      setFixes(fixes.map((fix) => (fix.id === fixId ? { ...fix, applied: true } : fix)))

      toast({
        title: "Fix applied",
        description: "The fix has been applied to the document",
      })
    } catch (error) {
      console.error("Error applying fix:", error)
      toast({
        title: "Error",
        description: "Failed to apply fix",
        variant: "destructive",
      })
    }
  }

  // Handle navigating to the next fix
  const handleNavigateToNextFix = (currentFixId: string) => {
    const currentIndex = fixes.findIndex((fix) => fix.id === currentFixId)
    const nextUnappliedFix = fixes.find((fix, index) => index > currentIndex && fix.applied === null)

    if (nextUnappliedFix) {
      setSelectedFixId(nextUnappliedFix.id)
    } else {
      setSelectedFixId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-white" />
          <p className="text-zinc-400">Loading document content...</p>
        </div>
      </div>
    )
  }

  return (
    <DocumentViewer
      {...props}
      fixes={fixes}
      hoveredFixId={hoveredFixId}
      selectedFixId={selectedFixId}
      onFixApplied={handleFixApplied}
      onNavigateToNextFix={handleNavigateToNextFix}
    />
  )
}
