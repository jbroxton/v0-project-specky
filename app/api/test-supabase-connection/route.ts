import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check for required environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Supabase URL or service role key",
        },
        { status: 500 },
      )
    }

    // Create the client
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    try {
      // Simple query to test connection
      const { data, error } = await supabase.from("_test_connection").select("count").limit(1).single()

      if (error) {
        if (error.code === "PGRST116") {
          // Table doesn't exist, but connection works
          return NextResponse.json({
            success: true,
            message: "Successfully connected to Supabase",
            details: "Table doesn't exist, but connection works",
          })
        }

        // Other error
        return NextResponse.json(
          {
            success: false,
            error: `Database error: ${error.message}`,
            code: error.code,
          },
          { status: 500 },
        )
      }

      // Success case
      return NextResponse.json({
        success: true,
        message: "Successfully connected to Supabase",
        data,
      })
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
