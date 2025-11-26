"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUser } from "@clerk/nextjs"
import { createListing } from "@/app/actions"

const categories = ["Books & Notes", "Electronics", "Furniture", "PGs & Flatmates", "Vehicles & More"]

export default function AddListingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "", // Changed from file upload to URL input
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (!formData.title.trim()) {
      setError("Please enter a title")
      setIsLoading(false)
      return
    }

    if (!formData.description.trim()) {
      setError("Please enter a description")
      setIsLoading(false)
      return
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError("Please enter a valid price")
      setIsLoading(false)
      return
    }

    if (!formData.category) {
      setError("Please select a category")
      setIsLoading(false)
      return
    }

    if (!formData.imageUrl.trim()) {
      // Use a default placeholder if no image URL is provided
      formData.imageUrl = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"
    }

    try {
      // Create FormData for Server Action
      const data = new FormData()
      data.append("title", formData.title)
      data.append("description", formData.description)
      data.append("price", formData.price)
      data.append("category", formData.category)
      data.append("imageUrl", formData.imageUrl)
      data.append("postedBy", user?.fullName || user?.firstName || "Student")

      // Call Server Action
      const result = await createListing(null, data)

      if (result.error) {
        setError(result.message)
      } else {
        alert("Listing created successfully!")
        router.push("/browse")
      }
    } catch (err) {
      console.error(err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create New Listing</CardTitle>
            <CardDescription>Share what you're selling or looking for with your campus community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., MacBook Pro 13-inch, Calculus Textbook, Desk Chair..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item's condition, features, and any other relevant details..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">{formData.description.length}/500 characters</p>
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      className="pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image URL Input (Temporary replacement for File Upload) */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Paste a link to an image. If empty, a default image will be used.</p>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating Listing..." : "Create Listing"}
                </Button>
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
