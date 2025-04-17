import { NextResponse } from "next/server"
import { getCurrentProfile, createProfile, updateProfile } from "@/app/actions/profile-actions"

export async function GET() {
  try {
    // Get the current user's profile
    const { profile, error } = await getCurrentProfile()

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("Error testing profile:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const action = data.action || "create"

    if (action === "create") {
      const { profile, error } = await createProfile(data.profile)

      if (error) {
        return NextResponse.json({ success: false, error }, { status: 500 })
      }

      return NextResponse.json({ success: true, profile })
    } else if (action === "update") {
      const { success, error } = await updateProfile(data.profile)

      if (!success) {
        return NextResponse.json({ success: false, error }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error testing profile:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
