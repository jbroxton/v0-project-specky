import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create a Supabase client with service role key for admin access
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    console.log("Starting database setup...")

    // Create documents table
    console.log("Creating documents table...")
    const { error: documentsError } = await supabase.from("_simple_setup_log").insert({
      operation: "create_documents_table",
      status: "started",
    })

    if (documentsError) {
      // Create the log table if it doesn't exist
      await supabase.rpc("create_simple_setup_log_table")
    }

    // Execute SQL to create documents table
    const { error: createDocumentsError } = await supabase.from("_simple_setup_log").insert({
      operation: "create_documents",
      status: "in_progress",
      details: "Creating documents table",
    })

    if (createDocumentsError) {
      console.error("Error logging documents creation:", createDocumentsError)
    }

    // Use simple SQL query to check if table exists
    const { data: tableExists, error: checkError } = await supabase.rpc("table_exists", { table_name: "documents" })

    if (checkError) {
      console.error("Error checking if table exists:", checkError)
      return NextResponse.json(
        {
          success: false,
          error: `Error checking if table exists: ${checkError.message}`,
        },
        { status: 500 },
      )
    }

    if (!tableExists) {
      // Create the table using simple SQL
      const { error } = await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS documents (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            content JSONB,
            version TEXT DEFAULT '1.0',
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `,
      })

      if (error) {
        console.error("Error creating documents table:", error)
        return NextResponse.json(
          {
            success: false,
            error: `Error creating documents table: ${error.message}`,
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
