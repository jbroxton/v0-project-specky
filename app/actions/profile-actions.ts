"use server"

import { getSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types
export interface ProfileData {
  id?: string
  user_id?: string
  full_name?: string
  email?: string
  avatar_url?: string
  job_title?: string
  company?: string
}

/**
 * Get the current user's profile
 */
export async function getCurrentProfile(): Promise<{ profile: ProfileData | null; error: string | null }> {
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
      // If the profile doesn't exist, create one
      if (error.code === "PGRST116") {
        return await createProfile({
          user_id: user.id,
          full_name: user.user_metadata?.full_name,
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url,
        })
      }

      console.error("Error fetching profile:", error)
      return { profile: null, error: error.message }
    }

    return { profile, error: null }
  } catch (error) {
    console.error("Error in getCurrentProfile:", error)
    return { profile: null, error: "Failed to fetch profile" }
  }
}

/**
 * Create a new profile
 */
export async function createProfile(data: ProfileData): Promise<{ profile: ProfileData | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Get current user if user_id is not provided
    if (!data.user_id) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // If no user is found, return an error
      if (!user) {
        return { profile: null, error: "User not authenticated" }
      }

      data.user_id = user.id
    }

    // Create the profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({
        user_id: data.user_id,
        full_name: data.full_name || null,
        email: data.email || null,
        avatar_url: data.avatar_url || null,
        job_title: data.job_title || null,
        company: data.company || null,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error creating profile:", error)
      return { profile: null, error: error.message }
    }

    // Revalidate the profile page
    revalidatePath("/profile")

    return { profile, error: null }
  } catch (error) {
    console.error("Error in createProfile:", error)
    return { profile: null, error: "Failed to create profile" }
  }
}

/**
 * Update a profile
 */
export async function updateProfile(data: Partial<ProfileData>): Promise<{ success: boolean; error: string | null }> {
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

    // Update the profile
    const { error } = await supabase
      .from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the profile page
    revalidatePath("/profile")

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in updateProfile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}
