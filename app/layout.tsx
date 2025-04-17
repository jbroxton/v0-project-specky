import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/context/app-context"
import { ThemeProvider } from "@/components/theme-provider"
import { ChatProvider } from "@/context/chat-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Specky - AI Assistant for Product Managers",
  description: "Enhance your product documentation with AI-powered insights",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AppProvider>
            <ChatProvider>{children}</ChatProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'