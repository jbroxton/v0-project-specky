"use server"

import { getSupabaseClient } from "@/lib/supabase"

/**
 * Get documents for the current user
 */
export async function getUserDocuments() {
  try {
    const supabase = getSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user is found, return an empty array
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

/**
 * Get recent conversations for the current user
 */
export async function getUserConversations(limit = 5) {
  try {
    const supabase = getSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user is found, return an empty array
    if (!user) {
      return { conversations: [], error: "User not authenticated" }
    }

    // Get conversations for the current user
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching conversations:", error)
      return { conversations: [], error: error.message }
    }

    return { conversations: conversations || [], error: null }
  } catch (error) {
    console.error("Error in getUserConversations:", error)
    return { conversations: [], error: "Failed to fetch conversations" }
  }
}

/**
 * Get user profile data
 */
export async function getUserProfile() {
  try {
    const supabase = getSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user is found, return null
    if (!user) {
      return { profile: null, error: "User not authenticated" }
    }

    // Get the user's profile
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return { profile: null, error: error.message }
    }

    return { profile, error: null }
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return { profile: null, error: "Failed to fetch profile" }
  }
}
