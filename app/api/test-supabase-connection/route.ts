// Fix the API route to ensure it always returns valid JSON

import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Creating Supabase client...")
    const supabase = getSupabaseClient()

    console.log("Testing database connection...")

    // First, check if we can connect at all
    try {
      // Simple query that should always work if connection is valid
      const { data: connectionTest, error: connectionError } = await supabase
        .from("_connection_test")
        .select("count")
        .limit(1)
        .maybeSingle()

      // If we get a "relation does not exist" error, that's actually good
      // It means we connected to the database but the table doesn't exist
      if (connectionError) {
        if (connectionError.code === "PGRST116") {
          console.log("Connection successful (table doesn't exist)")
          return NextResponse.json({
            success: true,
            message: "Database connection successful",
            details: "The test table doesn't exist, but the connection is working properly.",
          })
        } else {
          console.error("Connection error:", connectionError)
          return NextResponse.json(
            {
              success: false,
              error: `Database connection error: ${connectionError.message}`,
              code: connectionError.code,
            },
            { status: 500 },
          )
        }
      } else {
        console.log("Connection successful (table exists)")
        return NextResponse.json({
          success: true,
          message: "Database connection successful",
          data: connectionTest,
        })
      }
    } catch (dbError) {
      console.error("Database operation error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: dbError instanceof Error ? dbError.message : "Database operation failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error testing Supabase connection:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
