"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UploadCloud, ScanLine, Loader2 } from "lucide-react"
import { submitVerificationRequest } from "@/app/actions"
import Tesseract from "tesseract.js"

export default function VerifyPage() {
    const router = useRouter()
    const [fileUrl, setFileUrl] = useState("")
    const [rollNumber, setRollNumber] = useState("")
    const [uploading, setUploading] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")
    const [ocrResult, setOcrResult] = useState<string | null>(null)

    const handleScan = async () => {
        if (!fileUrl) return
        setScanning(true)
        setError("")
        setOcrResult(null)

        try {
            const result = await Tesseract.recognize(
                fileUrl,
                'eng',
                { logger: m => console.log(m) }
            )

            const text = result.data.text
            console.log("OCR Text:", text)

            // Heuristic 1: Look for "Roll No" or similar keywords explicitly
            // Matches: "Roll No: 123", "Roll No. 123", "RollNo 123", etc.
            const explicitMatch = text.match(/(?:Roll|Enroll|Reg|Registration)\s*(?:No\.?|Number)?\s*[:.\-]?\s*([A-Z0-9]{5,20})/i)

            if (explicitMatch && explicitMatch[1]) {
                setRollNumber(explicitMatch[1])
                setOcrResult(`Detected from label: ${explicitMatch[1]}`)
            } else {
                // Heuristic 2: Fallback to finding the first "word" that contains digits
                // This avoids picking up text like "INDIA" or "BHILAI"
                const candidateMatch = text.match(/\b(?=[A-Z0-9]*\d)[A-Z0-9]{5,15}\b/)

                if (candidateMatch) {
                    setRollNumber(candidateMatch[0])
                    setOcrResult(`Found potential roll number: ${candidateMatch[0]}`)
                } else {
                    setOcrResult("Could not automatically detect a roll number. Please enter it manually.")
                }
            }
        } catch (err) {
            console.error("OCR Error:", err)
            setError("Failed to scan image. Please enter details manually.")
        } finally {
            setScanning(false)
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)
        setError("")

        try {
            const result = await submitVerificationRequest(fileUrl, rollNumber)

            if (result.error) {
                setError(result.message)
            } else {
                setSubmitted(true)
            }
        } catch (err) {
            console.error(err)
            setError("Something went wrong")
        } finally {
            setUploading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle>Verification Submitted!</CardTitle>
                        <CardDescription>
                            We have received your ID card and details. Our team will review it shortly.
                            You will be notified once your status changes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => router.push("/profile")}>
                            Back to Profile
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-md mx-auto px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Verify Your Student ID</CardTitle>
                        <CardDescription>
                            Upload a clear photo of your College ID card and enter your Roll Number.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="idCard">ID Card Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="idCard"
                                        placeholder="Paste image URL here..."
                                        value={fileUrl}
                                        onChange={(e) => setFileUrl(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleScan}
                                        disabled={!fileUrl || scanning}
                                        title="Scan for Roll Number"
                                    >
                                        {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {ocrResult && (
                                    <p className="text-xs text-blue-600 font-medium">
                                        {ocrResult}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    *Paste a direct image link and click the scan icon to auto-detect roll number.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rollNumber">Roll Number</Label>
                                <Input
                                    id="rollNumber"
                                    placeholder="Enter your University/College Roll No."
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    This must be unique. If you already have an account, please log in.
                                </p>
                            </div>

                            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                                <p className="font-medium mb-2">Guidelines:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Name and photo must be clearly visible.</li>
                                    <li>ID must be valid for the current academic year.</li>
                                    <li>Roll Number must match the ID card.</li>
                                </ul>
                            </div>

                            <Button type="submit" className="w-full" disabled={uploading || !fileUrl || !rollNumber}>
                                {uploading ? "Submitting..." : "Submit for Verification"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
