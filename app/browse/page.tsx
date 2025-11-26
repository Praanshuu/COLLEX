"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ListingCard, type Listing } from "@/components/listing-card"
import { SponsoredListings } from "@/components/sponsored-listings"
import { Search, Filter, SlidersHorizontal } from "lucide-react"
import { getListings } from "@/app/actions"
import { motion, AnimatePresence } from "framer-motion"

const categories = ["All", "Books & Notes", "Electronics", "Furniture", "PGs & Flatmates", "Vehicles & More"]

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "All"

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const data = await getListings(selectedCategory === "All" ? undefined : selectedCategory)
        setListings(data as Listing[])
      } catch (error) {
        console.error("Failed to fetch listings", error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [selectedCategory])

  const filteredAndSortedListings = listings
    .filter((listing) => {
      if (!searchQuery) return true
      return (
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-background/50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center md:text-left"
        >
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Browse Listings
          </h1>
          <p className="text-muted-foreground text-lg">Find what you need from fellow students on campus</p>
        </motion.div>

        <SponsoredListings />

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4 bg-card/30 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-white/20 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-background/50 border-white/20">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-background/50 border-white/20">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground font-medium">
            {loading ? "Loading..." : `${filteredAndSortedListings.length} listing${filteredAndSortedListings.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[350px] bg-muted/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredAndSortedListings.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredAndSortedListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-2">No listings found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </div >
  )
}
