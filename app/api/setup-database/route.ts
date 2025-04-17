import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

// Define setup steps
const SETUP_STEPS = [
  {
    name: "Create setup_log table",
    function: "create_setup_log_table",
  },
  {
    name: "Create profiles table",
    function: "create_profiles_table",
  },
  {
    name: "Create documents table",
    function: "create_documents_table",
  },
  {
    name: "Create conversations table",
    function: "create_conversations_table",
  },
  {
    name: "Create messages table",
    function: "create_messages_table",
  },
  {
    name: "Setup RLS policies",
    function: "setup_rls_policies",
  },
]

export async function GET() {
  try {
    // Create Supabase admin client
    const supabase = createServerSupabaseClient()

    // Log setup start
    console.log("Starting database setup...")

    // Track results for each step
    const results = []

    // Execute each setup step
    for (const step of SETUP_STEPS) {
      try {
        console.log(`Executing step: ${step.name}`)

        // Call the RPC function
        const { data, error } = await supabase.rpc(step.function)

        if (error) {
          console.error(`Error in step "${step.name}":`, error)
          results.push({
            step: step.name,
            success: false,
            error: error.message,
          })

          // Log the error but continue with next steps
          continue
        }

        console.log(`Successfully completed step: ${step.name}`)
        results.push({
          step: step.name,
          success: true,
        })
      } catch (stepError) {
        console.error(`Exception in step "${step.name}":`, stepError)
        results.push({
          step: step.name,
          success: false,
          error: stepError instanceof Error ? stepError.message : "Unknown error",
        })
      }
    }

    // Check if all steps were successful
    const allSuccessful = results.every((result) => result.success)

    return NextResponse.json(
      {
        success: allSuccessful,
        message: allSuccessful ? "Database setup completed successfully" : "Database setup completed with errors",
        results,
      },
      { status: allSuccessful ? 200 : 500 },
    )
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
