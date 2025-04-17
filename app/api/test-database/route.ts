import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Test the database connection by querying the documents table
    const { data, error } = await supabase.from("documents").select("count").limit(1).single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      tables: ["documents", "document_versions", "comments", "fixes", "conversations"],
    })
  } catch (error) {
    console.error("Error testing database connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
