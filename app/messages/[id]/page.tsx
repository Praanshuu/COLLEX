"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getMessages, sendMessage, getConversationDetails } from "@/app/actions"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

// New imports for refactored components
import { ChatLayout } from "@/components/chat/ChatLayout"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"

interface Message {
    id: string
    senderId: string
    content: string
    createdAt: Date
    attachmentUrl?: string | null
    attachmentType?: string | null
}

interface OtherUser {
    clerkId: string
    name: string | null
    avatar: string | null
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
    const [sending, setSending] = useState(false)
    const [id, setId] = useState<string>("")
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
    const [listing, setListing] = useState<Listing | null>(null)

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

    const handleCall = () => {
        if (otherUser?.phoneNumber && otherUser.isPhoneVerified) {
            window.location.href = `tel:${otherUser.phoneNumber}`
        } else {
            toast.error("User has not shared a verified phone number.")
        }
    }

    return (
        <ChatLayout>
            <ChatHeader
                otherUser={otherUser}
                listing={listing}
                onCall={handleCall}
            />

            <MessageList
                messages={messages}
                currentUserId={user?.id}
                otherUser={otherUser}
            />

            <ChatInput
                onSend={async (content, attachmentUrl, attachmentType) => {
                    setSending(true)
                    try {
                        await sendMessage(id, content, attachmentUrl, attachmentType)
                        await fetchMessages()
                    } catch (error) {
                        console.error("Failed to send message", error)
                        toast.error("Failed to send message")
                    } finally {
                        setSending(false)
                    }
                }}
                disabled={sending}
            />
        </ChatLayout>
    )
}
