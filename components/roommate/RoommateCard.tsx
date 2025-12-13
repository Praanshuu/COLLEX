"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Info, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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

interface RoommateCardProps {
    profile: RoommateProfile
    onSwipe: (direction: "RIGHT" | "LEFT" | "SUPER_LIKE") => void
}

export function RoommateCard({ profile, onSwipe }: RoommateCardProps) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

    // Super Like opacity (swiping up)
    const superLikeOpacity = useTransform(y, [0, -100], [0, 1])

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > 100) {
            onSwipe("RIGHT")
        } else if (info.offset.x < -100) {
            onSwipe("LEFT")
        } else if (info.offset.y < -100) {
            onSwipe("SUPER_LIKE")
        }
    }

    const [showDetails, setShowDetails] = useState(false)

    return (
        <>
            <motion.div
                style={{ x, y, rotate, opacity }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                className="absolute w-full max-w-md h-[600px] cursor-grab active:cursor-grabbing"
                whileTap={{ scale: 1.05 }}
            >
                <Card className="h-full overflow-hidden relative border-0 shadow-2xl rounded-3xl bg-black">
                    {/* Image Section - Full Height */}
                    <div className="h-full relative">
                        {profile.images.length > 0 ? (
                            <img
                                src={profile.images[0]}
                                alt={profile.name}
                                className="w-full h-full object-cover pointer-events-none"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                                <span className="text-6xl">📷</span>
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-3 pointer-events-none">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-4xl font-bold tracking-tight flex items-baseline gap-2">
                                        {profile.name}
                                        <span className="text-2xl font-normal opacity-80">{profile.age}</span>
                                    </h2>
                                    <p className="text-lg font-medium text-zinc-200">{profile.occupation || "Student"}</p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="rounded-full h-10 w-10 pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-md border-0 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowDetails(true)
                                    }}
                                >
                                    <Info className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                    {profile.gender}
                                </Badge>
                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                    ₹{profile.budget.toLocaleString()}/mo
                                </Badge>
                                {profile.location && (
                                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {profile.location}
                                    </Badge>
                                )}
                            </div>

                            <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                                {profile.bio.replace(/(\d{10})|(\S+@\S+\.\S+)/g, "********")}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {profile.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-xs font-medium text-zinc-400">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Swipe Indicators */}
                    <motion.div
                        style={{ opacity: useTransform(x, [20, 100], [0, 1]) }}
                        className="absolute top-10 left-6 border-4 border-green-500 text-green-500 rounded-xl px-4 py-2 text-4xl font-bold rotate-[-15deg] pointer-events-none bg-black/20 backdrop-blur-sm"
                    >
                        LIKE
                    </motion.div>
                    <motion.div
                        style={{ opacity: useTransform(x, [-20, -100], [0, 1]) }}
                        className="absolute top-10 right-6 border-4 border-red-500 text-red-500 rounded-xl px-4 py-2 text-4xl font-bold rotate-[15deg] pointer-events-none bg-black/20 backdrop-blur-sm"
                    >
                        NOPE
                    </motion.div>
                    <motion.div
                        style={{ opacity: superLikeOpacity }}
                        className="absolute bottom-32 left-1/2 -translate-x-1/2 border-4 border-blue-500 text-blue-500 rounded-xl px-4 py-2 text-4xl font-bold pointer-events-none bg-black/20 backdrop-blur-sm whitespace-nowrap"
                    >
                        SUPER LIKE
                    </motion.div>
                </Card>
            </motion.div>

            {/* Full Profile Dialog */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-md h-[80vh] overflow-y-auto p-0 gap-0 bg-zinc-950 border-zinc-800 text-white">
                    <div className="relative h-96 shrink-0">
                        <img
                            src={profile.images[0]}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white"
                            onClick={() => setShowDetails(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="p-6 space-y-6 -mt-12 relative">
                        <div>
                            <h2 className="text-3xl font-bold flex items-center gap-2">
                                {profile.name}
                                <span className="text-xl font-normal text-zinc-400">{profile.age}</span>
                            </h2>
                            <p className="text-lg text-zinc-400">{profile.occupation}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-200 border-0">
                                {profile.gender}
                            </Badge>
                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-200 border-0">
                                ₹{profile.budget.toLocaleString()}/mo
                            </Badge>
                            {profile.location && (
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-200 border-0">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {profile.location}
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">About</h3>
                            <p className="text-zinc-300 leading-relaxed">
                                {profile.bio.replace(/(\d{10})|(\S+@\S+\.\S+)/g, "********")}
                            </p>
                        </div>
                        {profile.preferences && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Preferences</h3>
                                <p className="text-zinc-300 leading-relaxed">{profile.preferences}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="border-zinc-700 text-zinc-300">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
