"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, MessageSquare, ChevronDown } from "lucide-react"
import { useAppContext } from "@/hooks/use-app-context"

export interface CommentData {
  id: string
  text: string
  highlightedText: string
  position: { x: number; y: number }
  timestamp: Date
  author: {
    name: string
    picture?: string
  }
  resolved?: boolean
  minimized?: boolean
}

interface CommentProps {
  comment: CommentData
  onResolve: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, text: string) => void
  onToggleMinimize: (id: string) => void
}

export function Comment({ comment, onResolve, onDelete, onUpdate, onToggleMinimize }: CommentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const { user } = useAppContext()

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(comment.id, editText)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditText(comment.text)
    setIsEditing(false)
  }

  const isCurrentUser = user?.name === comment.author.name

  // Render minimized comment
  if (comment.minimized) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-full bg-zinc-800 p-0 shadow-md"
        onClick={() => onToggleMinimize(comment.id)}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className={`bg-zinc-800 rounded-md shadow-lg w-64 ${comment.resolved ? "opacity-60" : ""}`}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
              <AvatarImage src={comment.author.picture || "/placeholder.svg"} alt={comment.author.name} />
            </Avatar>
            <span className="text-xs font-medium">{comment.author.name}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onToggleMinimize(comment.id)}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[60px] text-sm bg-zinc-900 border-zinc-700"
              placeholder="Add your comment..."
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm mb-2">{comment.text}</div>
            <div className="flex justify-end gap-1">
              {isCurrentUser && (
                <>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setIsEditing(true)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => onDelete(comment.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant={comment.resolved ? "outline" : "default"}
                className="h-7 px-2"
                onClick={() => onResolve(comment.id)}
              >
                {comment.resolved ? "Reopen" : "Resolve"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function CommentInput({
  highlightedText,
  onSubmit,
  onCancel,
}: {
  highlightedText: string
  onSubmit: (text: string) => void
  onCancel: () => void
}) {
  const [text, setText] = useState("")
  const { user } = useAppContext()

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text)
      setText("")
    }
  }

  return (
    <div className="bg-zinc-800 rounded-md shadow-lg w-64 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          <AvatarImage src={user?.picture || "/placeholder.svg"} alt={user?.name || "User"} />
        </Avatar>
        <span className="text-xs font-medium">{user?.name || "User"}</span>
      </div>
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[60px] text-sm bg-zinc-900 border-zinc-700"
          placeholder="Add your comment..."
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!text.trim()}>
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
