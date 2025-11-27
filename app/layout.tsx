import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Navigation } from "@/components/navigation"

import { OnboardingGuard } from "@/components/auth/OnboardingGuard"

export const metadata: Metadata = {
  title: "Collex - College Marketplace",
  description: "Buy, sell, and connect exclusively for your campus",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
          `}</style>
        </head>
        <body>
          <OnboardingGuard />
          <Navigation />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
