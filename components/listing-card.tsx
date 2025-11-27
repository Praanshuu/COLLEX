"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { MessageCircle, Rocket, Sparkles } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { promoteListing } from "@/app/actions"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export interface Listing {
  id: string
  title: string
  price: number
  category: string
  image: string
  postedBy: string
  postedDate: string
  description: string
  userId: string
  promotedUntil?: Date | string | null
  userVerificationStatus?: string
}

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const { user } = useUser()
  const [promoting, setPromoting] = useState(false)
  const isOwner = user?.id === listing.userId

  // Check if promoted (handle both Date object and string from JSON)
  const isPromoted = listing.promotedUntil && new Date(listing.promotedUntil) > new Date()

  const router = useRouter() // Add this hook

  const handleContactSeller = async () => {
    if (!user) {
      toast.error("Please sign in to chat")
      return
    }

    try {
      // Dynamically import to avoid circular dependencies if any, or just use the action
      const { startConversation } = await import("@/app/actions")
      const result = await startConversation(listing.userId, listing.id)

      if (!result.success) {
        toast.error(result.message || "Failed to start chat")
      } else {
        router.push(`/messages/${result.conversationId}`)
      }
    } catch (error) {
      toast.error("Failed to start chat")
    }
  }

  const handlePromote = async () => {
    setPromoting(true)
    try {
      const result = await promoteListing(listing.id)
      if (result.error) {
        toast.error(result.message)
      } else {
        toast.success(result.message)
      }
    } catch (error) {
      toast.error("Failed to promote listing")
    } finally {
      setPromoting(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Link href={`/listing/${listing.id}`} className="block h-full">
        <Card className={`h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-card/50 backdrop-blur-sm flex flex-col ${isPromoted ? 'ring-2 ring-purple-500 shadow-purple-500/20' : ''}`}>
          <CardHeader className="p-0">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={listing.image || "/placeholder.svg"}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                <Badge className="bg-black/50 backdrop-blur-md hover:bg-black/70 border-0 text-white">
                  {listing.category}
                </Badge>
                {isPromoted && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg animate-pulse">
                    <Sparkles className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            <div className="flex flex-col gap-1 mb-3">
              <h3 className="font-bold text-lg line-clamp-1 text-foreground">{listing.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Link href={`/profile/${listing.userId}`} className="hover:underline hover:text-primary z-10" onClick={(e) => e.stopPropagation()}>
                  Posted by {listing.postedBy}
                </Link>
                {listing.userVerificationStatus === "VERIFIED" && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                    Verified
                  </Badge>
                )}
                <span>• {listing.postedDate}</span>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              ₹{listing.price.toLocaleString("en-IN")}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto gap-2">
            {isOwner ? (
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handlePromote()
                }}
                disabled={promoting || !!isPromoted}
                className={`w-full font-semibold group ${isPromoted ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'}`}
              >
                {isPromoted ? (
                  "Promoted"
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                    {promoting ? "Promoting..." : "Promote"}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault() // Prevent navigation when clicking the button
                  handleContactSeller()
                }}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold group"
              >
                <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Chat with Seller
              </Button>
            )}
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
