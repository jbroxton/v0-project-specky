"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, Plus, XIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppContext } from "@/context/app-context"

interface ContextPaneProps {
  onClose: () => void
  initialText?: string
}

interface FileItem {
  id: string
  name: string
  size: string
}

interface LinkItem {
  id: string
  url: string
  description: string
}

export function ContextPane({ onClose, initialText = "" }: ContextPaneProps) {
  const { setProductContext, productContext } = useAppContext()
  const [productName, setProductName] = useState(productContext?.productName || "")
  const [productDescription, setProductDescription] = useState(productContext?.productDescription || "")
  const [targetUsers, setTargetUsers] = useState(productContext?.targetUsers || "")
  const [files, setFiles] = useState<FileItem[]>(productContext?.files || [])
  const [links, setLinks] = useState<LinkItem[]>(productContext?.links || [])
  const [newLink, setNewLink] = useState("")
  const [newLinkDescription, setNewLinkDescription] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: formatFileSize(file.size),
      }))

      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Add a new link
  const addLink = () => {
    if (newLink.trim()) {
      const link: LinkItem = {
        id: Math.random().toString(36).substring(7),
        url: newLink,
        description: newLinkDescription || newLink,
      }
      setLinks((prev) => [...prev, link])
      setNewLink("")
      setNewLinkDescription("")
    }
  }

  // Remove a file
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  // Remove a link
  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id))
  }

  // Update context in the app
  const handleUpdateContext = () => {
    const context = {
      productName,
      productDescription,
      targetUsers,
      files,
      links,
    }

    // Update context in the app context
    setProductContext(context)

    // Close the pane
    onClose()
  }

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-900 flex flex-col h-screen overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <h3 className="font-medium">Product Context</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Product Description</Label>
            <Textarea
              id="product-description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="min-h-[100px] bg-zinc-800 border-zinc-700 text-white resize-none"
              placeholder="Describe your product"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-users">Target Users</Label>
            <Textarea
              id="target-users"
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
              className="min-h-[80px] bg-zinc-800 border-zinc-700 text-white resize-none"
              placeholder="Describe your target users"
            />
          </div>

          <div className="space-y-2">
            <Label>Reference Files</Label>
            <div className="border border-dashed border-zinc-700 rounded-md p-3 text-center">
              <Upload className="h-6 w-6 mx-auto text-zinc-500 mb-2" />
              <p className="text-sm text-zinc-400 mb-2">Upload PRDs, mocks, or other reference files</p>
              <Input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="w-full bg-zinc-800 border-zinc-700 h-9 text-sm"
              >
                Choose Files
              </Button>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label className="text-sm text-zinc-400">Uploaded Files</Label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-zinc-800 p-2 rounded-md">
                      <div className="truncate flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-zinc-400">{file.size}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Links to Files</Label>
            <div className="space-y-2">
              <Input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white h-9"
                placeholder="https://example.com/file"
              />
              <Input
                value={newLinkDescription}
                onChange={(e) => setNewLinkDescription(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white h-9"
                placeholder="Description (optional)"
              />
              <Button
                variant="outline"
                onClick={addLink}
                disabled={!newLink.trim()}
                className="w-full bg-zinc-800 border-zinc-700 h-9 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>

            {links.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label className="text-sm text-zinc-400">Added Links</Label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between bg-zinc-800 p-2 rounded-md">
                      <div className="truncate flex-1">
                        <p className="text-sm font-medium truncate">{link.description}</p>
                        <p className="text-xs text-zinc-400 truncate">{link.url}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink(link.id)}
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-zinc-800 p-4">
        <Button onClick={handleUpdateContext} className="w-full">
          Set/Update Context
        </Button>
      </div>
    </div>
  )
}
