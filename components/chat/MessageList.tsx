"use client"

import { useRef, useEffect } from "react"
import { MessageBubble } from "./MessageBubble"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { useChatScroll } from "@/hooks/useChatScroll"
import { AnimatePresence, motion } from "framer-motion"

interface Message {
    id: string
    senderId: string
    content: string
    createdAt: Date
}

interface MessageListProps {
    messages: Message[]
    currentUserId: string | undefined
    otherUser: {
        avatar: string | null
        name: string | null
    } | null
}

export function MessageList({ messages, currentUserId, otherUser }: MessageListProps) {
    const { scrollRef, scrollToBottom, handleScroll, showScrollButton } = useChatScroll(messages)

    // Helper to format date separators
    const getDateLabel = (date: Date) => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return "Today"
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    return (
        <div
            className="flex-1 overflow-y-auto p-4 space-y-1 scroll-smooth z-10 relative"
            ref={scrollRef}
            onScroll={handleScroll}
        >
            {messages.map((msg, index) => {
                const isMe = msg.senderId === currentUserId
                const prevMsg = messages[index - 1]
                const nextMsg = messages[index + 1]

                // Grouping logic
                const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId
                const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId

                // Date separator logic
                const showDateSeparator = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString()

                return (
                    <div key={msg.id}>
                        {showDateSeparator && (
                            <div className="flex justify-center my-6">
                                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                    {getDateLabel(new Date(msg.createdAt))}
                                </span>
                            </div>
                        )}
                        <MessageBubble
                            message={msg}
                            isMe={isMe}
                            showAvatar={!isMe && isLastInGroup}
                            otherUserAvatar={otherUser?.avatar}
                            otherUserName={otherUser?.name}
                            isLastInGroup={isLastInGroup}
                        />
                    </div>
                )
            })}

            {/* New Messages / Scroll to Bottom Button */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="sticky bottom-4 flex justify-center w-full pointer-events-none"
                    >
                        <Button
                            size="sm"
                            variant="secondary"
                            className="shadow-lg rounded-full pointer-events-auto bg-background/80 backdrop-blur border"
                            onClick={scrollToBottom}
                        >
                            <ChevronDown className="w-4 h-4 mr-1" />
                            New Messages
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
