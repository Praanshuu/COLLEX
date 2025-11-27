"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Notifications } from "@/components/Notifications"
import { useState } from "react"

import { Home, Search, List, MessageCircle, Users, PlusCircle, CreditCard, User } from "lucide-react"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/my-listings", label: "My Listings", icon: List },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/roommate-finder", label: "Roommate Finder", icon: Users },
  { href: "/add-listing", label: "Add Listing", icon: PlusCircle },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
]

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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

          {/* Mobile Menu & Auth */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex hover:bg-primary/10 hover:text-primary">
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
                <Notifications />
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                    }
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
                  <SheetTitle className="text-left mb-6 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Menu</SheetTitle>
                  <div className="flex flex-col gap-2 flex-1">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary translate-x-1"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>

                  <div className="pt-6 mt-auto border-t space-y-4">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button variant="outline" className="w-full justify-center h-11 text-base">
                          Login
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button className="w-full justify-center h-11 text-base bg-gradient-to-r from-purple-600 to-pink-600">
                          Sign Up
                        </Button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50">
                        <UserButton
                          showName
                          appearance={{
                            elements: {
                              userButtonBox: "flex-row-reverse",
                              userButtonOuterIdentifier: "font-medium text-sm"
                            }
                          }}
                        />
                      </div>
                    </SignedIn>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
