"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, Smile } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface ChatInputProps {
    onSend: (content: string) => Promise<void>
    disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [message, setMessage] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = async () => {
        if (!message.trim() || disabled) return
        await onSend(message)
        setMessage("")
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }
    }, [message])

    return (
        <div className="p-3 md:p-4 border-t bg-background/80 backdrop-blur-md shrink-0 z-20 sticky bottom-0">
            <div className="flex gap-2 items-end max-w-4xl mx-auto">
                <Button variant="ghost" size="icon" className="shrink-0 rounded-full text-muted-foreground hover:text-foreground">
                    <Paperclip className="h-5 w-5" />
                </Button>

                <div className="flex-1 bg-muted/50 rounded-3xl border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all flex items-center px-4 py-2">
                    <Textarea
                        ref={textareaRef}
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        rows={1}
                        className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 min-h-[24px] max-h-[120px] resize-none text-sm md:text-base"
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 shrink-0 text-muted-foreground hover:text-foreground">
                        <Smile className="h-5 w-5" />
                    </Button>
                </div>

                <Button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    size="icon"
                    className="rounded-full h-10 w-10 shrink-0 shadow-md bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                >
                    <Send className="h-4 w-4 ml-0.5" />
                </Button>
            </div>
        </div>
    )
}
