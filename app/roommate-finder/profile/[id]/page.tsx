"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getRoommateProfile, swipeProfile } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Briefcase, Calendar, X, Heart, Star, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface RoommateProfile {
    id: string
    userId: string
    name: string
    age: number
    gender: string
    budget: number
    bio: string
    images: string[]
    location: string | null
    occupation: string | null
    tags: string[]
}

export default function RoommateProfilePage() {
    const params = useParams()
    const router = useRouter()
    const [profile, setProfile] = useState<RoommateProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!params.id) return
            try {
                const data = await getRoommateProfile(params.id as string)
                if (data) {
                    setProfile(data as any)
                } else {
                    toast.error("Profile not found")
                    router.push("/roommate-finder")
                }
            } catch (error) {
                console.error("Failed to fetch profile", error)
                toast.error("Error loading profile")
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [params.id, router])

    const handleSwipe = async (direction: "RIGHT" | "LEFT" | "SUPER_LIKE") => {
        if (!profile) return

        try {
            const result = await swipeProfile(profile.userId, direction)
            if (result.isMatch) {
                toast.success("It's a Match! 🎉")
                router.push(`/messages`)
            } else if (direction === "RIGHT" || direction === "SUPER_LIKE") {
                toast.success("Liked! We'll let them know.")
                router.push("/roommate-finder")
            } else {
                toast.info("Passed")
                router.push("/roommate-finder")
            }
        } catch (error) {
            console.error("Swipe failed", error)
            toast.error("Action failed")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-2xl mx-auto px-4">
                <Button variant="ghost" className="mb-4 gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Finder
                </Button>

                <Card className="overflow-hidden border-2 shadow-xl">
                    {/* Image Section */}
                    <div className="h-[400px] relative bg-muted">
                        {profile.images.length > 0 ? (
                            <img
                                src={profile.images[0]}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                                <span className="text-4xl">📷</span>
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 text-white">
                            <h1 className="text-4xl font-bold">{profile.name}, {profile.age}</h1>
                            <p className="text-xl opacity-90">{profile.gender}</p>
                        </div>
                    </div>

                    {/* Details Section */}
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground text-lg">
                                <Briefcase className="h-5 w-5" />
                                <span>{profile.occupation || "Student"}</span>
                            </div>
                            <div className="font-bold text-primary text-2xl">
                                ₹{profile.budget.toLocaleString()}/mo
                            </div>
                        </div>

                        {profile.location && (
                            <div className="flex items-center gap-2 text-muted-foreground text-lg">
                                <MapPin className="h-5 w-5" />
                                <span>{profile.location}</span>
                            </div>
                        )}

                        <div className="bg-muted/30 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">About Me</h3>
                            <p className="text-lg leading-relaxed">
                                {profile.bio.replace(/(\d{10})|(\S+@\S+\.\S+)/g, "********")}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Interests & Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-sm px-3 py-1 rounded-full">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-8 pt-6 border-t mt-6">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-transform hover:scale-110"
                                onClick={() => handleSwipe("LEFT")}
                            >
                                <X className="h-8 w-8" />
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-14 w-14 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-transform hover:scale-110"
                                onClick={() => handleSwipe("SUPER_LIKE")}
                            >
                                <Star className="h-6 w-6 fill-current" />
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-16 w-16 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-transform hover:scale-110"
                                onClick={() => handleSwipe("RIGHT")}
                            >
                                <Heart className="h-8 w-8 fill-current" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
