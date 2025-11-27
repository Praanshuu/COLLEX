import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Starting notification test...")

    // 1. Get two users
    const users = await prisma.user.findMany({ take: 2 })
    if (users.length < 2) {
        console.error("Need at least 2 users to test matching")
        return
    }

    const user1 = users[0]
    const user2 = users[1]

    console.log(`Testing match between ${user1.name} (${user1.clerkId}) and ${user2.name} (${user2.clerkId})`)

    // 2. Clear existing swipes and notifications
    await prisma.swipe.deleteMany({
        where: {
            OR: [
                { swiperId: user1.clerkId, swipedId: user2.clerkId },
                { swiperId: user2.clerkId, swipedId: user1.clerkId }
            ]
        }
    })
    await prisma.notification.deleteMany({
        where: {
            userId: { in: [user1.clerkId, user2.clerkId] }
        }
    })
    console.log("Cleared old data")

    // 3. Simulate User 1 swipes RIGHT
    await prisma.swipe.create({
        data: {
            swiperId: user1.clerkId,
            swipedId: user2.clerkId,
            direction: "RIGHT",
            type: "LIKE"
        }
    })
    console.log("User 1 swiped RIGHT")

    // 4. Simulate User 2 swipes SUPER_LIKE (trigger match)
    // We'll call the action logic directly here to test it, but since we can't import actions easily in script without Next.js context,
    // we'll replicate the logic or just use the swipe creation and check if we can trigger the action.
    // Actually, we can't run server actions in this script easily.
    // So we will just manually create the second swipe and check if we can trigger the match logic if we were to run the action.

    // Instead, let's just create the second swipe and then manually run the match logic block to see if it works.

    await prisma.swipe.create({
        data: {
            swiperId: user2.clerkId,
            swipedId: user1.clerkId,
            direction: "SUPER_LIKE",
            type: "SUPER_LIKE"
        }
    })
    console.log("User 2 swiped SUPER_LIKE")

    // 5. Check for match (Logic from swipeProfile)
    const direction: string = "SUPER_LIKE"
    const targetUserId = user1.clerkId
    const userId = user2.clerkId

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
            console.log("Match Detected!")

            // Create Notifications
            await prisma.notification.createMany({
                data: [
                    {
                        userId: userId,
                        type: "MATCH",
                        title: "It's a Match! 🎉",
                        message: "You matched with a potential roommate!",
                        link: `/messages/${targetUserId}`
                    },
                    {
                        userId: targetUserId,
                        type: "MATCH",
                        title: "It's a Match! 🎉",
                        message: "Someone liked you back!",
                        link: `/messages/${userId}`
                    }
                ]
            })
            console.log("Notifications created")
        }
    }

    // 6. Verify Notifications
    const notifications = await prisma.notification.findMany({
        where: {
            userId: { in: [user1.clerkId, user2.clerkId] }
        }
    })

    console.log("Notifications found:", notifications.length)
    notifications.forEach(n => console.log(`- To ${n.userId}: ${n.title} (${n.message})`))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
