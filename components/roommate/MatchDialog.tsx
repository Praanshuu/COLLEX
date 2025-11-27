"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface MatchDialogProps {
    isOpen: boolean
    onClose: () => void
    matchedUserName: string
    matchedUserImage: string
    matchedUserId: string
    conversationId?: string
}

export function MatchDialog({ isOpen, onClose, matchedUserName, matchedUserImage, matchedUserId, conversationId }: MatchDialogProps) {
    const router = useRouter()

    const handleMessage = () => {
        if (conversationId) {
            router.push(`/messages/${conversationId}`)
        } else {
            // Fallback if no conversationId (shouldn't happen with new logic)
            router.push(`/messages/${matchedUserId}`)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                        <Sparkles className="h-8 w-8 text-green-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">It's a Match!</DialogTitle>
                    <DialogDescription className="text-center text-lg">
                        You and {matchedUserName} liked each other.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center py-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img src={matchedUserImage} alt={matchedUserName} className="w-full h-full object-cover" />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button onClick={handleMessage} className="w-full gap-2 text-lg py-6">
                        <MessageCircle className="h-5 w-5" />
                        Send a Message
                    </Button>
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Keep Swiping
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
