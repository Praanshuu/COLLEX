"use server"

import { prisma } from "@/lib/db"
import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { processVerification } from "@/lib/verification"

// --- Listing Actions ---

export async function createListing(prevState: any, formData: FormData) {
    const { userId } = await auth()

    if (!userId) {
        return { message: "You must be logged in to create a listing", error: true }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const category = formData.get("category") as string
    const imageUrl = formData.get("imageUrl") as string
    const postedBy = formData.get("postedBy") as string

    if (!title || !description || !price || !category || !imageUrl) {
        return { message: "Missing required fields", error: true }
    }

    try {
        // Check for active subscription to auto-promote
        const subscription = await prisma.userSubscription.findFirst({
            where: {
                userId,
                status: "ACTIVE",
                endDate: { gt: new Date() }
            }
        })

        const isPremium = subscription && (subscription.planId === "Pro" || subscription.planId === "Business")

        await prisma.listing.create({
            data: {
                title,
                description,
                price,
                category,
                image: imageUrl,
                postedBy: postedBy || "Anonymous Student",
                userId,
                promotedUntil: isPremium ? subscription.endDate : null
            },
        })

        revalidatePath("/browse")
        return { message: "Listing created successfully!", error: false }
    } catch (e) {
        console.error("Error creating listing: ", e)
        return { message: "Failed to create listing", error: true }
    }
}

export async function getListings(filters?: {
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
}) {
    try {
        const where: any = {}

        if (filters?.category && filters.category !== "All") {
            where.category = filters.category
        }

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
            ]
        }

        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            where.price = {}
            if (filters.minPrice !== undefined) where.price.gte = filters.minPrice
            if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice
        }

        const orderBy: any[] = [
            { promotedUntil: "desc" } // Promoted items always first
        ]

        switch (filters?.sortBy) {
            case "price-low":
                orderBy.push({ price: "asc" })
                break
            case "price-high":
                orderBy.push({ price: "desc" })
                break
            case "newest":
            default:
                orderBy.push({ createdAt: "desc" })
                break
        }

        const listings = await prisma.listing.findMany({
            where: {
                ...where,
                status: { not: "SOLD" },
            },
            include: {
                user: {
                    select: {
                        verificationStatus: true
                    }
                }
            },
            orderBy: orderBy,
        })

        return listings.map(listing => ({
            ...listing,
            userVerificationStatus: listing.user?.verificationStatus || "UNVERIFIED",
            postedDate: listing.createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            }),
        }))

    } catch (e) {
        console.error("Error fetching listings: ", e)
        return []
    }
}

export async function getListing(id: string) {
    try {
        const listing = await prisma.listing.findUnique({
            where: { id },
        })

        if (!listing) return null

        return {
            ...listing,
            postedDate: listing.createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            }),
        }
    } catch (e) {
        console.error("Error fetching listing: ", e)
        return null
    }
}

export async function getUserListings() {
    const { userId } = await auth()
    if (!userId) return []

    try {
        const listings = await prisma.listing.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return listings.map(listing => ({
            ...listing,
            postedDate: listing.createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            }),
        }))
    } catch (e) {
        console.error("Error fetching user listings: ", e)
        return []
    }
}

export async function deleteListing(listingId: string) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        })

        if (!listing) return { message: "Listing not found", error: true }
        if (listing.userId !== userId) return { message: "Unauthorized", error: true }

        await prisma.listing.delete({
            where: { id: listingId },
        })

        revalidatePath("/my-listings")
        revalidatePath("/browse")
        return { message: "Listing deleted successfully", error: false }
    } catch (e) {
        console.error("Error deleting listing: ", e)
        return { message: "Failed to delete listing", error: true }
    }
}

export async function markAsSold(listingId: string) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        })

        if (!listing) return { message: "Listing not found", error: true }
        if (listing.userId !== userId) return { message: "Unauthorized", error: true }

        await prisma.listing.update({
            where: { id: listingId },
            data: { status: "SOLD" },
        })

        revalidatePath("/my-listings")
        revalidatePath("/browse")
        return { message: "Listing marked as sold", error: false }
    } catch (e) {
        console.error("Error marking listing as sold: ", e)
        return { message: "Failed to update listing", error: true }
    }
}

