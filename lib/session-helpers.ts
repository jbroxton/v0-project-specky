import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Sets a session variable that persists across transactions
 */
export async function setSessionVariable(supabase: SupabaseClient, key: string, value: string): Promise<void> {
  try {
    await supabase.rpc("set_config", {
      key,
      value,
      is_local: false, // Make it persist across transactions
    })
  } catch (error) {
    console.error(`Error setting session variable ${key}:`, error)
    throw error
  }
}
