"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, MoreVertical } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ChatHeaderProps {
    otherUser: {
        clerkId: string
        name: string | null
        avatar: string | null
        phoneNumber: string | null
        isPhoneVerified: boolean
    } | null
    listing: {
        title: string
        price: number
    } | null
    onCall: () => void
}

export function ChatHeader({ otherUser, listing, onCall }: ChatHeaderProps) {
    const router = useRouter()

    return (
        <div className="p-3 border-b flex items-center gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-20 justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Link href={`/profile/${otherUser?.clerkId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                            <AvatarImage src={otherUser?.avatar || ""} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary">{otherUser?.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm md:text-base flex items-center gap-2">
                            {otherUser?.name || "Chat"}
                        </h2>
                        {listing ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>re: {listing.title}</span>
                                <span className="font-bold text-primary">• ₹{listing.price.toLocaleString("en-IN")}</span>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">Online</p>
                        )}
                    </div>
                </Link>
            </div>
            <div className="flex items-center gap-1">
                {otherUser?.phoneNumber && otherUser.isPhoneVerified && (
                    <Button variant="ghost" size="icon" onClick={onCall} className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-700">
                        <Phone className="h-5 w-5" />
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
