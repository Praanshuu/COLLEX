"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertRoommateProfile } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, Upload } from "lucide-react"

export default function RoommateSetupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        // Handle images - for MVP we'll just take the one URL input and make it an array
        const imageUrl = formData.get("imageUrl") as string
        const images = imageUrl ? [imageUrl] : []
        formData.set("images", JSON.stringify(images))

        const result = await upsertRoommateProfile(null, formData)

        if (result.error) {
            toast.error(result.message)
            setLoading(false)
        } else {
            toast.success("Profile updated!")
            router.push("/roommate-finder")
        }
    }

    return (
        <div className="container max-w-md mx-auto py-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">Roommate Profile</h1>
                <p className="text-muted-foreground">Let's find you a match!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Basic Info</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" required placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" name="age" type="number" required placeholder="21" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select name="gender" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Non-binary">Non-binary</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Select name="occupation" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select occupation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Working Professional">Working Professional</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Step 2: Preferences */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Preferences</h2>

                    <div className="space-y-2">
                        <Label htmlFor="budget">Max Budget (₹/month)</Label>
                        <Input id="budget" name="budget" type="number" required placeholder="15000" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Preferred Location</Label>
                        <Input id="location" name="location" placeholder="e.g. North Campus, Koramangala" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="moveInDate">Move-in Date</Label>
                        <Input id="moveInDate" name="moveInDate" type="date" />
                    </div>
                </div>

                {/* Step 3: Details */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">About You</h2>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" name="bio" required placeholder="Tell us about yourself..." className="h-24" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input id="tags" name="tags" placeholder="Night Owl, Gamer, Non-smoker, Pet friendly" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Profile Photo URL</Label>
                        <div className="flex gap-2">
                            <Input id="imageUrl" name="imageUrl" placeholder="https://..." />
                            <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Paste a URL for now.</p>
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                </Button>
            </form>
        </div>
    )
}