// --- Roommate Finder Actions ---

// --- Roommate Finder Actions ---

export async function upsertRoommateProfile(prevState: any, formData: FormData) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    const name = formData.get("name") as string
    const age = parseInt(formData.get("age") as string)
    const gender = formData.get("gender") as string
    const budget = parseFloat(formData.get("budget") as string)
    const bio = formData.get("bio") as string
    const preferences = formData.get("preferences") as string
    const location = formData.get("location") as string
    const occupation = formData.get("occupation") as string
    const moveInDate = formData.get("moveInDate") ? new Date(formData.get("moveInDate") as string) : null

    // Handle tags (comma separated string from form)
    const tagsString = formData.get("tags") as string
    const tags = tagsString ? tagsString.split(",").map(t => t.trim()).filter(Boolean) : []

    // Handle images (JSON string of URLs from client-side upload)
    const imagesString = formData.get("images") as string
    const images = imagesString ? JSON.parse(imagesString) : []

    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress || ""

    try {
        // Ensure User record exists/is updated
        await prisma.user.upsert({
            where: { clerkId: userId },
            update: { name },
            create: {
                clerkId: userId,
                name,
                email,
                avatar: user?.imageUrl
            }
        })

        await prisma.roommateProfile.upsert({
            where: { userId },
            update: {
                name, age, gender, budget, bio, preferences,
                location, occupation, moveInDate, tags, images
            },
            create: {
                userId, name, age, gender, budget, bio, preferences,
                location, occupation, moveInDate, tags, images
            },
        })

        revalidatePath("/roommate-finder")
        return { message: "Profile updated successfully!", error: false }
    } catch (e) {
        console.error("Error creating profile: ", e)
        return { message: "Failed to create profile", error: true }
    }
}

export async function getPotentialRoommates() {
    const { userId } = await auth()
    if (!userId) return []

    try {
        // Get current user's profile to filter/sort
        const myProfile = await prisma.roommateProfile.findUnique({
            where: { userId }
        })

        if (!myProfile) return []

        // Get IDs of users already swiped on
        const swipedRecords = await prisma.swipe.findMany({
            where: { swiperId: userId },
            select: { swipedId: true }
        })
        const swipedIds = swipedRecords.map(s => s.swipedId)

        // Fetch potential matches
        // 1. Exclude self
        // 2. Exclude already swiped
        // 3. Filter by gender preference (if implemented, for now just show all or same gender logic if needed)
        // 4. Budget range (+/- 20% logic could be added here)

        const candidates = await prisma.roommateProfile.findMany({
            where: {
                userId: {
                    notIn: [userId, ...swipedIds]
                },
                // Optional: Add basic filtering here
                // gender: myProfile.gender === 'Female' ? 'Female' : undefined // Example logic
            },
            take: 20 // Fetch in batches
        })

        // Intelligent Sorting (Client-side or here)
        // Sort by:
        // 1. Location match
        // 2. Tag overlap
        // 3. Budget closeness

        const scoredCandidates = candidates.map(candidate => {
            let score = 0

            // Location match (+5)
            if (candidate.location && myProfile.location &&
                candidate.location.toLowerCase().includes(myProfile.location.toLowerCase())) {
                score += 5
            }

            // Tag overlap (+2 per tag)
            const commonTags = candidate.tags.filter(tag => myProfile.tags.includes(tag))
            score += (commonTags.length * 2)

            // Budget closeness (closer is better)
            const budgetDiff = Math.abs(candidate.budget - myProfile.budget)
            if (budgetDiff < 2000) score += 3
            else if (budgetDiff < 5000) score += 1

            return { ...candidate, score }
        })

        // Return sorted by score descending
        return scoredCandidates.sort((a, b) => b.score - a.score)

    } catch (e) {
        console.error("Error fetching profiles: ", e)
        return []
    }
}

