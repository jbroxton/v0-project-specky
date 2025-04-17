"use client"
import { FileText } from "lucide-react"
import Link from "next/link"
import { AuthStatus } from "@/components/auth-status"

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-black">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-white" />
            <span className="text-xl font-bold text-white">Specky</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <AuthStatus />
        </div>
      </div>
    </header>
  )
}
