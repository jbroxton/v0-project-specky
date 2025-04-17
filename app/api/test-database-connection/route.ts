import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Creating Supabase client...")
    const supabase = getSupabaseClient()

    // Step 1: Test basic connectivity with a known table that should exist
    console.log("Testing basic database connectivity...")
    try {
      // First check if we can connect to the database at all
      const { data: connectionTest, error: connectionError } = await supabase.rpc("version")

      if (connectionError) {
        console.error("Basic connection error:", connectionError)
        return NextResponse.json(
          {
            success: false,
            stage: "connection",
            error: `Database connection error: ${connectionError.message}`,
            code: connectionError.code,
            details: connectionError,
          },
          { status: 500 },
        )
      }

      console.log("Basic connection successful:", connectionTest)

      // Step 2: Test if we can access the profiles table (which should exist)
      console.log("Testing access to profiles table...")
      const { count, error: profilesError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

      if (profilesError) {
        // If table doesn't exist or we don't have permission
        console.error("Profiles table access error:", profilesError)
        return NextResponse.json(
          {
            success: false,
            stage: "schema",
            error: `Cannot access profiles table: ${profilesError.message}`,
            code: profilesError.code,
            details: profilesError,
          },
          { status: 500 },
        )
      }

      // Step 3: Test if we can perform a simple write operation (with rollback)
      console.log("Testing write permissions...")
      let writeSuccess = false
      let writeError = null

      try {
        // Start a transaction that we'll roll back
        const { error: txError } = await supabase.rpc("test_write_permission")

        if (txError) {
          writeError = txError
        } else {
          writeSuccess = true
        }
      } catch (err) {
        writeError = err
        console.error("Write test error:", err)
      }

      // Return comprehensive test results
      return NextResponse.json({
        success: true,
        message: "Database connection tests completed",
        results: {
          connection: { success: true, details: connectionTest },
          schema: { success: true, tables: ["profiles"], count },
          write: {
            success: writeSuccess,
            error: writeError
              ? { message: writeError instanceof Error ? writeError.message : String(writeError) }
              : null,
          },
        },
      })
    } catch (dbError) {
      console.error("Database operation error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: dbError instanceof Error ? dbError.message : "Database operation failed",
          details: dbError instanceof Error ? { stack: dbError.stack } : dbError,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error setting up test:", error)

    // Provide detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
    }

    return NextResponse.json(
      {
        success: false,
        error: errorDetails.message,
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