export async function swipeProfile(targetUserId: string, direction: "RIGHT" | "LEFT" | "SUPER_LIKE") {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        // Check Daily Limit (e.g., 50 swipes per day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const swipesToday = await prisma.swipe.count({
            where: {
                swiperId: userId,
                createdAt: { gte: today }
            }
        })

        if (swipesToday >= 50) {
            return { message: "Daily swipe limit reached! Come back tomorrow.", error: true }
        }

        // Record the swipe
        await prisma.swipe.create({
            data: {
                swiperId: userId,
                swipedId: targetUserId,
                direction,
                type: direction === "SUPER_LIKE" ? "SUPER_LIKE" : "LIKE"
            }
        })

        let isMatch = false

        // Check for match if swiped RIGHT or SUPER_LIKE
        if (direction === "RIGHT" || direction === "SUPER_LIKE") {
            const otherSwipe = await prisma.swipe.findUnique({
                where: {
                    swiperId_swipedId: {
                        swiperId: targetUserId,
                        swipedId: userId
                    }
                }
            })

            if (otherSwipe && (otherSwipe.direction === "RIGHT" || otherSwipe.direction === "SUPER_LIKE")) {
                isMatch = true

                // Create a conversation automatically
                const result = await startConversation(targetUserId)

                if (result.success && result.conversationId) {
                    // Fetch names for better notifications
                    const currentUser = await prisma.user.findUnique({ where: { clerkId: userId }, select: { name: true } })
                    const targetUser = await prisma.user.findUnique({ where: { clerkId: targetUserId }, select: { name: true } })

                    const currentUserName = currentUser?.name || "Someone"
                    const targetUserName = targetUser?.name || "Someone"

                    // Create Notifications
                    await prisma.notification.createMany({
                        data: [
                            {
                                userId: userId,
                                type: "MATCH",
                                title: "It's a Match! 🎉",
                                message: `You matched with ${targetUserName}!`,
                                link: `/messages/${result.conversationId}`
                            },
                            {
                                userId: targetUserId,
                                type: "MATCH",
                                title: "It's a Match! 🎉",
                                message: `${currentUserName} liked you back!`,
                                link: `/messages/${result.conversationId}`
                            }
                        ]
                    })

                    return { isMatch: true, conversationId: result.conversationId }
                }
            } else {
                // Not a match yet, but notify the other user that they were liked
                await prisma.notification.create({
                    data: {
                        userId: targetUserId,
                        type: "LIKE",
                        title: "Someone liked you! 👀",
                        message: "Check out who's interested in being your roommate.",
                        link: `/roommate-finder/profile/${userId}`
                    }
                })
                return { isMatch: false }
            }
        }

        return { isMatch: false }
    } catch (e) {
        console.error("Error swiping profile: ", e)
        return { isMatch: false, error: true }
    }
}

export async function getRoommateProfile(targetUserId: string) {
    const { userId } = await auth()
    if (!userId) return null

    try {
        const profile = await prisma.roommateProfile.findUnique({
            where: { userId: targetUserId }
        })
        return profile
    } catch (e) {
        console.error("Error fetching roommate profile: ", e)
        return null
    }
}

export async function undoLastSwipe() {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        // Find the most recent swipe
        const lastSwipe = await prisma.swipe.findFirst({
            where: { swiperId: userId },
            orderBy: { createdAt: 'desc' }
        })

        if (!lastSwipe) {
            return { message: "No swipes to undo", error: true }
        }

        // Delete it
        await prisma.swipe.delete({
            where: { id: lastSwipe.id }
        })

        revalidatePath("/roommate-finder")
        return { message: "Undid last swipe", error: false }
    } catch (e) {
        console.error("Error undoing swipe: ", e)
        return { message: "Failed to undo", error: true }
    }
}

export async function getNotifications() {
    const { userId } = await auth()
    if (!userId) return []

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })
        return notifications
    } catch (e) {
        console.error("Error fetching notifications: ", e)
        return []
    }
}

