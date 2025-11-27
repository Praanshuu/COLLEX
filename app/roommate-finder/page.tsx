import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { SwipeDeck } from "@/components/roommate/SwipeDeck"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Link from "next/link"

export default async function RoommateFinderPage() {
    const { userId } = await auth()
    if (!userId) redirect("/login")

    const profile = await prisma.roommateProfile.findUnique({
        where: { userId }
    })

    if (!profile) {
        redirect("/roommate-finder/setup")
    }

    return (
        <div className="container max-w-md mx-auto py-6 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6 px-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                    Find a Roommate
                </h1>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/roommate-finder/setup">
                        <Settings className="h-6 w-6" />
                    </Link>
                </Button>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <SwipeDeck />
            </div>
        </div>
    )
}
