"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, Smile, X, FileIcon, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { uploadFile } from "@/app/actions"
import { toast } from "sonner"

interface ChatInputProps {
    onSend: (content: string, attachmentUrl?: string, attachmentType?: string) => Promise<void>
    disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [message, setMessage] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [attachment, setAttachment] = useState<{ url: string, type: string, name: string } | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSend = async () => {
        if ((!message.trim() && !attachment) || disabled || isUploading) return

        try {
            await onSend(message, attachment?.url, attachment?.type)
            setMessage("")
            setAttachment(null)
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto"
            }
        } catch (error) {
            console.error("Failed to send message", error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const result = await uploadFile(formData)
            if (result.success && result.url && result.type) {
                setAttachment({
                    url: result.url,
                    type: result.type,
                    name: file.name
                })
                toast.success("File uploaded")
            } else {
                toast.error("Upload failed")
            }
        } catch (error) {
            console.error("Upload error", error)
            toast.error("Upload failed")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prev) => prev + emojiData.emoji)
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }
    }, [message])

    return (
        <div className="p-3 md:p-4 border-t bg-background/80 backdrop-blur-md shrink-0 z-20 sticky bottom-0">
            {attachment && (
                <div className="max-w-4xl mx-auto mb-2 flex items-center gap-2 bg-muted/50 p-2 rounded-lg w-fit">
                    {attachment.type === "IMAGE" ? (
                        <img src={attachment.url} alt="Attachment" className="h-10 w-10 object-cover rounded" />
                    ) : (
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm truncate max-w-[150px]">{attachment.name}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-background"
                        onClick={() => setAttachment(null)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            <div className="flex gap-2 items-end max-w-4xl mx-auto">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
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

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 shrink-0 text-muted-foreground hover:text-foreground">
                                <Smile className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none" side="top" align="end">
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                        </PopoverContent>
                    </Popover>
                </div>

                <Button
                    onClick={handleSend}
                    disabled={disabled || (!message.trim() && !attachment) || isUploading}
                    size="icon"
                    className="rounded-full h-10 w-10 shrink-0 shadow-md bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                >
                    <Send className="h-4 w-4 ml-0.5" />
                </Button>
            </div>
        </div>
    )
}