export async function markNotificationRead(notificationId: string) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        })
        revalidatePath("/")
        return { message: "Marked as read", error: false }
    } catch (e) {
        console.error("Error marking notification read: ", e)
        return { message: "Failed to mark read", error: true }
    }
}

export async function getUserProfile() {
    const user = await currentUser()
    if (!user) return null

    try {
        // Try to find the user in our DB
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
        })

        // If not found, create them (Sync Clerk -> Prisma)
        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    clerkId: user.id,
                    email: user.emailAddresses[0].emailAddress,
                    name: `${user.firstName} ${user.lastName}`,
                    avatar: user.imageUrl,
                },
            })
        }

        return dbUser
    } catch (e) {
        console.error("Error fetching user profile: ", e)
        return null
    }
}

export async function getPublicUserProfile(clerkId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: {
                clerkId: true,
                name: true,
                avatar: true,
                bio: true,
                collegeName: true,
                course: true,
                verificationStatus: true,
                createdAt: true,
            }
        })
        return user
    } catch (e) {
        console.error("Error fetching public profile: ", e)
        return null
    }
}

export async function getUserListingsById(userId: string) {
    try {
        const listings = await prisma.listing.findMany({
            where: {
                userId,
                status: { not: "SOLD" }
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return listings.map(listing => ({
            ...listing,
            postedDate: listing.createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            }),
        }))
    } catch (e) {
        console.error("Error fetching user listings: ", e)
        return []
    }
}

// ... existing code ...

export async function updateUserProfile(prevState: any, formData: FormData) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    const bio = formData.get("bio") as string
    const name = formData.get("name") as string
    const collegeName = formData.get("collegeName") as string
    const rollNumber = formData.get("rollNumber") as string
    const fatherName = formData.get("fatherName") as string
    const admissionNumber = formData.get("admissionNumber") as string
    const enrollmentNumber = formData.get("enrollmentNumber") as string
    const course = formData.get("course") as string
    const validYear = formData.get("validYear") as string

    try {
        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                bio,
                name,
                collegeName,
                rollNumber,
                fatherName,
                admissionNumber,
                enrollmentNumber,
                course,
                validYear,
                // New fields
                ...(formData.get("avatar") && { avatar: formData.get("avatar") as string }),
                ...(formData.get("email") && { email: formData.get("email") as string }),
            },
        })

        revalidatePath("/profile")
        revalidatePath("/profile")
        return { message: "Profile updated successfully!", error: false }
    } catch (e) {
        console.error("Error updating profile: ", e)
        return { message: "Failed to update profile", error: true }
    }
}

export async function updateListing(listingId: string, formData: FormData) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const category = formData.get("category") as string
    const imageUrl = formData.get("imageUrl") as string

    try {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        })

        if (!listing) return { message: "Listing not found", error: true }
        if (listing.userId !== userId) return { message: "Unauthorized", error: true }

        await prisma.listing.update({
            where: { id: listingId },
            data: {
                title,
                description,
                price,
                category,
                image: imageUrl,
            },
        })

        revalidatePath("/my-listings")
        revalidatePath("/browse")
        revalidatePath(`/listing/${listingId}`)
        return { message: "Listing updated successfully!", error: false }
    } catch (e) {
        console.error("Error updating listing: ", e)
        return { message: "Failed to update listing", error: true }
    }
}

