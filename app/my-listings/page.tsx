"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MyListingCard } from "@/components/my-listing-card"
import { Plus, Package } from "lucide-react"
import type { Listing } from "@/components/listing-card"
import { getUserListings, deleteListing, markAsSold } from "@/app/actions"

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const data = await getUserListings()
        setListings(data as Listing[])
      } catch (error) {
        console.error("Failed to fetch user listings", error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  const router = useRouter() // Add this hook

  const handleEdit = (listing: Listing) => {
    router.push(`/edit-listing/${listing.id}`)
  }

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return

    try {
      const result = await deleteListing(listingId)
      if (result.error) {
        alert(result.message)
      } else {
        setListings((prev) => prev.filter((listing) => listing.id !== listingId))
      }
    } catch (error) {
      console.error("Failed to delete listing", error)
      alert("Something went wrong")
    }
  }

  const handleMarkSold = async (listingId: string) => {
    try {
      const result = await markAsSold(listingId)
      if (result.error) {
        alert(result.message)
      } else {
        // Update local state to reflect change immediately
        setListings((prev) => prev.map(listing =>
          listing.id === listingId ? { ...listing, status: "SOLD" } : listing
        ))
      }
    } catch (error) {
      console.error("Failed to mark as sold", error)
      alert("Something went wrong")
    }
  }

  const totalValue = listings.reduce((sum, listing) => sum + listing.price, 0)
  const activeListings = listings.filter(l => (l as any).status !== "SOLD").length
  const soldListings = listings.filter(l => (l as any).status === "SOLD").length

  return (
    <div className="min-h-screen bg-background/50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Listings</h1>
            <p className="text-muted-foreground">Manage your active listings and track your sales</p>
          </div>
          <Button asChild className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
            <Link href="/add-listing">
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription>Active Listings</CardDescription>
              <CardTitle className="text-3xl">{loading ? "..." : activeListings}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Value</CardDescription>
              <CardTitle className="text-3xl">{loading ? "..." : `₹${totalValue.toLocaleString("en-IN")}`}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription>Items Sold</CardDescription>
              <CardTitle className="text-3xl">{loading ? "..." : soldListings}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[200px] bg-muted/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {listings.map((listing) => (
              <MyListingCard
                key={listing.id}
                listing={listing}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkSold={handleMarkSold}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No listings yet</CardTitle>
              <CardDescription className="mb-6">
                Start selling by creating your first listing. It's quick and easy!
              </CardDescription>
              <Button asChild>
                <Link href="/add-listing">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        {listings.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Tips to Boost Your Sales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Update your listings regularly to keep them visible</p>
              <p>• Respond quickly to interested buyers</p>
              <p>• Consider adjusting prices if items aren't selling</p>
              <p>• Add more photos to showcase your items better</p>
              <p>• Share your listings with friends and on social media</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
