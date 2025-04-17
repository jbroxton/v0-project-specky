"use server"
import { getSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types
export interface FixData {
  id?: string
  document_id: string
  text: string
  description?: string
  position: any
  suggested_replacement?: string
  fix_type: "edit" | "insert" | "remove"
  error_number?: number
  applied?: boolean
}

/**
 * Create a new fix
 */
export async function createFix(data: FixData): Promise<{ fix_id: string | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Create the fix
    const { data: fix, error } = await supabase
      .from("fixes")
      .insert({
        document_id: data.document_id,
        text: data.text,
        description: data.description || "",
        position: data.position,
        suggested_replacement: data.suggested_replacement || "",
        fix_type: data.fix_type,
        error_number: data.error_number,
        applied: data.applied || null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating fix:", error)
      return { fix_id: null, error: error.message }
    }

    // Revalidate the document page
    revalidatePath(`/dashboard/document/${data.document_id}`)

    return { fix_id: fix.id, error: null }
  } catch (error) {
    console.error("Error in createFix:", error)
    return { fix_id: null, error: "Failed to create fix" }
  }
}

/**
 * Get fixes for a document
 */
export async function getDocumentFixes(documentId: string): Promise<{ fixes: FixData[]; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Get the fixes
    const { data: fixes, error } = await supabase
      .from("fixes")
      .select("*")
      .eq("document_id", documentId)
      .order("error_number", { ascending: true })

    if (error) {
      console.error("Error fetching fixes:", error)
      return { fixes: [], error: error.message }
    }

    return { fixes: fixes || [], error: null }
  } catch (error) {
    console.error("Error in getDocumentFixes:", error)
    return { fixes: [], error: "Failed to fetch fixes" }
  }
}

/**
 * Update a fix
 */
export async function updateFix(
  fixId: string,
  data: Partial<FixData>,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient()

    // Update the fix
    const { error } = await supabase.from("fixes").update(data).eq("id", fixId)

    if (error) {
      console.error("Error updating fix:", error)
      return { success: false, error: error.message }
    }

    // Get the document ID to revalidate the page
    const { data: fix } = await supabase.from("fixes").select("document_id").eq("id", fixId).single()

    if (fix) {
      revalidatePath(`/dashboard/document/${fix.document_id}`)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in updateFix:", error)
    return { success: false, error: "Failed to update fix" }
  }
}
