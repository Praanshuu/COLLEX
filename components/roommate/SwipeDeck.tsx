"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { RoommateCard } from "./RoommateCard"
import { MatchDialog } from "./MatchDialog"
import { getPotentialRoommates, swipeProfile, undoLastSwipe } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, X, Heart, Star, RotateCcw } from "lucide-react"
import { toast } from "sonner"

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
    preferences: string | null
}

export function SwipeDeck() {
    const [profiles, setProfiles] = useState<RoommateProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [match, setMatch] = useState<{ name: string; image: string; id: string; conversationId?: string } | null>(null)

    const fetchProfiles = async () => {
        setLoading(true)
        try {
            const data = await getPotentialRoommates()
            setProfiles(data as any)
        } catch (error: any) {
            console.error("Failed to fetch profiles", error)
            if (error.message === "UNVERIFIED" || error.digest?.includes("UNVERIFIED")) {
                toast.error("Please verify your identity to find roommates.", {
                    action: {
                        label: "Verify Now",
                        onClick: () => window.location.href = "/profile"
                    }
                })
            } else {
                toast.error("Failed to load profiles")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfiles()
    }, [])

    const handleSwipe = async (direction: "RIGHT" | "LEFT" | "SUPER_LIKE", profileId: string, userId: string) => {
        // Optimistically remove card
        const swipedProfile = profiles.find(p => p.id === profileId)
        setProfiles(prev => prev.filter(p => p.id !== profileId))

        try {
            const result = await swipeProfile(userId, direction)

            if (result.error) {
                toast.error(result.message)
                // Revert optimistic update
                if (swipedProfile) {
                    setProfiles(prev => [swipedProfile, ...prev])
                }
                return
            }

            if (result.isMatch && swipedProfile) {
                setMatch({
                    name: swipedProfile.name,
                    image: swipedProfile.images[0] || "/placeholder-user.jpg",
                    id: swipedProfile.userId,
                    conversationId: result.conversationId // Capture conversationId
                })
            }
        } catch (error) {
            console.error("Swipe failed", error)
            // Revert optimistic update
            if (swipedProfile) {
                setProfiles(prev => [swipedProfile, ...prev])
            }
        }
    }

    const handleUndo = async () => {
        try {
            const result = await undoLastSwipe()
            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success("Undid last swipe")
                // Refresh profiles to bring back the swiped user
                fetchProfiles()
            }
        } catch (error) {
            console.error("Undo failed", error)
            toast.error("Failed to undo")
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Finding potential roommates...</p>
            </div>
        )
    }

    if (profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-center p-6">
                <div className="text-6xl mb-4">😴</div>
                <h3 className="text-2xl font-bold mb-2">No more profiles</h3>
                <p className="text-muted-foreground mb-6">
                    You've seen everyone in your area for now. Check back later!
                </p>
                <Button onClick={fetchProfiles} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md h-[600px]">
                <AnimatePresence>
                    {profiles.map((profile, index) => (
                        // Only render the top 2 cards for performance
                        index <= 1 && (
                            <div
                                key={profile.id}
                                className="absolute inset-0"
                                style={{ zIndex: profiles.length - index }}
                            >
                                <RoommateCard
                                    profile={profile}
                                    onSwipe={(dir) => handleSwipe(dir, profile.id, profile.userId)}
                                />
                            </div>
                        )
                    ))}
                </AnimatePresence>

                {match && (
                    <MatchDialog
                        isOpen={!!match}
                        onClose={() => setMatch(null)}
                        matchedUserName={match.name}
                        matchedUserImage={match.image}
                        matchedUserId={match.id}
                        conversationId={match.conversationId}
                    />
                )}
            </div>

            <div className="flex justify-center gap-8 mt-10 items-center">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white shadow-lg border-0 text-yellow-500 hover:bg-yellow-50 hover:text-yellow-600 transition-transform hover:scale-110"
                    onClick={handleUndo}
                    disabled={loading}
                    title="Undo Last Swipe"
                >
                    <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-16 w-16 rounded-full bg-white shadow-xl border-0 text-red-500 hover:bg-red-50 hover:text-red-600 transition-transform hover:scale-110"
                    onClick={() => {
                        if (profiles.length > 0) handleSwipe("LEFT", profiles[0].id, profiles[0].userId)
                    }}
                    disabled={profiles.length === 0}
                >
                    <X className="h-8 w-8" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full bg-white shadow-lg border-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-transform hover:scale-110"
                    onClick={() => {
                        if (profiles.length > 0) handleSwipe("SUPER_LIKE", profiles[0].id, profiles[0].userId)
                    }}
                    disabled={profiles.length === 0}
                >
                    <Star className="h-6 w-6 fill-current" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-16 w-16 rounded-full bg-white shadow-xl border-0 text-green-500 hover:bg-green-50 hover:text-green-600 transition-transform hover:scale-110"
                    onClick={() => {
                        if (profiles.length > 0) handleSwipe("RIGHT", profiles[0].id, profiles[0].userId)
                    }}
                    disabled={profiles.length === 0}
                >
                    <Heart className="h-8 w-8 fill-current" />
                </Button>
            </div>
        </div>
    )
}
