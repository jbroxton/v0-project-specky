import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get the anonymous ID from cookies
  const anonymousId = req.cookies.get("anonymous_id")?.value

  // If we have an anonymous ID, set it in the Supabase client
  if (anonymousId) {
    try {
      // Set the anonymous ID with is_local: false to make it persist across transactions
      await supabase.rpc("set_config", {
        key: "app.anonymous_id",
        value: anonymousId,
        is_local: false, // This makes it persist across transactions
      })
    } catch (error) {
      // If this fails, log the error but continue
      console.error("Error setting anonymous ID in Supabase:", error)
    }
  }

  return res
}

export const config = {
  matcher: [
    // Apply this middleware to all routes that need database access
    "/api/:path*",
    "/chat/:path*",
    "/dashboard/:path*",
  ],
}
