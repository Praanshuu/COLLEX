"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { checkOnboardingStatus } from "@/app/actions"

export function OnboardingGuard() {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const check = async () => {
            // Don't check on the onboarding page itself to avoid loops
            if (pathname === "/onboarding") return

            // Check session storage cache
            const cachedStatus = sessionStorage.getItem("onboardingStatus")
            if (cachedStatus) {
                const { isLoggedIn, isOnboarded } = JSON.parse(cachedStatus)
                if (isLoggedIn && !isOnboarded) {
                    router.push("/onboarding")
                }
                return
            }

            const status = await checkOnboardingStatus()

            // Cache the result
            sessionStorage.setItem("onboardingStatus", JSON.stringify(status))

            if (status.isLoggedIn && !status.isOnboarded) {
                router.push("/onboarding")
            }
        }
        check()
    }, [pathname, router])

    return null
}
