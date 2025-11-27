"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Check, CheckCheck, FileIcon, Download } from "lucide-react"
import { motion } from "framer-motion"

interface MessageBubbleProps {
    message: {
        id: string
        content: string | null
        createdAt: Date
        senderId: string
        attachmentUrl?: string | null
        attachmentType?: string | null
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
                {/* Attachment Display */}
                {message.attachmentUrl && (
                    <div className="mb-2">
                        {message.attachmentType === "IMAGE" ? (
                            <img
                                src={message.attachmentUrl}
                                alt="Attachment"
                                className="rounded-lg max-h-[200px] w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.attachmentUrl!, "_blank")}
                            />
                        ) : (
                            <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                    isMe ? "bg-white/20 hover:bg-white/30" : "bg-muted hover:bg-muted/80"
                                )}
                            >
                                <div className="p-2 bg-background rounded-full">
                                    <FileIcon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">Document</p>
                                    <p className="text-xs opacity-70">Click to download</p>
                                </div>
                                <Download className="h-4 w-4 opacity-70" />
                            </a>
                        )}
                    </div>
                )}

                {message.content && <p>{message.content}</p>}

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
