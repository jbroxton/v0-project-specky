"use client"

import { useState, useEffect } from "react"
import { getUserDocuments } from "@/app/actions/user-dashboard-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserDocumentsList() {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true)
      try {
        const { documents, error } = await getUserDocuments()

        if (error) {
          setError(error)
        } else {
          setDocuments(documents)
        }
      } catch (err) {
        setError("Failed to load documents")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const handleCreateDocument = () => {
    router.push("/dashboard/document/new")
  }

  const handleOpenDocument = (id: string) => {
    router.push(`/dashboard/document/${id}`)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
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
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Documents</CardTitle>
        <Button onClick={handleCreateDocument} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Document
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-zinc-400 mb-3" />
            <h3 className="text-lg font-medium mb-1">No documents yet</h3>
            <p className="text-zinc-400 mb-4">Create your first document to get started</p>
            <Button onClick={handleCreateDocument}>
              <Plus className="mr-2 h-4 w-4" />
              Create Document
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border border-zinc-800 p-3 hover:bg-zinc-800 cursor-pointer"
                onClick={() => handleOpenDocument(doc.id)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-zinc-400">{new Date(doc.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-xs bg-zinc-700 px-2 py-1 rounded">{doc.status || "Draft"}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
