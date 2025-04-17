"use server"

import { getSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types
export interface CommentData {
  id?: string
  document_id: string
  text: string
  highlighted_text?: string
  position: any
  is_resolved?: boolean
}

/**
 * Create a new comment
 */
export async function createComment(data: CommentData): Promise<{ comment_id: string | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user is found, return an error
    if (!user) {
      return { comment_id: null, error: "User not authenticated" }
    }

    // Create the comment
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        document_id: data.document_id,
        text: data.text,
        highlighted_text: data.highlighted_text || "",
        position: data.position,
        is_resolved: data.is_resolved || false,
        user_id: user.id,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating comment:", error)
      return { comment_id: null, error: error.message }
    }

    // Revalidate the document page
    revalidatePath(`/dashboard/document/${data.document_id}`)

    return { comment_id: comment.id, error: null }
  } catch (error) {
    console.error("Error in createComment:", error)
    return { comment_id: null, error: "Failed to create comment" }
  }
}

/**
 * Get comments for a document
 */
export async function getDocumentComments(
  documentId: string,
): Promise<{ comments: CommentData[]; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Get the comments
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching comments:", error)
      return { comments: [], error: error.message }
    }

    return { comments: comments || [], error: null }
  } catch (error) {
    console.error("Error in getDocumentComments:", error)
    return { comments: [], error: "Failed to fetch comments" }
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  data: Partial<CommentData>,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Update the comment
    const { error } = await supabase
      .from("comments")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)

    if (error) {
      console.error("Error updating comment:", error)
      return { success: false, error: error.message }
    }

    // Get the document ID to revalidate the page
    const { data: comment } = await supabase.from("comments").select("document_id").eq("id", commentId).single()

    if (comment) {
      revalidatePath(`/dashboard/document/${comment.document_id}`)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in updateComment:", error)
    return { success: false, error: "Failed to update comment" }
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Get the document ID to revalidate the page
    const { data: comment } = await supabase.from("comments").select("document_id").eq("id", commentId).single()

    // Delete the comment
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      return { success: false, error: error.message }
    }

    if (comment) {
      revalidatePath(`/dashboard/document/${comment.document_id}`)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in deleteComment:", error)
    return { success: false, error: "Failed to delete comment" }
  }
}
