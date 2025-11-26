"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ListingCard, type Listing } from "@/components/listing-card"
import { getListings } from "@/app/actions"
import { Sparkles } from "lucide-react"

export function SponsoredListings() {
    const [listings, setListings] = useState<Listing[]>([])

    useEffect(() => {
        const fetchPromoted = async () => {
            // Fetch all listings and filter for promoted ones client-side for now
            // Ideally, add a specific server action for this
            const allListings = await getListings()
            const promoted = allListings.filter(l => l.promotedUntil && new Date(l.promotedUntil) > new Date())
            setListings(promoted.slice(0, 4)) // Show top 4
        }
        fetchPromoted()
    }, [])

    if (listings.length === 0) return null

    return (
        <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">
                    Sponsored Listings
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map((listing, index) => (
                    <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ListingCard listing={listing} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
