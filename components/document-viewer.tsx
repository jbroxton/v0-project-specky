"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useAppContext } from "@/context/app-context"
import { Loader2, Edit, Save, X, ChevronDown, FileText, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Comment, CommentInput, type CommentData } from "@/components/comment"
import type { Fix } from "@/components/enhanced-fixes-list"
import type { JSX } from "react/jsx-runtime"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { TextImprovementModal } from "@/components/text-improvement-modal"

interface StructuralElement {
  paragraph?: {
    elements: {
      textRun?: {
        content: string
        textStyle?: any
      }
    }[]
    paragraphStyle?: {
      namedStyleType?: string
    }
  }
  table?: any
  tableOfContents?: any
  sectionBreak?: any
}

interface DocumentViewerProps {
  onTextSelect?: (text: string) => void
  setChatInput?: (text: string) => void
  className?: string
  fixes?: Fix[]
  hoveredFixId?: string | null
  selectedFixId?: string | null
  onReturnToList?: () => void
  onFixApplied?: (fixId: string) => void
  onNavigateToNextFix?: (currentFixId: string) => void
  isContextPaneOpen?: boolean
}

interface TextRange {
  text: string
  startOffset: number
  endOffset: number
  paragraphIndex: number
}

export function DocumentViewer(props: DocumentViewerProps) {
  const { onTextSelect, setChatInput, className = "", fixes = [], hoveredFixId = null } = props
  const { docContent, selectedDocId, setDocContent, user, setSelectedDocId } = useAppContext()
  const [selectedText, setSelectedText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState<any>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentVersion, setCurrentVersion] = useState<string>("1.0")
  const [comments, setComments] = useState<CommentData[]>([])
  const [addingComment, setAddingComment] = useState(false)
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 })
  const [selectionRange, setSelectionRange] = useState<Range | null>(null)
  const [selectedTextRange, setSelectedTextRange] = useState<TextRange | null>(null)
  const [highlightedRanges, setHighlightedRanges] = useState<Map<string, TextRange>>(new Map())
  const [selectedFixId, setSelectedFixId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fixElementRefs = useRef<Map<string, HTMLElement>>(new Map())
  const [fixAnimations, setFixAnimations] = useState<Map<string, boolean>>(new Map())
  const [showImproveModal, setShowImproveModal] = useState(false)
  const [improveModalPosition, setImproveModalPosition] = useState({ x: 0, y: 0 })
  const [textToImprove, setTextToImprove] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Change from constant to state
  const [versions, setVersions] = useState<string[]>([])

  // Initialize edited content when document changes
  useEffect(() => {
    if (docContent) {
      setEditedContent(JSON.parse(JSON.stringify(docContent)))
      // Set current version if available in the document
      if (docContent.version) {
        setCurrentVersion(docContent.version)
        // Add the version to versions array if not already there
        if (!versions.includes(docContent.version)) {
          setVersions((prev) => [...prev, docContent.version])
        }
      }
    }
  }, [docContent, versions])

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString()) {
        const text = selection.toString()
        setSelectedText(text)
        if (onTextSelect) {
          onTextSelect(text)
        }

        // Store the selection range for later use
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0).cloneRange()
          setSelectionRange(range)

          // Find the paragraph index
          let paragraphNode = range.startContainer
          while (
            paragraphNode &&
            paragraphNode.nodeName !== "P" &&
            paragraphNode.nodeName !== "H1" &&
            paragraphNode.nodeName !== "H2" &&
            paragraphNode.nodeName !== "H3"
          ) {
            paragraphNode = paragraphNode.parentNode
          }

          if (paragraphNode) {
            // Find all paragraph elements
            const paragraphs = contentRef.current?.querySelectorAll("p, h1, h2, h3, h4, h5, h6")
            if (paragraphs) {
              let paragraphIndex = -1
              paragraphs.forEach((p, index) => {
                if (p === paragraphNode) {
                  paragraphIndex = index
                }
              })

              if (paragraphIndex !== -1) {
                // Calculate offsets within the paragraph text
                const paragraphText = paragraphNode.textContent || ""
                const startOffset = range.startOffset
                const endOffset = range.endOffset

                setSelectedTextRange({
                  text,
                  startOffset,
                  endOffset,
                  paragraphIndex,
                })
              }
            }
          }
        }
      }
    }

    document.addEventListener("mouseup", handleSelection)
    return () => {
      document.removeEventListener("mouseup", handleSelection)
    }
  }, [onTextSelect])

  // Update the selectedFixId when the prop changes
  useEffect(() => {
    if (props.selectedFixId !== undefined) {
      setSelectedFixId(props.selectedFixId)
    }
  }, [props.selectedFixId])

  // Handle scrolling to the selected fix
  useEffect(() => {
    if (selectedFixId && fixElementRefs.current.has(selectedFixId)) {
      // Add a small delay to ensure DOM is fully updated
      setTimeout(() => {
        const element = fixElementRefs.current.get(selectedFixId)
        if (element && scrollAreaRef.current) {
          // Get the scroll container
          const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
          if (!scrollContainer) return

          // Force a layout calculation to ensure accurate positioning
          element.getBoundingClientRect()

          // Use scrollIntoView for more reliable scrolling
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })

          // Add a highlight flash effect to make it more noticeable
          element.classList.add("flash-highlight")
          setTimeout(() => {
            element.classList.remove("flash-highlight")
          }, 1500)
        }
      }, 200) // Longer delay to ensure DOM updates
    }
  }, [selectedFixId])

  // Handle fix animation
  useEffect(() => {
    const animatingFixes = new Map(fixAnimations)

    // Clear animations after they complete
    if (animatingFixes.size > 0) {
      const timer = setTimeout(() => {
        setFixAnimations(new Map())
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [fixAnimations])

  // Handle applying a fix
  const handleApplyFix = (fixId: string) => {
    // Find the fix
    const fix = fixes.find((f) => f.id === fixId)
    if (!fix) return

    // Show animation
    const newAnimations = new Map(fixAnimations)
    newAnimations.set(fixId, true)
    setFixAnimations(newAnimations)

    // In a real app, we would apply the fix to the document content
    // For now, we'll just show a toast notification
    toast({
      title: "Fix applied",
      description: `"${fix.text}" has been fixed.`,
      action: fix.suggestedReplacement ? <ToastAction altText="View next fix">View next</ToastAction> : undefined,
    })

    // Notify parent component
    if (props.onFixApplied) {
      props.onFixApplied(fixId)
    }

    // Navigate to next fix after a delay
    setTimeout(() => {
      if (props.onNavigateToNextFix) {
        props.onNavigateToNextFix(fixId)
      }
    }, 1500)
  }

  // Add these handler functions before the return statement:

  const handleNewVersion = () => {
    // Create new version number
    const newVersionNumber = (Number.parseFloat(currentVersion) + 0.1).toFixed(1)
    setCurrentVersion(newVersionNumber)

    // Add the new version to the versions array if it doesn't already exist
    if (!versions.includes(newVersionNumber)) {
      setVersions([...versions, newVersionNumber])
    }

    toast({
      title: "New Version Created",
      description: `Document version ${newVersionNumber} has been created.`,
    })
  }

  const handleSubmitForApproval = () => {
    // In a real app, this would submit the document for approval
    toast({
      title: "Document Submitted",
      description: "Your document has been submitted for approval.",
    })
  }

  const handleImproveText = (e: React.MouseEvent) => {
    if (selectedText) {
      setTextToImprove(selectedText)

      // Calculate a better position for the modal
      // Position near the mouse but ensure it's visible
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Use the mouse position but adjust if needed
      let x = e.clientX
      let y = e.clientY

      // Ensure the modal doesn't go off-screen
      if (x < 225) x = 225 // Half the modal width
      if (x > viewportWidth - 225) x = viewportWidth - 225

      // Position below the cursor with some offset
      y = y + 10

      // Ensure it doesn't go below the viewport
      if (y > viewportHeight - 200) y = viewportHeight - 200

      setImproveModalPosition({ x, y })
      setShowImproveModal(true)
    }
  }

  // Replace the entire handleAcceptImprovedText function with this version that includes direct DOM manipulation

  const handleAcceptImprovedText = (improvedText: string) => {
    // Only proceed if we have content and are not in edit mode
    if (!docContent || isEditing || !selectedTextRange || !textToImprove) {
      toast({
        title: "Cannot apply improvement",
        description: "Cannot apply text improvements while in edit mode or without proper selection.",
        variant: "destructive",
      })
      setShowImproveModal(false)
      return
    }

    try {
      // Create a deep copy of the document content
      const updatedContent = JSON.parse(JSON.stringify(docContent))

      // Find the paragraph that contains the text to be replaced
      const paragraphIndex = selectedTextRange.paragraphIndex

      if (
        updatedContent.body &&
        updatedContent.body.content &&
        updatedContent.body.content[paragraphIndex] &&
        updatedContent.body.content[paragraphIndex].paragraph
      ) {
        const paragraph = updatedContent.body.content[paragraphIndex].paragraph

        // Get the current paragraph text
        const currentText = paragraph.elements.map((el) => el.textRun?.content || "").join("")

        // Create the new text by replacing the selected portion
        const newText =
          currentText.substring(0, selectedTextRange.startOffset) +
          improvedText +
          currentText.substring(selectedTextRange.endOffset)

        // COMPLETELY REPLACE the paragraph structure with a new one
        // This is the most aggressive approach to ensure no formatting is carried over
        updatedContent.body.content[paragraphIndex] = {
          paragraph: {
            elements: [
              {
                textRun: {
                  content: newText,
                  // Explicitly set an empty textStyle to override any existing formatting
                  textStyle: {
                    bold: false,
                    italic: false,
                    underline: false,
                    strikethrough: false,
                    fontSize: { magnitude: 11, unit: "PT" }, // Default font size
                    fontWeight: 400, // Normal font weight
                  },
                },
              },
            ],
            // Preserve the paragraph style if it exists (for headings, etc.)
            paragraphStyle: paragraph.paragraphStyle || {},
          },
        }

        // Update the document content
        setDocContent(updatedContent)

        // Show success toast
        toast({
          title: "Text improved",
          description: "The improved text has been applied to the document.",
        })

        // DIRECT DOM MANIPULATION: After React updates the DOM, find the paragraph and force normal styling
        setTimeout(() => {
          if (contentRef.current) {
            const paragraphs = contentRef.current.querySelectorAll("p, h1, h2, h3, h4, h5, h6")
            if (paragraphs && paragraphs[paragraphIndex]) {
              const targetParagraph = paragraphs[paragraphIndex]

              // Force normal styling directly on the DOM element
              targetParagraph.style.fontWeight = "normal"
              targetParagraph.style.fontStyle = "normal"
              targetParagraph.style.textDecoration = "none"

              // Add a special class for animation and styling
              targetParagraph.classList.add("text-just-inserted")

              // Add a data attribute for targeting with CSS
              targetParagraph.setAttribute("data-text-improved", "true")

              // Log for debugging
              console.log("Direct DOM styling applied to paragraph:", targetParagraph)
            }
          }
        }, 100) // Small delay to ensure React has updated the DOM
      } else {
        // Show error toast if we couldn't find the paragraph
        toast({
          title: "Error applying improvement",
          description: "Could not locate the text to replace.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error applying text improvement:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while applying the improvement.",
        variant: "destructive",
      })
    }

    // Close the modal
    setShowImproveModal(false)

    // Clear the selection
    setSelectedText("")
    setSelectionRange(null)
    setSelectedTextRange(null)
  }

  const handleCopyImprovedTextToChat = (improvedText: string) => {
    if (setChatInput) {
      setChatInput(improvedText)
    }
    setShowImproveModal(false)
    toast({
      title: "Copied to chat",
      description: "The improved text has been copied to the chat input.",
    })
  }

  const handleCreateNewDocument = () => {
    // In a real app, this would create a new document
    toast({
      title: "Create New Document",
      description: "This would create a new document in a production environment.",
    })
  }

  if (!selectedDocId) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <FileText className="h-16 w-16 text-zinc-600 mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">No document selected</h2>
        <p className="text-zinc-400 mb-6 text-center max-w-md">
          Select a document from the sidebar or create a new one to get started
        </p>
        <Button onClick={handleCreateNewDocument} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Document
        </Button>
      </div>
    )
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

  if (!docContent) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <p className="text-xl font-medium text-white mb-2">Document not found</p>
          <p className="text-zinc-400 mb-6">The document you're looking for doesn't exist or couldn't be loaded</p>
          <Button onClick={() => setSelectedDocId(null)} variant="outline">
            Go back
          </Button>
        </div>
      </div>
    )
  }

  // Handle content changes in edit mode
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>, index: number) => {
    if (!isEditing || !editedContent) return

    const newContent = { ...editedContent }
    const text = e.currentTarget.textContent || ""

    // Update the content in the edited document
    if (newContent.body && newContent.body.content && newContent.body.content[index]) {
      if (newContent.body.content[index].paragraph) {
        if (newContent.body.content[index].paragraph.elements && newContent.body.content[index].paragraph.elements[0]) {
          newContent.body.content[index].paragraph.elements[0].textRun = {
            ...newContent.body.content[index].paragraph.elements[0].textRun,
            content: text,
          }
        }
      }
    }

    setEditedContent(newContent)
  }

  // Handle title changes in edit mode
  const handleTitleChange = (e: React.FormEvent<HTMLHeadingElement>) => {
    if (!isEditing || !editedContent) return

    const newContent = { ...editedContent }
    newContent.title = e.currentTarget.textContent || ""
    setEditedContent(newContent)
  }

  // Save changes
  const saveChanges = () => {
    // Add version information to the document
    const updatedContent = {
      ...editedContent,
      version: currentVersion,
    }
    setDocContent(updatedContent)
    setIsEditing(false)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditedContent(JSON.parse(JSON.stringify(docContent)))
    setIsEditing(false)
  }

  // Handle version change
  const handleVersionChange = (version: string) => {
    setCurrentVersion(version)
    // In a real app, you would fetch the document content for the selected version
    // For now, we'll just update the version in the document
    if (isEditing) {
      setEditedContent({
        ...editedContent,
        version,
      })
    } else {
      setDocContent({
        ...docContent,
        version,
      })
    }
  }

  // Copy selected text to chat input
  const copyToChatInput = () => {
    if (selectedText && setChatInput) {
      setChatInput(selectedText)
    }
  }

  // Handle adding a comment
  const handleAddComment = (e: React.MouseEvent) => {
    if (selectedText && selectionRange && selectedTextRange) {
      // Get the position for the comment
      const rect = selectionRange.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      // Position the comment to the right of the document content
      const documentWidth = contentRef.current?.getBoundingClientRect().width || 0
      const rightMargin = 20 // Space between document content and comment

      setCommentPosition({
        x: documentWidth + rightMargin,
        y: rect.top + scrollTop,
      })

      setAddingComment(true)
    }
  }

  // Submit a new comment
  const submitComment = (text: string) => {
    if (selectedText && user && selectedTextRange) {
      const commentId = Date.now().toString()

      const newComment: CommentData = {
        id: commentId,
        text,
        highlightedText: selectedText,
        position: commentPosition,
        timestamp: new Date(),
        author: {
          name: user.name,
          picture: user.picture,
        },
        minimized: true, // Start minimized after saving
      }

      // Add the comment
      setComments([...comments, newComment])

      // Add the highlighted range
      const newHighlightedRanges = new Map(highlightedRanges)
      newHighlightedRanges.set(commentId, selectedTextRange)
      setHighlightedRanges(newHighlightedRanges)

      // Reset states
      setAddingComment(false)
      setSelectedText("")
      setSelectionRange(null)
      setSelectedTextRange(null)
    }
  }

  // Cancel adding a comment
  const cancelComment = () => {
    setAddingComment(false)
  }

  // Resolve a comment
  const resolveComment = (id: string) => {
    setComments(comments.map((comment) => (comment.id === id ? { ...comment, resolved: !comment.resolved } : comment)))
  }

  // Delete a comment
  const deleteComment = (id: string) => {
    setComments(comments.filter((comment) => comment.id !== id))

    // Remove the highlighted range
    const newHighlightedRanges = new Map(highlightedRanges)
    newHighlightedRanges.delete(id)
    setHighlightedRanges(newHighlightedRanges)
  }

  // Update a comment
  const updateComment = (id: string, text: string) => {
    setComments(comments.map((comment) => (comment.id === id ? { ...comment, text } : comment)))
  }

  // Toggle comment minimized state
  const toggleCommentMinimize = (id: string) => {
    setComments(
      comments.map((comment) => (comment.id === id ? { ...comment, minimized: !comment.minimized } : comment)),
    )
  }

  // Find fixes for a specific paragraph
  const getFixesForParagraph = (paragraphIndex: number) => {
    return fixes.filter((fix) => fix.position.paragraphIndex === paragraphIndex)
  }

  // Get section title for a paragraph
  const getSectionTitle = (paragraphIndex: number): string => {
    if (!docContent.body || !docContent.body.content) return ""

    // Look backwards for the nearest heading
    for (let i = paragraphIndex; i >= 0; i--) {
      const element = docContent.body.content[i]
      if (element.paragraph?.paragraphStyle?.namedStyleType?.includes("HEADING")) {
        const headingText = element.paragraph.elements.map((el) => el.textRun?.content || "").join("")
        return headingText
      }
    }

    return ""
  }

  // Render document content with highlighted text and fixes
  const renderContent = () => {
    const content = isEditing ? editedContent : docContent

    if (!content.body || !content.body.content) {
      return <p>No content available</p>
    }

    return content.body.content.map((element: StructuralElement, index: number) => {
      if (element.paragraph) {
        const paragraphText = element.paragraph.elements.map((el) => el.textRun?.content || "").join("")

        // Check if this is a heading
        const isHeading = element.paragraph.paragraphStyle?.namedStyleType?.includes("HEADING")
        const headingLevel = isHeading
          ? Number.parseInt(element.paragraph.paragraphStyle.namedStyleType.split("_")[1])
          : 0

        // Find comments that highlight text in this paragraph
        const paragraphComments: Array<{ commentId: string; range: TextRange }> = []
        highlightedRanges.forEach((range, commentId) => {
          if (range.paragraphIndex === index) {
            paragraphComments.push({ commentId, range })
          }
        })

        // Find fixes for this paragraph
        const paragraphFixes = getFixesForParagraph(index)

        // If there are comments or fixes, we need to render the paragraph with highlighted spans
        if ((paragraphComments.length > 0 || paragraphFixes.length > 0) && !isEditing) {
          // Combine comments and fixes for rendering
          const allRanges: Array<{
            id: string
            type: "comment" | "fix" | "insert"
            startOffset: number
            endOffset: number
            isHovered?: boolean
            errorNumber?: number
            isAnimating?: boolean
          }> = [
            ...paragraphComments.map(({ commentId, range }) => ({
              id: commentId,
              type: "comment" as const,
              startOffset: range.startOffset,
              endOffset: range.endOffset,
            })),
            ...paragraphFixes.map((fix) => ({
              id: fix.id,
              type: fix.fixType === "insert" ? ("insert" as const) : ("fix" as const),
              startOffset: fix.position.startOffset,
              endOffset: fix.position.endOffset,
              isHovered: fix.id === hoveredFixId,
              errorNumber: fix.errorNumber,
              isAnimating: fixAnimations.has(fix.id),
            })),
          ]

          // Sort by start offset
          allRanges.sort((a, b) => a.startOffset - b.startOffset)

          // Build an array of text segments with their highlight status
          const segments: Array<{
            text: string
            id: string | null
            type: "comment" | "fix" | "insert" | null
            isHovered?: boolean
            errorNumber?: number
            isAnimating?: boolean
          }> = []

          let lastEnd = 0

          allRanges.forEach(({ id, type, startOffset, endOffset, isHovered, errorNumber, isAnimating }) => {
            if (startOffset > lastEnd) {
              // Add non-highlighted text before this range
              segments.push({
                text: paragraphText.substring(lastEnd, startOffset),
                id: null,
                type: null,
              })
            }

            // Add highlighted text
            segments.push({
              text: paragraphText.substring(startOffset, endOffset),
              id,
              type,
              isHovered,
              errorNumber,
              isAnimating,
            })

            lastEnd = endOffset
          })

          // Add any remaining text
          if (lastEnd < paragraphText.length) {
            segments.push({
              text: paragraphText.substring(lastEnd),
              id: null,
              type: null,
            })
          }

          // Render the paragraph with highlighted spans
          if (isHeading) {
            const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements
            return (
              <ContextMenu key={index}>
                <ContextMenuTrigger>
                  <HeadingTag className="mb-2 mt-4 font-bold text-white relative">
                    {segments.map((segment, i) => {
                      if (segment.type === "comment") {
                        return (
                          <span key={i} className="bg-white bg-opacity-20 rounded px-0.5" data-comment-id={segment.id}>
                            {segment.text}
                          </span>
                        )
                      } else if (segment.type === "fix") {
                        return (
                          <span
                            key={i}
                            ref={(el) => {
                              if (el) {
                                fixElementRefs.current.set(segment.id!, el)
                              }
                            }}
                            className={`border-b-2 border-red-500 relative
                              ${segment.isHovered ? "bg-red-900/30" : ""} 
                              ${segment.id === selectedFixId ? "animate-pulse-highlight bg-red-500/40" : ""}
                              ${segment.isAnimating ? "animate-fix-applied" : ""}
                            `}
                            data-fix-id={segment.id}
                          >
                            {segment.text}
                          </span>
                        )
                      } else if (segment.type === "insert") {
                        return (
                          <span
                            key={i}
                            ref={(el) => {
                              if (el) {
                                fixElementRefs.current.set(segment.id!, el)
                              }
                            }}
                            className={`border-dashed border-b-2 border-yellow-500 relative
                              ${segment.isHovered ? "bg-yellow-900/30" : ""} 
                              ${segment.id === selectedFixId ? "animate-pulse-highlight bg-yellow-500/20" : ""}
                              ${segment.isAnimating ? "animate-fix-applied" : ""}
                            `}
                            data-fix-id={segment.id}
                          >
                            {segment.text}
                          </span>
                        )
                      } else {
                        return <span key={i}>{segment.text}</span>
                      }
                    })}
                  </HeadingTag>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={copyToChatInput}>Copy to Chat</ContextMenuItem>
                  {selectedText && <ContextMenuItem onClick={handleAddComment}>Add Comment</ContextMenuItem>}
                  {selectedText && <ContextMenuItem onClick={handleImproveText}>Improve</ContextMenuItem>}
                </ContextMenuContent>
              </ContextMenu>
            )
          }

          return (
            <ContextMenu key={index}>
              <ContextMenuTrigger>
                <p className="mb-2 text-zinc-200 relative">
                  {segments.map((segment, i) => {
                    if (segment.type === "comment") {
                      return (
                        <span key={i} className="bg-white bg-opacity-20 rounded px-0.5" data-comment-id={segment.id}>
                          {segment.text}
                        </span>
                      )
                    } else if (segment.type === "fix") {
                      return (
                        <span
                          key={i}
                          ref={(el) => {
                            if (el) {
                              fixElementRefs.current.set(segment.id!, el)
                            }
                          }}
                          className={`border-b-2 border-red-500 relative
                            ${segment.isHovered ? "bg-red-900/30" : ""} 
                            ${segment.id === selectedFixId ? "animate-pulse-highlight bg-red-500/40" : ""}
                            ${segment.isAnimating ? "animate-fix-applied" : ""}
                          `}
                          data-fix-id={segment.id}
                        >
                          {segment.text}
                        </span>
                      )
                    } else if (segment.type === "insert") {
                      return (
                        <span
                          key={i}
                          ref={(el) => {
                            if (el) {
                              fixElementRefs.current.set(segment.id!, el)
                            }
                          }}
                          className={`border-dashed border-b-2 border-yellow-500 relative
                            ${segment.isHovered ? "bg-yellow-900/30" : ""} 
                            ${segment.id === selectedFixId ? "animate-pulse-highlight bg-yellow-500/20" : ""}
                            ${segment.isAnimating ? "animate-fix-applied" : ""}
                          `}
                          data-fix-id={segment.id}
                        >
                          {segment.text}
                        </span>
                      )
                    } else {
                      return <span key={i}>{segment.text}</span>
                    }
                  })}
                </p>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={copyToChatInput}>Copy to Chat</ContextMenuItem>
                {selectedText && <ContextMenuItem onClick={handleAddComment}>Add Comment</ContextMenuItem>}
                {selectedText && <ContextMenuItem onClick={handleImproveText}>Improve</ContextMenuItem>}
              </ContextMenuContent>
            </ContextMenu>
          )
        }

        // Regular rendering without highlights
        if (isHeading) {
          const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements
          return (
            <ContextMenu key={index}>
              <ContextMenuTrigger>
                <HeadingTag
                  className="mb-2 mt-4 font-bold text-white"
                  contentEditable={isEditing}
                  suppressContentEditableWarning={isEditing}
                  onInput={(e) => handleContentChange(e, index)}
                >
                  {paragraphText}
                </HeadingTag>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={copyToChatInput}>Copy to Chat</ContextMenuItem>
                {selectedText && <ContextMenuItem onClick={handleAddComment}>Add Comment</ContextMenuItem>}
                {selectedText && <ContextMenuItem onClick={handleImproveText}>Improve</ContextMenuItem>}
              </ContextMenuContent>
            </ContextMenu>
          )
        }

        return (
          <ContextMenu key={index}>
            <ContextMenuTrigger>
              <p
                className="mb-2 text-zinc-200"
                contentEditable={isEditing}
                suppressContentEditableWarning={isEditing}
                onInput={(e) => handleContentChange(e, index)}
              >
                {paragraphText}
              </p>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={copyToChatInput}>Copy to Chat</ContextMenuItem>
              {selectedText && <ContextMenuItem onClick={handleAddComment}>Add Comment</ContextMenuItem>}
              {selectedText && <ContextMenuItem onClick={handleImproveText}>Improve</ContextMenuItem>}
            </ContextMenuContent>
          </ContextMenu>
        )
      }

      if (element.table) {
        // Simplified table rendering - tables are not editable in this version
        return (
          <div key={index} className="my-4 overflow-x-auto">
            <table className="min-w-full border-collapse border border-zinc-700">
              <tbody>
                {element.table.tableRows.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.tableCells.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="border border-zinc-700 p-2 text-zinc-200">
                        {cell.content.map((cellContent: any, contentIndex: number) => (
                          <div key={contentIndex}>
                            {cellContent.paragraph?.elements.map((el: any) => el.textRun?.content || "").join("")}
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      return null
    })
  }

  return (
    <ScrollArea
      className={`h-full bg-zinc-900 scroll-smooth ${className} ${props.isContextPaneOpen ? "pr-80" : ""}`}
      ref={scrollAreaRef}
    >
      <div className="mx-auto max-w-3xl p-6 relative document-content" ref={contentRef}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1
              className="text-2xl font-bold text-white"
              contentEditable={isEditing}
              suppressContentEditableWarning={isEditing}
              onInput={handleTitleChange}
            >
              {(isEditing ? editedContent : docContent).title}
            </h1>

            {/* Version dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  v{currentVersion}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* Add New Version option at the top */}
                <DropdownMenuItem onClick={handleNewVersion} className="text-green-500 font-medium">
                  + New Version
                </DropdownMenuItem>

                {/* Separator */}
                <div className="h-px bg-zinc-700 my-1"></div>

                {/* List of versions */}
                {versions
                  .slice()
                  .sort((a, b) => Number.parseFloat(b) - Number.parseFloat(a))
                  .map((version) => (
                    <DropdownMenuItem
                      key={version}
                      onClick={() => handleVersionChange(version)}
                      className={version === currentVersion ? "bg-zinc-700" : ""}
                    >
                      v{version}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={cancelEditing} className="mr-2">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={saveChanges}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="mr-2">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleSubmitForApproval}>
                  Submit for Approval
                </Button>
              </>
            )}
          </div>
        </div>
        <div className={isEditing ? "border border-zinc-700 rounded-md p-4" : ""}>{renderContent()}</div>

        {/* Comment input */}
        {addingComment && (
          <div
            style={{
              position: "absolute",
              right: "-300px", // Position to the right of the content
              top: `${commentPosition.y}px`,
              zIndex: 50,
            }}
          >
            <CommentInput highlightedText={selectedText} onSubmit={submitComment} onCancel={cancelComment} />
          </div>
        )}

        {/* Display comments */}
        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              position: "absolute",
              right: "-300px", // Position to the right of the content
              top: `${comment.position.y}px`,
              zIndex: 40,
            }}
          >
            <Comment
              comment={comment}
              onResolve={resolveComment}
              onDelete={deleteComment}
              onUpdate={updateComment}
              onToggleMinimize={toggleCommentMinimize}
            />
          </div>
        ))}

        {/* Text Improvement Modal */}
        {showImproveModal && (
          <TextImprovementModal
            originalText={textToImprove}
            position={improveModalPosition}
            onClose={() => setShowImproveModal(false)}
            onAccept={handleAcceptImprovedText}
            onCopyToChat={handleCopyImprovedTextToChat}
          />
        )}
      </div>
    </ScrollArea>
  )
}