export async function submitVerificationRequest(imageUrl: string, rollNumber: string) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        // Fetch current user profile data for matching
        const userProfile = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                name: true,
                fatherName: true,
                admissionNumber: true,
                enrollmentNumber: true,
                course: true,
                rollNumber: true
            }
        });

        // Run automated verification logic
        console.log(`Processing verification for ${userId} with roll ${rollNumber}`)
        const verificationResult = await processVerification(userId, imageUrl, rollNumber, userProfile as any)
        console.log("Verification Result:", verificationResult)

        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                collegeIdCard: imageUrl,
                rollNumber: verificationResult.cleanedRollNumber || rollNumber, // Use cleaned if available
                verificationStatus: verificationResult.status,
                verificationScore: verificationResult.score,
                verificationData: verificationResult.data as any,
            },
        })

        revalidatePath("/profile")
        revalidatePath("/admin")

        if (verificationResult.status === 'VERIFIED') {
            return { message: "Verification successful! You are now verified.", error: false }
        } else {
            return { message: `Verification submitted. Status: ${verificationResult.status}. Pending manual review.`, error: false }
        }
    } catch (e) {
        console.error("Error submitting verification: ", e)
        return { message: "Failed to submit verification", error: true }
    }
}

// --- Admin Actions ---

export async function adminLogin(password: string) {
    // Simple hardcoded password for now. In production, use env variable.
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

    if (password === ADMIN_PASSWORD) {
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        cookieStore.set("admin_session", "true", { httpOnly: true, secure: process.env.NODE_ENV === "production" })
        return { success: true }
    }

    return { success: false }
}

// --- Subscription Actions ---

export async function subscribeToPlan(planName: string, price: number) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        // Mock payment delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Calculate end date (30 days from now)
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30)

        // Determine boosts based on plan
        let boosts = 0
        if (planName === "Pro") boosts = 5
        if (planName === "Business") boosts = 20

        // Check if user already has a subscription
        const existingSub = await prisma.userSubscription.findFirst({
            where: { userId }
        })

        if (existingSub) {
            await prisma.userSubscription.update({
                where: { id: existingSub.id },
                data: {
                    planId: planName,
                    endDate,
                    status: "ACTIVE",
                    boostsRemaining: boosts
                }
            })
        } else {
            await prisma.userSubscription.create({
                data: {
                    userId,
                    planId: planName,
                    endDate,
                    status: "ACTIVE",
                    boostsRemaining: boosts
                }
            })
        }

        // Auto-promote all existing listings if plan is Pro or Business
        if (planName === "Pro" || planName === "Business") {
            await prisma.listing.updateMany({
                where: { userId },
                data: { promotedUntil: endDate }
            })
        }

        revalidatePath("/pricing")
        revalidatePath("/profile")
        return { message: `Successfully subscribed to ${planName}!`, error: false }
    } catch (e) {
        console.error("Error subscribing: ", e)
        return { message: "Failed to subscribe", error: true }
    }
}

export async function getUserSubscription() {
    const { userId } = await auth()
    if (!userId) return null

    try {
        const sub = await prisma.userSubscription.findFirst({
            where: {
                userId,
                status: "ACTIVE",
                endDate: { gt: new Date() }
            }
        })
        return sub
    } catch (e) {
        console.error("Error fetching subscription: ", e)
        return null
    }
}

export async function promoteListing(listingId: string) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        const sub = await prisma.userSubscription.findFirst({
            where: { userId, status: "ACTIVE", endDate: { gt: new Date() } }
        })

        if (!sub || sub.boostsRemaining <= 0) {
            return { message: "No boosts remaining. Please upgrade your plan.", error: true }
        }

        const listing = await prisma.listing.findUnique({ where: { id: listingId } })
        if (!listing || listing.userId !== userId) {
            return { message: "Listing not found or unauthorized", error: true }
        }

        const promotedUntil = new Date()
        promotedUntil.setDate(promotedUntil.getDate() + 7) // 7 days boost

        await prisma.$transaction([
            prisma.listing.update({
                where: { id: listingId },
                data: { promotedUntil }
            }),
            prisma.userSubscription.update({
                where: { id: sub.id },
                data: { boostsRemaining: { decrement: 1 } }
            })
        ])

        revalidatePath("/my-listings")
        revalidatePath("/browse")
        return { message: "Listing promoted successfully!", error: false }

    } catch (e) {
        console.error("Error promoting listing: ", e)
        return { message: "Failed to promote listing", error: true }
    }
}

