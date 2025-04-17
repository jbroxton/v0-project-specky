import { type NextRequest, NextResponse } from "next/server"
import { testDeepInfraAPI } from "@/app/actions/chat-actions"

// Simple API route to test DeepInfra connectivity
export async function GET(request: NextRequest) {
  try {
    const result = await testDeepInfraAPI()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error testing DeepInfra API:", error)
    return NextResponse.json({ success: false, message: "Failed to test DeepInfra API" }, { status: 500 })
  }
}
