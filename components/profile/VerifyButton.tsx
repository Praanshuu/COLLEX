"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { User } from "@prisma/client"

interface VerifyButtonProps {
    user: Partial<User>
    className?: string
}

export function VerifyButton({ user, className }: VerifyButtonProps) {
    const router = useRouter()

    const handleVerifyClick = () => {
        // Check for required fields
        const requiredFields = [
            "name",
            "rollNumber",
            "collegeName",
            "course",
            "validYear",
            "fatherName",
            "admissionNumber",
            "enrollmentNumber"
        ]

        const missingFields = requiredFields.filter(field => !user[field as keyof typeof user])

        if (missingFields.length > 0) {
            toast.error("Please complete your profile details before verifying.", {
                description: `Missing: ${missingFields.join(", ")}`
            })
            router.push("/profile/edit")
        } else {
            router.push("/verify")
        }
    }

    return (
        <Button
            size="sm"
            onClick={handleVerifyClick}
            className={className}
        >
            {user.verificationStatus === "REJECTED" ? "Retry Verification" : "Verify Student ID"}
        </Button>
    )
}
