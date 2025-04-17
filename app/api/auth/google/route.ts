import { type NextRequest, NextResponse } from "next/server"

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback"

// Required scopes for Google Docs and Drive
const SCOPES = [
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "profile",
  "email",
].join(" ")

export async function GET(request: NextRequest) {
  // Generate a random state value for CSRF protection
  const state = Math.random().toString(36).substring(2)

  // Store state in a cookie for verification later
  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}&access_type=offline&prompt=consent&state=${state}`,
  )

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  return response
}