export async function startConversation(targetUserId: string, listingId?: string) {
    const { userId } = await auth()
    if (!userId) return { success: false, message: "Unauthorized" }

    try {
        console.log(`Starting conversation between ${userId} and ${targetUserId} for listing ${listingId}`)

        // Check if conversation already exists
        const existing = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: userId, user2Id: targetUserId, listingId: listingId || null },
                    { user1Id: targetUserId, user2Id: userId, listingId: listingId || null }
                ]
            }
        })

        if (existing) {
            console.log("Found existing conversation:", existing.id)
            return { success: true, conversationId: existing.id }
        }

        // Create new conversation
        const conversation = await prisma.conversation.create({
            data: {
                user1Id: userId,
                user2Id: targetUserId,
                listingId: listingId || null
            }
        })

        console.log("Created new conversation:", conversation.id)
        return { success: true, conversationId: conversation.id }
    } catch (e) {
        console.error("Error starting conversation: ", e)
        return { success: false, message: "Failed to start conversation" }
    }
}

export async function getConversations() {
    const { userId } = await auth()
    if (!userId) return []

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                listing: {
                    select: {
                        title: true,
                        image: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        // Fetch user details manually since we can't easily include dynamic relation
        const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
            const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id
            const otherUser = await prisma.user.findUnique({
                where: { clerkId: otherUserId },
                select: { name: true, avatar: true }
            }) || { name: "Unknown User", avatar: null }

            return {
                ...conv,
                otherUser,
                lastMessage: conv.messages[0]
            }
        }))

        return enrichedConversations
    } catch (e) {
        console.error("Error fetching conversations: ", e)
        return []
    }
}

export async function getMessages(conversationId: string) {
    const { userId } = await auth()
    if (!userId) return []

    try {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        })

        return messages
    } catch (e) {
        console.error("Error fetching messages: ", e)
        return []
    }
}

export async function sendMessage(conversationId: string, content: string) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        })

        if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
            return { message: "Unauthorized", error: true }
        }

        await prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                content
            }
        })

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        })

        revalidatePath(`/messages/${conversationId}`)
        return { message: "Message sent", error: false }
    } catch (e) {
        console.error("Error sending message: ", e)
        return { message: "Failed to send message", error: true }
    }
}

export async function updatePhoneNumber(phoneNumber: string) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    try {
        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                phoneNumber,
                isPhoneVerified: false // Reset verification on change
            }
        })

        revalidatePath("/profile")
        return { message: "Phone number updated", error: false }
    } catch (e) {
        console.error("Error updating phone number: ", e)
        return { message: "Failed to update phone number", error: true }
    }
}

export async function sendOtp(phoneNumber: string) {
    // In a real app, integrate with Twilio/Fast2SMS here.
    // For demo, we just return success.
    console.log(`Sending OTP to ${phoneNumber}: 123456`)
    return { message: "OTP sent successfully", error: false }
}

export async function verifyOtp(phoneNumber: string, otp: string) {
    const { userId } = await auth()
    if (!userId) return { message: "Unauthorized", error: true }

    if (otp === "123456") {
        try {
            await prisma.user.update({
                where: { clerkId: userId },
                data: {
                    isPhoneVerified: true
                }
            })
            revalidatePath("/profile")
            return { message: "Phone number verified!", error: false }
        } catch (e) {
            console.error("Error verifying phone: ", e)
            return { message: "Failed to update verification status", error: true }
        }
    } else {
        return { message: "Invalid OTP", error: true }
    }
}

export async function getConversationDetails(conversationId: string) {
    const { userId } = await auth()
    if (!userId) return null

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        image: true,
                        status: true
                    }
                }
            }
        })

        if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
            return null
        }

        const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id
        const otherUser = await prisma.user.findUnique({
            where: { clerkId: otherUserId },
            select: {
                clerkId: true,
                name: true,
                avatar: true,
                phoneNumber: true,
                isPhoneVerified: true
            }
        })

        return {
            otherUser,
            listing: conversation.listing
        }
    } catch (e) {
        console.error("Error fetching conversation details: ", e)
        return null
    }
}
