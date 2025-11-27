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
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="min-h-screen bg-background relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
            {/* Subtle Background - On Brand */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
            </div>

            <div className="relative z-10 w-full max-w-5xl">
                <Button
                    variant="ghost"
                    className="absolute top-0 left-0 -mt-12 md:-ml-12 md:mt-0 gap-2 hover:bg-secondary transition-colors z-20 font-medium"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Card className="overflow-hidden border border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem]">
                        <div className="flex flex-col md:flex-row h-auto md:h-[600px]">
                            {/* Image Section (40%) */}
                            <div className="relative w-full md:w-[45%] h-[400px] md:h-full group overflow-hidden bg-muted">
                                <img
                                    src={profile.images[0] || "/placeholder-user.jpg"}
                                    alt={profile.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[10%] group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                {/* Overlay Info */}
                                <div className="absolute top-6 right-6">
                                    <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-black border-0 px-4 py-1.5 text-sm font-semibold shadow-sm">
                                        ₹{profile.budget.toLocaleString()}/mo
                                    </Badge>
                                </div>

                                <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                                    <h1 className="text-4xl font-bold leading-tight mb-2 tracking-tight">{profile.name}, {profile.age}</h1>
                                    <div className="flex items-center gap-3 text-white/90 text-base font-medium">
                                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                            <Briefcase className="h-4 w-4" />
                                            <span>{profile.occupation || "Student"}</span>
                                        </div>
                                        {profile.location && (
                                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                                <MapPin className="h-4 w-4" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Section (60%) */}
                            <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col h-full bg-card">
                                <div className="flex-grow space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                                    {/* Bio */}
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                            About Me
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed text-lg font-normal">
                                            {profile.bio}
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                            Interests
                                        </h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {profile.tags.map(tag => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                    className="px-4 py-2 rounded-full text-sm font-medium border-border hover:bg-secondary transition-colors"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons - Sticky Bottom */}
                                <div className="pt-8 mt-6 border-t border-border flex justify-center gap-8">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-16 w-16 rounded-full border-2 border-muted hover:border-red-500/50 text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all hover:scale-110 shadow-sm"
                                        onClick={() => handleSwipe("LEFT")}
                                    >
                                        <X className="h-7 w-7" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-14 w-14 rounded-full border-2 border-muted hover:border-blue-500/50 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/5 transition-all hover:scale-110 shadow-sm"
                                        onClick={() => handleSwipe("SUPER_LIKE")}
                                    >
                                        <Star className="h-6 w-6 fill-current" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-16 w-16 rounded-full border-2 border-muted hover:border-green-500/50 text-muted-foreground hover:text-green-500 hover:bg-green-500/5 transition-all hover:scale-110 shadow-sm"
                                        onClick={() => handleSwipe("RIGHT")}
                                    >
                                        <Heart className="h-7 w-7 fill-current" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
