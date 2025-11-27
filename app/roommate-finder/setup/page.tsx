"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertRoommateProfile, getUserProfile } from "@/app/actions"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Loader2, Upload } from "lucide-react"
import { RoommatePreviewCard } from "./RoommatePreviewCard"

export default function RoommateSetupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const { user } = useUser()

    // Form State for Preview
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "",
        occupation: "",
        budget: "",
        location: "",
        moveInDate: "",
        bio: "",
        tags: "",
        imageUrl: ""
    })

    useEffect(() => {
        const init = async () => {
            if (!user) return

            const profile = await getUserProfile()

            if (profile?.verificationStatus !== "VERIFIED") {
                toast.error("Please verify your identity first.", {
                    action: { label: "Verify", onClick: () => router.push("/profile") }
                })
                router.push("/profile")
                return
            }

            // Auto-fill from user profile
            setFormData(prev => ({
                ...prev,
                name: profile.name || user.fullName || "",
                imageUrl: profile.avatar || user.imageUrl || ""
            }))

            setLoading(false)
        }

        init()
    }, [user, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const submitData = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'images') return // Skip manual images handling
            submitData.append(key, value)
        })

        // Handle images array structure
        const images = formData.imageUrl ? [formData.imageUrl] : []
        submitData.set("images", JSON.stringify(images))

        const result = await upsertRoommateProfile(null, submitData)

        if (result.error) {
            toast.error(result.message)
            setLoading(false)
        } else {
            toast.success("Profile updated!")
            router.push("/roommate-finder")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Left Column: Form */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Create Your Profile</h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Tell us about yourself to find the perfect roommate match.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                Basic Info
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} required placeholder="21" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select name="gender" value={formData.gender} onValueChange={(val) => handleSelectChange("gender", val)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
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
                                    <Select name="occupation" value={formData.occupation} onValueChange={(val) => handleSelectChange("occupation", val)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Student">Student</SelectItem>
                                            <SelectItem value="Working Professional">Professional</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                Preferences
                            </h2>

                            <div className="space-y-2">
                                <Label htmlFor="budget">Max Budget (₹/month)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                    <Input id="budget" name="budget" type="number" className="pl-7" value={formData.budget} onChange={handleChange} required placeholder="15000" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Preferred Location</Label>
                                <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. North Campus, Koramangala" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="moveInDate">Move-in Date</Label>
                                <Input id="moveInDate" name="moveInDate" type="date" value={formData.moveInDate} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                                About You
                            </h2>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} required placeholder="Tell us about your lifestyle, habits, and what you're looking for..." className="h-32 resize-none" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="Night Owl, Gamer, Non-smoker, Pet friendly" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Profile Photo URL</Label>
                                <div className="flex gap-2">
                                    <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
                                    <Button type="button" variant="outline" size="icon">
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Paste a URL for now.</p>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Save & Find Roommates
                        </Button>
                    </form>
                </div>

                {/* Right Column: Live Preview */}
                <div className="hidden lg:block sticky top-24">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-muted-foreground text-center uppercase tracking-wider text-sm">Live Preview</h3>
                        <div className="transform transition-all duration-500 hover:scale-[1.02]">
                            <RoommatePreviewCard data={formData} />
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            This is how you'll appear to others in the stack.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
