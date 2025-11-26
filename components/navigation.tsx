"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/my-listings", label: "My Listings" },
  { href: "/messages", label: "Messages" },
  { href: "/add-listing", label: "Add Listing" },
  { href: "/pricing", label: "Pricing" },
  { href: "/profile", label: "Profile" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-md shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 group-hover:scale-105 transition-transform">
              Collex
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                  Login
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity border-0">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Navigation (Simplified for now, can be expanded with Framer Motion later) */}
        <div className="md:hidden pb-4 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 px-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
