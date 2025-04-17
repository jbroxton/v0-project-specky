import { createClient } from "@supabase/supabase-js"

// Types for better type safety
type SupabaseClient = ReturnType<typeof createClient>

// Global instances to ensure we only create one client per environment
let clientInstance: SupabaseClient | null = null
let adminInstance: SupabaseClient | null = null

// Create a singleton Supabase client for browser/client-side usage
export function getSupabaseClient() {
  if (clientInstance) return clientInstance

  // Create a standard client with the anon key
  clientInstance = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return clientInstance
}

// Create a singleton Supabase admin client for server-side operations
export function getSupabaseAdmin() {
  if (adminInstance) return adminInstance

  // Only create admin client on the server side where service role key is available
  if (typeof window === "undefined") {
    adminInstance = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } else {
    // Fallback to regular client if service role key is not available
    adminInstance = getSupabaseClient()
  }

  return adminInstance
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  avatar_url: string
  job_title?: string
  company?: string
  created_at: string
  updated_at: string
}

// Function to fetch a user's profile
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}
