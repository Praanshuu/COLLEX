"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getUserProfile, updateUserProfile, updatePhoneNumber, sendOtp, verifyOtp } from "@/app/actions"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function EditProfilePage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        collegeName: "",
        rollNumber: "",
        fatherName: "",
        admissionNumber: "",
        enrollmentNumber: "",
        course: "",
        validYear: "",
        avatar: "",
        email: "",
    })
    const [phoneNumber, setPhoneNumber] = useState("")
    const [isPhoneVerified, setIsPhoneVerified] = useState(false)
    const [otp, setOtp] = useState("")
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [otpLoading, setOtpLoading] = useState(false)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = await getUserProfile()
                if (user) {
                    setFormData({
                        name: user.name || "",
                        bio: user.bio || "",
                        collegeName: user.collegeName || "",
                        rollNumber: user.rollNumber || "",
                        fatherName: user.fatherName || "",
                        admissionNumber: user.admissionNumber || "",
                        enrollmentNumber: user.enrollmentNumber || "",
                        course: user.course || "",
                        validYear: user.validYear || "",
                        avatar: user.avatar || "",
                        email: user.email || "",
                    })
                    setPhoneNumber(user.phoneNumber || "")
                    setIsPhoneVerified(user.isPhoneVerified || false)
                }
            } catch (err) {
                console.error("Failed to fetch profile", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number")
            return
        }
        setOtpLoading(true)
        try {
            // First save the number
            await updatePhoneNumber(phoneNumber)

            // Then send OTP
            const res = await sendOtp(phoneNumber)
            if (!res.error) {
                setShowOtpInput(true)
                toast.success("OTP sent! (Use 123456)")
            } else {
                toast.error(res.message)
            }
        } catch (e) {
            toast.error("Failed to send OTP")
        } finally {
            setOtpLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (!otp) return
        setOtpLoading(true)
        try {
            const res = await verifyOtp(phoneNumber, otp)
            if (!res.error) {
                setIsPhoneVerified(true)
                setShowOtpInput(false)
                toast.success("Phone verified successfully!")
            } else {
                toast.error(res.message)
            }
        } catch (e) {
            toast.error("Verification failed")
        } finally {
            setOtpLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSaving(true)

        try {
            const data = new FormData()
            data.append("name", formData.name)
            data.append("bio", formData.bio)
            data.append("collegeName", formData.collegeName)
            data.append("rollNumber", formData.rollNumber)
            data.append("fatherName", formData.fatherName)
            data.append("admissionNumber", formData.admissionNumber)
            data.append("enrollmentNumber", formData.enrollmentNumber)
            data.append("course", formData.course)
            data.append("validYear", formData.validYear)
            data.append("avatar", formData.avatar)
            data.append("email", formData.email)

            const result = await updateUserProfile(null, data)

            if (result?.error) {
                setError(result.message)
            } else {
                // Also update phone if changed and not verified (though handleSendOtp handles this mostly)
                if (phoneNumber && !isPhoneVerified && !showOtpInput) {
                    await updatePhoneNumber(phoneNumber)
                }

                router.push("/profile")
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            setError("Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-2xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>Update your personal and college details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Phone Verification Section */}
                            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                                <Label>Phone Number Verification</Label>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="phone" className="text-xs text-muted-foreground">Mobile Number</Label>
                                        <div className="relative">
                                            <Input
                                                id="phone"
                                                value={phoneNumber}
                                                onChange={(e) => {
                                                    setPhoneNumber(e.target.value)
                                                    if (isPhoneVerified) setIsPhoneVerified(false) // Reset if changed
                                                }}
                                                placeholder="Enter 10-digit number"
                                                disabled={showOtpInput || isPhoneVerified}
                                            />
                                            {isPhoneVerified && (
                                                <CheckCircle2 className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                    {!isPhoneVerified && !showOtpInput && (
                                        <Button type="button" onClick={handleSendOtp} disabled={otpLoading || !phoneNumber}>
                                            {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                                        </Button>
                                    )}
                                </div>

                                {showOtpInput && (
                                    <div className="flex gap-2 items-end animate-in fade-in slide-in-from-top-2">
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="otp" className="text-xs text-muted-foreground">Enter OTP (123456)</Label>
                                            <Input
                                                id="otp"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="6-digit OTP"
                                            />
                                        </div>
                                        <Button type="button" onClick={handleVerifyOtp} disabled={otpLoading || !otp}>
                                            {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit OTP"}
                                        </Button>
                                        <Button type="button" variant="ghost" onClick={() => setShowOtpInput(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell us about yourself..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="avatar">Profile Image URL</Label>
                                    <Input
                                        id="avatar"
                                        placeholder="https://..."
                                        value={formData.avatar}
                                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="collegeName">College Name</Label>
                                <Input
                                    id="collegeName"
                                    placeholder="e.g. IIT Delhi"
                                    value={formData.collegeName}
                                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rollNumber">Roll Number / College ID</Label>
                                <Input
                                    id="rollNumber"
                                    placeholder="e.g. 2021CS1001"
                                    value={formData.rollNumber}
                                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">This helps in verification but won't be public.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fatherName">Father's Name</Label>
                                    <Input
                                        id="fatherName"
                                        placeholder="As per ID card"
                                        value={formData.fatherName}
                                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course / Branch</Label>
                                    <Input
                                        id="course"
                                        placeholder="e.g. B.Tech CSE"
                                        value={formData.course}
                                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admissionNumber">Admission Number</Label>
                                    <Input
                                        id="admissionNumber"
                                        placeholder="Optional"
                                        value={formData.admissionNumber}
                                        onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
                                    <Input
                                        id="enrollmentNumber"
                                        placeholder="Optional"
                                        value={formData.enrollmentNumber}
                                        onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validYear">Valid Up To</Label>
                                    <Input
                                        id="validYear"
                                        placeholder="e.g. 2025"
                                        value={formData.validYear}
                                        onChange={(e) => setFormData({ ...formData, validYear: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
