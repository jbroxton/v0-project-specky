"use server"

import { getSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types
export interface DocumentData {
  id?: string
  title: string
  content?: any
  version?: string
  description?: string
  status?: string
  is_public?: boolean
}

/**
 * Create a new document
 */
export async function createDocument(
  data: DocumentData,
): Promise<{ document_id: string | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Get current user (authenticated or anonymous)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user is found, return an error
    // This should not happen if anonymous auth is properly implemented on the client
    if (!user) {
      return { document_id: null, error: "User not authenticated" }
    }

    // Create the document
    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        title: data.title || "Untitled Document",
        content: data.content || { body: { content: [] } },
        version: data.version || "1.0",
        description: data.description || "",
        status: data.status || "draft",
        is_public: data.is_public || false,
        user_id: user.id,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating document:", error)
      return { document_id: null, error: error.message }
    }

    return { document_id: document.id, error: null }
  } catch (error) {
    console.error("Error in createDocument:", error)
    return { document_id: null, error: "Failed to create document" }
  }
}

/**
 * Get a document by ID
 */
export async function getDocument(
  documentId: string,
): Promise<{ document: DocumentData | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Get the document
    const { data: document, error } = await supabase.from("documents").select("*").eq("id", documentId).single()

    if (error) {
      console.error("Error fetching document:", error)
      return { document: null, error: error.message }
    }

    return { document, error: null }
  } catch (error) {
    console.error("Error in getDocument:", error)
    return { document: null, error: "Failed to fetch document" }
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  documentId: string,
  data: Partial<DocumentData>,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Update the document
    const { error } = await supabase
      .from("documents")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    if (error) {
      console.error("Error updating document:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the document page
    revalidatePath(`/dashboard/document/${documentId}`)

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in updateDocument:", error)
    return { success: false, error: "Failed to update document" }
  }
}

/**
 * Create a new document version
 */
export async function createDocumentVersion(
  documentId: string,
  content: any,
  version: string,
  notes?: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user is found, return an error
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Create the document version
    const { error } = await supabase.from("document_versions").insert({
      document_id: documentId,
      content,
      version,
      notes: notes || "",
      created_by: user.id,
    })

    if (error) {
      console.error("Error creating document version:", error)
      return { success: false, error: error.message }
    }

    // Update the document with the new version
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        version,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    if (updateError) {
      console.error("Error updating document version:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in createDocumentVersion:", error)
    return { success: false, error: "Failed to create document version" }
  }
}

/**
 * Get all documents for the current user
 */
export async function getUserDocuments(): Promise<{ documents: DocumentData[]; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user is found, return an empty array
    // This should not happen if anonymous auth is properly implemented on the client
    if (!user) {
      return { documents: [], error: "User not authenticated" }
    }

    // Get documents for the current user
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching documents:", error)
      return { documents: [], error: error.message }
    }

    return { documents: documents || [], error: null }
  } catch (error) {
    console.error("Error in getUserDocuments:", error)
    return { documents: [], error: "Failed to fetch documents" }
  }
}
