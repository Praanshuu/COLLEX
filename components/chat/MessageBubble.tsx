"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Check, CheckCheck } from "lucide-react"
import { motion } from "framer-motion"

interface MessageBubbleProps {
    message: {
        id: string
        content: string
        createdAt: Date
        senderId: string
    }
    isMe: boolean
    showAvatar: boolean
    otherUserAvatar?: string | null
    otherUserName?: string | null
    isLastInGroup: boolean
}

export function MessageBubble({ message, isMe, showAvatar, otherUserAvatar, otherUserName, isLastInGroup }: MessageBubbleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex gap-2 mb-1",
                isMe ? "justify-end" : "justify-start",
                isLastInGroup ? "mb-4" : ""
            )}
        >
            {!isMe && (
                <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                    {showAvatar && (
                        <Avatar className="h-8 w-8 border shadow-sm">
                            <AvatarImage src={otherUserAvatar || ""} />
                            <AvatarFallback className="text-xs">{otherUserName?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            )}

            <div className={cn(
                "max-w-[75%] sm:max-w-[70%] px-4 py-2 shadow-sm relative group text-sm md:text-base leading-relaxed break-words",
                isMe
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm"
                    : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-tl-sm"
            )}>
                <p>{message.content}</p>
                <div className={cn(
                    "flex items-center gap-1 mt-1 text-[10px]",
                    isMe ? "justify-end text-primary-foreground/70" : "justify-start text-muted-foreground"
                )}>
                    <span>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                        <CheckCheck className="w-3 h-3" />
                    )}
                </div>
            </div>
        </motion.div>
    )
}
