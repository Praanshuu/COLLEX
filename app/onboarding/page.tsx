"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { completeOnboarding } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, GraduationCap } from "lucide-react"

export default function OnboardingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            const result = await completeOnboarding(formData)
            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success("Welcome to Collex! 🎉")
                router.push("/browse") // Redirect to browse after onboarding
            }
        } catch (error) {
            console.error("Onboarding failed", error)
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-lg shadow-xl border-primary/10">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
                    <CardDescription>
                        To ensure a safe community, we need a few details from you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rollNumber">Roll Number</Label>
                                    <Input id="rollNumber" name="rollNumber" placeholder="e.g. 21BCS1234" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="collegeName">College Name</Label>
                                <Input id="collegeName" name="collegeName" placeholder="Chandigarh University" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course</Label>
                                    <Input id="course" name="course" placeholder="B.E. CSE" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validYear">Year of Study</Label>
                                    <Select name="validYear" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1st Year">1st Year</SelectItem>
                                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                                            <SelectItem value="4th Year">4th Year</SelectItem>
                                            <SelectItem value="5th Year">5th Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                                <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+91 98765 43210" />
                                <p className="text-xs text-muted-foreground">Used for verification and contacting sellers.</p>
                            </div>
                        </div>

                        <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                "Get Started"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
