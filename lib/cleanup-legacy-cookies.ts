"use client"

import { useEffect } from "react"
import { cookies } from "next-client-cookies"

export function useLegacyCookieCleanup() {
  useEffect(() => {
    // Remove the old anonymous_id cookie if it exists
    if (cookies.get("anonymous_id")) {
      cookies.remove("anonymous_id")
    }
  }, [])
}
