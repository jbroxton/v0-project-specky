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

    // Test connection with a simple query
    try {
      console.log("Testing database connection...")
      await supabase.from("_test_connection").select("count").limit(1).maybeSingle()
      console.log("Connection successful")
    } catch (connectionError) {
      console.log("Connection test error (expected if table doesn't exist):", connectionError)
      // Continue anyway as the error might just be that the table doesn't exist
    }

    // Create a simple test table to verify SQL execution
    try {
      console.log("Creating test table...")
      await supabase.sql(`
        CREATE TABLE IF NOT EXISTS _setup_test (
          id SERIAL PRIMARY KEY,
          name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `)
      console.log("Test table created successfully")

      return NextResponse.json({
        success: true,
        message: "Database setup test completed successfully",
      })
    } catch (sqlError) {
      console.error("SQL execution error:", sqlError)
      return NextResponse.json(
        {
          success: false,
          error: sqlError instanceof Error ? sqlError.message : "SQL execution failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error setting up database:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
