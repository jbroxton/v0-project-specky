import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if needed
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: [
    // Apply this middleware to all routes that need authentication
    "/dashboard/:path*",
    "/profile/:path*",
  ],
}
