import { type NextRequest, NextResponse } from "next/server"

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const storedState = request.cookies.get("oauth_state")?.value

  // Verify state to prevent CSRF attacks
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/auth/error?error=invalid_state", request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?error=no_code", request.url))
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error("Token exchange error:", error)
      return NextResponse.redirect(new URL("/auth/error?error=token_exchange", request.url))
    }

    const tokenData = await tokenResponse.json()

    // Calculate token expiration
    const expiresAt = Date.now() + tokenData.expires_in * 1000

    // Redirect to the application with tokens in URL fragment
    // This is more secure than cookies for client-side storage
    const tokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
    }

    const encodedTokens = encodeURIComponent(JSON.stringify(tokens))
    return NextResponse.redirect(new URL(`/auth/success#tokens=${encodedTokens}`, request.url))
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=server_error", request.url))
  }
}
