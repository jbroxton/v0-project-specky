import { type NextRequest, NextResponse } from "next/server"

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    // Exchange refresh token for new access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error("Token refresh error:", error)
      return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 })
    }

    const tokenData = await tokenResponse.json()

    // Calculate token expiration
    const expiresAt = Date.now() + tokenData.expires_in * 1000

    // Return new tokens
    return NextResponse.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken, // Use old refresh token if new one is not provided
      expiresAt,
    })
  } catch (error) {
    console.error("Auth refresh error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
