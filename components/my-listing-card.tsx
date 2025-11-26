"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, CheckCircle, MoreVertical } from "lucide-react"
import type { Listing } from "./listing-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface MyListingCardProps {
  listing: Listing & { status?: string }
  onEdit: (listing: Listing) => void
  onDelete: (listingId: string) => void
  onMarkSold: (listingId: string) => void
}

export function MyListingCard({ listing, onEdit, onDelete, onMarkSold }: MyListingCardProps) {
  const isSold = listing.status === "SOLD"

  return (
    <Card className={cn(
      "flex flex-col sm:flex-row overflow-hidden transition-all duration-200 hover:shadow-md",
      isSold ? "opacity-75 bg-muted/50" : "bg-card"
    )}>
      {/* Image Section */}
      <div className="relative w-full sm:w-48 aspect-video sm:aspect-square shrink-0">
        <Image
          src={listing.image || "/placeholder.svg"}
          alt={listing.title}
          fill
          className={cn("object-cover", isSold && "grayscale")}
        />
        <div className="absolute top-2 left-2">
          <Badge variant={isSold ? "destructive" : "default"} className={cn(
            "backdrop-blur-sm shadow-sm",
            isSold ? "bg-red-500/90" : "bg-green-500/90 hover:bg-green-600/90"
          )}>
            {isSold ? "SOLD" : "ACTIVE"}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className={cn("font-semibold text-lg line-clamp-1", isSold && "line-through text-muted-foreground")}>
              {listing.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">Posted {listing.postedDate}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(listing)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(listing.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4">
          <p className="text-xl font-bold">₹{listing.price.toLocaleString("en-IN")}</p>

          <div className="flex gap-2">
            {!isSold && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkSold(listing.id)}
                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Sold
              </Button>
            )}
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/listing/${listing.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
