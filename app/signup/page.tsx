"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
    verificationMethod: "",
  })
  const [idCardFile, setIdCardFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validateCollegeEmail = (email: string) => {
    const eduPattern = /^[^\s@]+@[^\s@]+\.edu$/
    return eduPattern.test(email)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const maxSize = 5 * 1024 * 1024

    if (file) {
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or WebP)")
        return
      }

      if (file.size > maxSize) {
        setError("File size must be less than 5MB")
        return
      }

      setIdCardFile(file)
      setError("")
    }
  }

  const handleGoogleSignup = () => {
    alert("Google signup will be implemented with OAuth integration")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.collegeName ||
      !formData.verificationMethod
    ) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (formData.verificationMethod === "email" && !validateCollegeEmail(formData.email)) {
      setError("Please use a valid college email address ending with .edu")
      setIsLoading(false)
      return
    }

    if (formData.verificationMethod === "idcard" && !idCardFile) {
      setError("Please upload your college ID card for verification")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    setTimeout(() => {
      setIsLoading(false)
      alert("Account created successfully! (Demo only)")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Join Collex</CardTitle>
          <CardDescription>Create your account to start trading on campus</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" className="w-full mb-4 bg-transparent" onClick={handleGoogleSignup}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collegeName">College Name</Label>
              <Input
                id="collegeName"
                type="text"
                placeholder="University of California, Berkeley"
                value={formData.collegeName}
                onChange={(e) => handleInputChange("collegeName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@college.edu or personal email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationMethod">Verification Method</Label>
              <Select
                value={formData.verificationMethod}
                onValueChange={(value) => handleInputChange("verificationMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose verification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">College Email (.edu)</SelectItem>
                  <SelectItem value="idcard">College ID Card</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.verificationMethod === "email"
                  ? "Use your official college email ending with .edu"
                  : formData.verificationMethod === "idcard"
                    ? "Upload a photo of your college ID card for verification"
                    : "Select how you'd like to verify your college enrollment"}
              </p>
            </div>

            {formData.verificationMethod === "idcard" && (
              <div className="space-y-2">
                <Label htmlFor="idcard">College ID Card</Label>
                <Input
                  id="idcard"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {idCardFile && <p className="text-xs text-green-600">✓ {idCardFile.name} uploaded</p>}
                <p className="text-xs text-muted-foreground">
                  Upload a clear photo of your college ID card (JPEG, PNG, or WebP, max 5MB)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
