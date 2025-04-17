import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    // Create a Supabase client
    const supabase = getSupabaseClient()

    // Test the client with a simple query
    const { data, error } = await supabase.from("_test_connection").select("count").limit(1).maybeSingle()

    // If we get a "relation does not exist" error, that's actually good
    // It means we connected to the database but the table doesn't exist
    if (error && error.code === "PGRST116") {
      return NextResponse.json({
        success: true,
        message: "Supabase client successfully connected to the database",
        details: "Table '_test_connection' doesn't exist, but connection works",
      })
    } else if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Database connection error: ${error.message}`,
          code: error.code,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Supabase client successfully connected to the database",
      data,
    })
  } catch (error) {
    console.error("Error testing Supabase client:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
