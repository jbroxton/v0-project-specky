"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppContext } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Settings, Loader2, Clock, ChevronLeft, ChevronRight, Search, Plus, FileText } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Profile } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase"
import { getOrCreateAnonymousId } from "@/lib/anonymous-id"

interface Document {
  id: string
  title: string
  created_at: string
  updated_at: string
  is_template?: boolean
}

interface NavItem {
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
}

interface SidebarProps {
  profileData?: Profile | null
  isLoadingProfile?: boolean
  profileError?: string | null
  supabaseUser?: User | null
}

export function Sidebar({ profileData, isLoadingProfile, profileError, supabaseUser }: SidebarProps) {
  const { user, logout, selectedDocId, setSelectedDocId, setDocContent } = useAppContext()
  const [collapsed, setCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  // Get anonymous ID on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const anonId = getOrCreateAnonymousId()
      setAnonymousId(anonId)
    }
  }, [])

  // Load documents when component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true)
      try {
        // In production, this would be an API call to fetch documents
        // For now, we'll just simulate a delay and set empty documents
        await new Promise((resolve) => setTimeout(resolve, 500))
        setDocuments([])
        setFilteredDocuments([])
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
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

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  // Handle Supabase logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout() // Also call the app context logout for compatibility
  }

  // Navigation items - only Settings
  const navItems: NavItem[] = [
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ]

  const handleDocumentSelect = async (docId: string) => {
    setIsLoading(true)
    setSelectedDocId(docId)

    try {
      // In production, this would fetch the document content from an API
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching document:", error)
      setIsLoading(false)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
  }

  // Format date to be more compact
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "2-digit" })
  }

  // Get user display name and email
  const getUserDisplayName = () => {
    if (isLoadingProfile) return "Loading..."
    if (profileData?.full_name) return profileData.full_name
    if (supabaseUser?.user_metadata?.full_name) return supabaseUser.user_metadata.full_name
    return user?.name || "User"
  }

  const getUserEmail = () => {
    if (profileData?.email) return profileData.email
    if (supabaseUser?.email) return supabaseUser.email
    return user?.email || ""
  }

  const getUserAvatar = () => {
    if (profileData?.avatar_url) return profileData.avatar_url
    if (supabaseUser?.user_metadata?.avatar_url) return supabaseUser.user_metadata.avatar_url
    return user?.picture || "/placeholder.svg"
  }

  // Check if user is authenticated
  const isAuthenticated = !!supabaseUser || !!user

  return (
    <div
      className={`flex h-full flex-col bg-black text-white ${collapsed ? "w-16" : "min-w-[16rem] w-auto max-w-[20rem]"}`}
    >
      <div className="flex h-16 items-center px-4 justify-between">
        <Link href="/" className="flex items-center">
          <span className={cn("text-xl font-bold", collapsed && "sr-only")}>Speqq</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-2">
        <div className="mb-2 px-3 py-2 flex justify-between items-center">
          <h3 className={`text-xs font-medium text-zinc-400 ${collapsed ? "sr-only" : ""}`}>DOCUMENTS</h3>
          {!collapsed && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Create New PRD</span>
            </Button>
          )}
        </div>

        {/* Add search bar under DOCUMENTS heading */}
        {!collapsed && (
          <div className="px-2 mb-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 py-1 h-8 bg-zinc-800 border-zinc-700 text-sm text-white placeholder-zinc-500"
              />
            </div>
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-1">
            {isLoading ? (
              <div className="py-8 px-2 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">Loading documents...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <button
                  key={doc.id}
                  className={`flex w-full items-center rounded-md p-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                    selectedDocId === doc.id ? "bg-zinc-800" : ""
                  }`}
                  onClick={() => handleDocumentSelect(doc.id)}
                >
                  {!collapsed && (
                    <div className="flex-grow min-w-0">
                      <div className="truncate font-medium">{doc.title}</div>
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span>{formatDate(doc.updated_at || doc.created_at || "")}</span>
                        </div>
                        {doc.is_template && (
                          <div className="bg-zinc-700 px-1.5 py-0.5 rounded-full text-xs">Template</div>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="py-8 px-2 text-center">
                <FileText className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm mb-2">No documents</p>
                <p className="text-zinc-600 text-xs">
                  {isAuthenticated
                    ? "Create your first document to get started"
                    : "Sign in to create and save documents"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {isLoading && (
          <div className="mt-4 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        )}

        {/* Navigation items - only Settings */}
        <div className="mt-4 space-y-1 px-2">
          {navItems.map((item, index) => {
            const ItemIcon = item.icon

            return item.href ? (
              <Button
                key={index}
                variant="ghost"
                className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-800"
                asChild
              >
                <Link href={item.href}>
                  <ItemIcon className="h-4 w-4" />
                  <span className={cn("flex-1", collapsed && "sr-only")}>{item.label}</span>
                </Link>
              </Button>
            ) : (
              <Button
                key={index}
                variant="ghost"
                className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-800"
                onClick={item.onClick}
              >
                <ItemIcon className="h-4 w-4" />
                <span className={cn("flex-1", collapsed && "sr-only")}>{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="mt-auto border-t border-zinc-800 p-4">
        {isAuthenticated ? (
          <>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getUserDisplayName().charAt(0) || "?"}</AvatarFallback>
              {getUserAvatar() && (
                <AvatarImage src={getUserAvatar() || "/placeholder.svg"} alt={getUserDisplayName()} />
              )}
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{getUserDisplayName()}</span>
                <button onClick={handleLogout} className="text-xs text-zinc-400 hover:text-zinc-300 text-left">
                  Sign out
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Avatar className="h-8 w-8 bg-zinc-800">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium" title={anonymousId || "Anonymous User"}>
                  Anonymous User
                </span>
                <div className="flex gap-2 mt-1">
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs px-3 py-0">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild size="sm" className="h-7 text-xs px-3 py-0">
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
