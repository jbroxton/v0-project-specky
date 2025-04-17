import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create a Supabase client with service role key for admin access
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Supabase URL or service role key",
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection with a simple query
    const { data: connectionTest, error: connectionError } = await supabase
      .from("_connection_test")
      .select("*")
      .limit(1)
      .maybeSingle()

    // If we get a "relation does not exist" error, that's actually good - it means we connected
    if (connectionError && connectionError.code !== "PGRST116") {
      console.error("Error connecting to Supabase:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: `Error connecting to Supabase: ${connectionError.message}`,
          code: connectionError.code,
        },
        { status: 500 },
      )
    }

    // Create a simple test table
    const { error: createError } = await supabase.rpc("create_test_table")

    if (createError) {
      // If the function doesn't exist, try creating it first
      if (createError.message.includes("function create_test_table() does not exist")) {
        // Create the function
        const { error: functionError } = await supabase.sql(`
          CREATE OR REPLACE FUNCTION create_test_table()
          RETURNS void AS $$
          BEGIN
            CREATE TABLE IF NOT EXISTS _setup_test (
              id SERIAL PRIMARY KEY,
              name TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          END;
          $$ LANGUAGE plpgsql;
        `)

        if (functionError) {
          console.error("Error creating function:", functionError)
          return NextResponse.json(
            {
              success: false,
              error: `Error creating function: ${functionError.message}`,
            },
            { status: 500 },
          )
        }

        // Try again
        const { error: retryError } = await supabase.rpc("create_test_table")

        if (retryError) {
          console.error("Error creating test table:", retryError)
          return NextResponse.json(
            {
              success: false,
              error: `Error creating test table: ${retryError.message}`,
            },
            { status: 500 },
          )
        }
      } else {
        console.error("Error creating test table:", createError)
        return NextResponse.json(
          {
            success: false,
            error: `Error creating test table: ${createError.message}`,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error) {
    console.error("Error setting up database:", error)
    let errorMessage = "Unknown error"

    if (error instanceof Error) {
      errorMessage = error.message
      console.error("Error details:", error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
