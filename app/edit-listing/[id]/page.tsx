"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUser } from "@clerk/nextjs"
import { getListing, updateListing } from "@/app/actions"

const categories = ["Books & Notes", "Electronics", "Furniture", "PGs & Flatmates", "Vehicles & More"]

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { user } = useUser()
    const [id, setId] = useState<string>("")
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
    })
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        params.then(p => setId(p.id))
    }, [params])

    useEffect(() => {
        const fetchListing = async () => {
            if (!id) return
            try {
                const listing = await getListing(id)
                if (listing) {
                    // Check ownership (client-side check, server verifies too)
                    if (user && listing.userId !== user.id) {
                        setError("You do not have permission to edit this listing.")
                        return
                    }

                    setFormData({
                        title: listing.title,
                        description: listing.description,
                        price: listing.price.toString(),
                        category: listing.category,
                        imageUrl: listing.image,
                    })
                } else {
                    setError("Listing not found.")
                }
            } catch (err) {
                console.error("Failed to fetch listing", err)
                setError("Failed to load listing details.")
            } finally {
                setIsLoading(false)
            }
        }

        if (user && id) {
            fetchListing()
        }
    }, [id, user])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSaving(true)

        // Validation
        if (!formData.title.trim()) {
            setError("Please enter a title")
            setIsSaving(false)
            return
        }

        if (!formData.description.trim()) {
            setError("Please enter a description")
            setIsSaving(false)
            return
        }

        if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            setError("Please enter a valid price")
            setIsSaving(false)
            return
        }

        if (!formData.category) {
            setError("Please select a category")
            setIsSaving(false)
            return
        }

        try {
            const data = new FormData()
            data.append("title", formData.title)
            data.append("description", formData.description)
            data.append("price", formData.price)
            data.append("category", formData.category)
            data.append("imageUrl", formData.imageUrl)

            const result = await updateListing(id, data)

            if (result.error) {
                setError(result.message)
            } else {
                alert("Listing updated successfully!")
                router.push("/my-listings")
            }
        } catch (err) {
            console.error(err)
            setError("Something went wrong. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-2xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Edit Listing</CardTitle>
                        <CardDescription>Update details for your listing</CardDescription>
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
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    maxLength={100}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    rows={4}
                                    maxLength={500}
                                />
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

                            {/* Image URL Input */}
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                                <Input
                                    id="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button type="submit" className="flex-1" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Update Listing"}
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
