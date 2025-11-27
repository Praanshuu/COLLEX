"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { startConversation } from "@/app/actions"

interface ChatButtonProps {
    sellerId: string
    listingId: string
}

export function ChatButton({ sellerId, listingId }: ChatButtonProps) {
    const router = useRouter()
    const { user } = useUser()

    const handleChat = async () => {
        if (!user) {
            toast.error("Please sign in to chat")
            return
        }

        if (user.id === sellerId) {
            toast.error("You cannot chat with yourself")
            return
        }

        try {
            const result = await startConversation(sellerId, listingId)
            if (!result.success) {
                if (result.code === "UNVERIFIED") {
                    toast.error(result.message, {
                        action: {
                            label: "Verify Now",
                            onClick: () => router.push("/profile")
                        }
                    })
                } else {
                    toast.error(result.message || "Failed to start chat")
                }
            } else {
                router.push(`/messages/${result.conversationId}`)
            }
        } catch (error) {
            console.error("Failed to start chat", error)
            toast.error("Failed to start chat")
        }
    }

    return (
        <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleChat}
        >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat with Seller
        </Button>
    )
}
