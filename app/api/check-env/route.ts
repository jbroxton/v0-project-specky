import { NextResponse } from "next/server"
import { validateEnv } from "@/lib/env-validation"

export function GET() {
  try {
    const { valid, missing, variables } = validateEnv()

    // Mask sensitive values for security
    const safeVariables = Object.entries(variables).reduce(
      (acc, [key, value]) => {
        acc[key] = value ? (key.includes("KEY") || key.includes("SECRET") ? "Set (hidden)" : "Set") : "Not set"
        return acc
      },
      {} as Record<string, string>,
    )

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing environment variables: ${missing.join(", ")}`,
          variables: safeVariables,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "All required environment variables are set",
      variables: safeVariables,
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
