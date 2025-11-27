import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    // 1. Get "Test User" (Me)
    const me = await prisma.user.findFirst({
        where: { name: "Test User" }
    })
    if (!me) throw new Error("Test User not found")

    // 2. Get "Arnav Singh"
    const arnavProfile = await prisma.roommateProfile.findFirst({
        where: { name: "Arnav Singh" }
    })
    if (!arnavProfile) throw new Error("Arnav Singh not found")

    console.log(`Me: ${me.clerkId}, Arnav: ${arnavProfile.userId}`)

    // 3. Delete my swipe on Arnav (so I can swipe again)
    await prisma.swipe.deleteMany({
        where: {
            swiperId: me.clerkId,
            swipedId: arnavProfile.userId
        }
    })
    console.log("Deleted my swipe on Arnav")

    // 4. Upsert Arnav's swipe on Me (RIGHT)
    await prisma.swipe.upsert({
        where: {
            swiperId_swipedId: {
                swiperId: arnavProfile.userId,
                swipedId: me.clerkId
            }
        },
        update: { direction: "RIGHT" },
        create: {
            swiperId: arnavProfile.userId,
            swipedId: me.clerkId,
            direction: "RIGHT"
        }
    })
    console.log("Arnav swiped RIGHT on Me")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
