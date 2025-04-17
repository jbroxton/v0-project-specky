"use client"

import { useState, useEffect } from "react"
import { getUserDocuments, getUserConversations } from "@/app/actions/user-dashboard-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, MessageSquare, Clock } from "lucide-react"

export function UserStats() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalConversations: 0,
    lastActivity: null as Date | null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        // Fetch documents and conversations
        const [documentsResult, conversationsResult] = await Promise.all([
          getUserDocuments(),
          getUserConversations(100), // Get more conversations to calculate stats
        ])

        const documents = documentsResult.documents || []
        const conversations = conversationsResult.conversations || []

        // Calculate last activity date
        const documentDates = documents.map((d) => new Date(d.updated_at || d.created_at))
        const conversationDates = conversations.map((c) => new Date(c.updated_at || c.created_at))
        const allDates = [...documentDates, ...conversationDates].filter(Boolean)

        const lastActivity = allDates.length > 0 ? new Date(Math.max(...allDates.map((d) => d.getTime()))) : null

        setStats({
          totalDocuments: documents.length,
          totalConversations: conversations.length,
          lastActivity,
        })
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalDocuments}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversations</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalConversations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : stats.lastActivity ? stats.lastActivity.toLocaleDateString() : "Never"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
