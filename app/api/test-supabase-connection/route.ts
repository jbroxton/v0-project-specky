import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    console.log("Creating Supabase client...")
    const supabase = createServerSupabaseClient()

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
      }

      // Now try to execute a simple RPC function
      console.log("Testing RPC function...")
      const { data: rpcTest, error: rpcError } = await supabase.rpc("test_connection")

      if (rpcError) {
        // If the function doesn't exist, that's not a connection issue
        if (rpcError.message.includes("function test_connection() does not exist")) {
          console.log("RPC function doesn't exist, but connection works")

          // Create the test function
          console.log("Creating test function...")
          const { error: createFunctionError } = await supabase.sql(`
            CREATE OR REPLACE FUNCTION test_connection()
            RETURNS jsonb AS $$
            BEGIN
              RETURN jsonb_build_object('status', 'success', 'timestamp', now());
            END;
            $$ LANGUAGE plpgsql;
          `)

          if (createFunctionError) {
            console.error("Error creating test function:", createFunctionError)
            return NextResponse.json(
              {
                success: false,
                error: `Error creating test function: ${createFunctionError.message}`,
                connectionStatus: "OK",
              },
              { status: 500 },
            )
          }

          // Try the function again
          console.log("Testing newly created function...")
          const { data: retryData, error: retryError } = await supabase.rpc("test_connection")

          if (retryError) {
            console.error("Error calling test function:", retryError)
            return NextResponse.json(
              {
                success: false,
                error: `Error calling test function: ${retryError.message}`,
                connectionStatus: "OK",
              },
              { status: 500 },
            )
          }

          return NextResponse.json({
            success: true,
            message: "Successfully connected to Supabase and created test function",
            data: retryData,
          })
        } else {
          console.error("RPC error:", rpcError)
          return NextResponse.json(
            {
              success: false,
              error: `RPC error: ${rpcError.message}`,
              code: rpcError.code,
              connectionStatus: "OK",
            },
            { status: 500 },
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: "Successfully connected to Supabase and executed test function",
        data: rpcTest,
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
