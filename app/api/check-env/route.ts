import { NextResponse } from "next/server"

// Use a synchronous function for the route handler
export function GET() {
  try {
    // Create a simple object with environment variable status
    const envVars = {
      SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Not set",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "Set" : "Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET ? "Set" : "Not set",
    }

    // Check for missing variables
    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => value === "Not set")
      .map(([key]) => key)

    // Return appropriate response
    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing environment variables: ${missingVars.join(", ")}`,
          variables: envVars,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "All required environment variables are set",
      variables: envVars,
    })
  } catch (error) {
    console.error("Error checking environment variables:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
