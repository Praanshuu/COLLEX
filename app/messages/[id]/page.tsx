"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMessages, sendMessage, getConversationDetails } from "@/app/actions"
import { Send, ArrowLeft, Phone } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import Link from "next/link"

interface Message {
    id: string
    senderId: string
    content: string
    createdAt: Date
}

interface OtherUser {
    clerkId: string
    name: string | null
    phoneNumber: string | null
    isPhoneVerified: boolean
}

interface Listing {
    id: string
    title: string
    price: number
    image: string
    status: string
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useUser()
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [id, setId] = useState<string>("")
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
    const [listing, setListing] = useState<Listing | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        params.then(p => setId(p.id))
    }, [params])

    const fetchMessages = async () => {
        if (!id) return
        try {
            const data = await getMessages(id)
            setMessages(data as any)
        } catch (error) {
            console.error("Failed to fetch messages", error)
        }
    }

    useEffect(() => {
        if (!id) return
        const fetchDetails = async () => {
            try {
                const details = await getConversationDetails(id)
                if (details) {
                    if (details.otherUser) setOtherUser(details.otherUser as any)
                    if (details.listing) setListing(details.listing as any)
                }
            } catch (error) {
                console.error("Failed to fetch conversation details", error)
            }
        }
        fetchDetails()
    }, [id])

    useEffect(() => {
        fetchMessages()
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000)
        return () => clearInterval(interval)
    }, [id])

    useEffect(() => {
        // Scroll to bottom on new messages
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        setSending(true)
        try {
            await sendMessage(id, newMessage)
            setNewMessage("")
            await fetchMessages() // Refresh immediately
        } catch (error) {
            console.error("Failed to send message", error)
        } finally {
            setSending(false)
        }
    }

    const handleCall = () => {
        if (otherUser?.phoneNumber && otherUser.isPhoneVerified) {
            window.location.href = `tel:${otherUser.phoneNumber}`
        } else {
            toast.error("User has not shared a verified phone number.")
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        {listing && (
                            <div className="relative w-10 h-10 rounded-md overflow-hidden border">
                                <img src={listing.image} alt={listing.title} className="object-cover w-full h-full" />
                            </div>
                        )}
                        <div>
                            <h2 className="font-semibold flex items-center gap-2">
                                {otherUser?.name || "Chat"}
                                {listing && <span className="text-xs font-normal text-muted-foreground">re: {listing.title}</span>}
                            </h2>
                            {listing && <p className="text-xs font-bold text-primary">₹{listing.price.toLocaleString("en-IN")}</p>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {otherUser && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/profile/${otherUser.clerkId}`} target="_blank">
                                View Profile
                            </Link>
                        </Button>
                    )}
                    {otherUser?.phoneNumber && otherUser.isPhoneVerified && (
                        <Button variant="outline" size="icon" onClick={handleCall} className="rounded-full bg-green-50 hover:bg-green-100 border-green-200 text-green-600">
                            <Phone className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-muted rounded-bl-none"
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
