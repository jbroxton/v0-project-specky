"use server"

import { getUserProfile } from "@/lib/supabase"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function getProfileData() {
  try {
    // Create a Supabase client with the stored auth cookie
    const cookieStore = cookies()

    // Create a new client instance specifically for this server action
    // This is necessary because we need to use the cookies from the request
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    // Get the user's profile
    const profile = await getUserProfile(user.id)

    if (!profile) {
      return { error: "Profile not found" }
    }

    return { profile }
  } catch (error) {
    console.error("Error in getProfileData:", error)
    return { error: "Failed to fetch profile data" }
  }
}
