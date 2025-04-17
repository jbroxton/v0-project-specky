import { createClient } from "@supabase/supabase-js"
import { getRequiredEnv } from "./env-validation"
import type { Database as DatabaseType } from "./database.types"

/**
 * Creates a Supabase admin client for server-side operations
 * This should only be used in server contexts (API routes, Server Actions)
 */
export function createServerSupabaseClient() {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL")
  const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")

  return createClient<DatabaseType>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Creates a Supabase client with the anon key for server-side operations
 * This should be used for operations that don't require admin privileges
 */
export function createServerAnonClient() {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL")
  const supabaseAnonKey = getRequiredEnv("SUPABASE_ANON_KEY")

  return createClient<DatabaseType>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Type definition stub - you'll need to generate this from your actual database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          // Add other fields as needed
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          // Add other fields as needed
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          // Add other fields as needed
        }
      }
      // Add other tables as needed
    }
    Functions: {
      // Add RPC functions as needed
    }
  }
}
