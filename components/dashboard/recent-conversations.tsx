"use client"

import { useState, useEffect } from "react"
import { getUserConversations } from "@/app/actions/user-dashboard-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function RecentConversations() {
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true)
      try {
        const { conversations, error } = await getUserConversations(5)

        if (error) {
          setError(error)
        } else {
          setConversations(conversations)
        }
      } catch (err) {
        setError("Failed to load conversations")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const handleOpenConversation = (id: string) => {
    router.push(`/chat/${id}`)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Conversations</CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <MessageSquare className="h-10 w-10 text-zinc-400 mb-2" />
            <p className="text-zinc-400">No recent conversations</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center gap-3 rounded-md border border-zinc-800 p-3 hover:bg-zinc-800 cursor-pointer"
                onClick={() => handleOpenConversation(conversation.id)}
              >
                <MessageSquare className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="font-medium">{conversation.title || "Untitled Conversation"}</p>
                  <p className="text-xs text-zinc-400">{new Date(conversation.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
