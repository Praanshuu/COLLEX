"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getConversations } from "@/app/actions"
import { MessageCircle } from "lucide-react"

interface Conversation {
    id: string
    otherUser: {
        name: string | null
        avatar: string | null
        clerkId: string
    }
    lastMessage?: {
        content: string
        createdAt: Date
    }
    listing?: {
        title: string
        image: string
    }
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await getConversations()
                setConversations(data as any)
            } catch (error) {
                console.error("Failed to fetch conversations", error)
            } finally {
                setLoading(false)
            }
        }

        fetchConversations()
    }, [])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Messages</h1>

                {conversations.length > 0 ? (
                    <div className="space-y-4">
                        {conversations.map((conv) => (
                            <Link href={`/messages/${conv.id}`} key={conv.id}>
                                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={conv.otherUser.avatar || ""} />
                                            <AvatarFallback>{conv.otherUser.name?.[0] || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                                                    <h3 className="font-semibold truncate text-base">{conv.otherUser.name || "User"}</h3>
                                                    {conv.listing ? (
                                                        <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 truncate max-w-[120px] w-fit">
                                                            {conv.listing.title}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 w-fit">
                                                            Roommate Match
                                                        </span>
                                                    )}
                                                </div>
                                                {conv.lastMessage && (
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                                                        {new Date(conv.lastMessage.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                                                            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {conv.listing && (
                                                    <img
                                                        src={conv.listing.image}
                                                        alt={conv.listing.title}
                                                        className="w-8 h-8 rounded object-cover border"
                                                    />
                                                )}
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conv.lastMessage?.content || "No messages yet"}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <MessageCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-lg">No messages yet</p>
                        <p className="text-sm text-muted-foreground">Start a conversation from a listing!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
