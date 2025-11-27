"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyIdentity } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, ShieldCheck, Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerifyPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Please select an image first")
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append("image", file)

        try {
            const result = await verifyIdentity(formData)
            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success(result.message)
                if (result.verified) {
                    router.push("/browse")
                }
            }
        } catch (error) {
            console.error("Verification failed", error)
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-lg shadow-xl border-primary/10">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-2">
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Verify Your Student Identity</CardTitle>
                    <CardDescription>
                        Upload a clear photo of your College ID Card. Our AI will verify it instantly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Automated Verification</AlertTitle>
                        <AlertDescription>
                            Ensure your name and roll number are clearly visible. We match this against your profile.
                        </AlertDescription>
                    </Alert>

                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer relative overflow-hidden"
                            onClick={() => document.getElementById("id-upload")?.click()}
                        >
                            {preview ? (
                                <img src={preview} alt="ID Preview" className="w-full h-full object-contain" />
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground font-medium">Click to upload ID Card</p>
                                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG (Max 5MB)</p>
                                </>
                            )}
                            <input
                                id="id-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        {preview && (
                            <Button variant="outline" size="sm" onClick={() => { setPreview(null); setFile(null); }}>
                                Remove Image
                            </Button>
                        )}
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full text-lg py-6"
                        disabled={loading || !file}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Identity"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
