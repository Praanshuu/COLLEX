import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleImages = [
    "https://cdn.wallpapersafari.com/81/41/mDOY7h.jpg",
    "https://images.prismic.io/smi-blog/6c987520-81a6-4d03-acc3-2281bbb8b323_IMG_4795.jpg?auto=compress,format",
    "https://i.pinimg.com/736x/b9/b5/fb/b9b5fbe0ce482fb220303222f70fcac0.jpg",
    "https://i.pinimg.com/474x/d4/6a/7b/d46a7bb0a99bc86ab42a23a28bd2efbb.jpg",
    "https://tr.rbxcdn.com/180DAY-d4a6d1564bf7c0e65447501bdb3cc584/420/420/FaceAccessory/Webp/noFilter",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYaf1w4QgCJd6JOBTxpUyvbU6iVz6_gP2p2Q&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIkKIlweCra4rEeJZCz9xzcA9lAlinqAKj4Q&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxyWkDnYmMqDxvuzU4BvztQzer0ja_Z0ry9Q&s"
]

const users = [
    {
        name: "Aarav Patel",
        email: "aarav.patel@example.com",
        clerkId: "user_seed_001",
        age: 20,
        gender: "Male",
        budget: 8000,
        occupation: "Engineering Student",
        bio: "CS major looking for a quiet place to study. I love coding and gaming.",
        tags: ["Night Owl", "Gamer", "Clean"],
        location: "North Campus",
        listings: [
            { title: "Engineering Mathematics Textbook", price: 450, category: "Books & Notes", description: "Used but in good condition. No highlighting." },
            { title: "Scientific Calculator", price: 800, category: "Electronics", description: "Casio FX-991EX, barely used." }
        ]
    },
    {
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        clerkId: "user_seed_002",
        age: 19,
        gender: "Female",
        budget: 12000,
        occupation: "Medical Student",
        bio: "Med student, very organized and clean. Looking for a female roommate.",
        tags: ["Early Riser", "Studious", "Vegetarian"],
        location: "South Campus",
        listings: [
            { title: "Anatomy Atlas", price: 1200, category: "Books & Notes", description: "Essential for 1st year MBBS." }
        ]
    },
    {
        name: "Rohan Gupta",
        email: "rohan.gupta@example.com",
        clerkId: "user_seed_003",
        age: 21,
        gender: "Male",
        budget: 6000,
        occupation: "Arts Student",
        bio: "Musician and artist. I play guitar and love jamming. Chill vibes only.",
        tags: ["Musician", "Pet Friendly", "Social"],
        location: "Civil Lines",
        listings: [
            { title: "Acoustic Guitar", price: 3500, category: "Vehicles & More", description: "Yamaha F310, great for beginners." }
        ]
    },
    {
        name: "Sneha Reddy",
        email: "sneha.reddy@example.com",
        clerkId: "user_seed_004",
        age: 22,
        gender: "Female",
        budget: 15000,
        occupation: "MBA Student",
        bio: "Final year MBA. Busy with internships. Need a hassle-free living space.",
        tags: ["Professional", "Quiet", "Non-smoker"],
        location: "Cyber City",
        listings: []
    },
    {
        name: "Vikram Singh",
        email: "vikram.singh@example.com",
        clerkId: "user_seed_005",
        age: 20,
        gender: "Male",
        budget: 5000,
        occupation: "B.Com Student",
        bio: "Love sports and fitness. Looking for a gym buddy and roommate.",
        tags: ["Fitness", "Sports", "Early Riser"],
        location: "University Road",
        listings: [
            { title: "Dumbbell Set (10kg)", price: 1500, category: "Vehicles & More", description: "Cast iron dumbbells." }
        ]
    },
    {
        name: "Ananya Iyer",
        email: "ananya.iyer@example.com",
        clerkId: "user_seed_006",
        age: 19,
        gender: "Female",
        budget: 10000,
        occupation: "Design Student",
        bio: "Creative soul. I love decorating and keeping the space aesthetic.",
        tags: ["Creative", "Artistic", "Plant Lover"],
        location: "Model Town",
        listings: [
            { title: "Study Table Lamp", price: 600, category: "Furniture", description: "Modern LED lamp with adjustable brightness." }
        ]
    },
    {
        name: "Kabir Khan",
        email: "kabir.khan@example.com",
        clerkId: "user_seed_007",
        age: 23,
        gender: "Male",
        budget: 9000,
        occupation: "PhD Scholar",
        bio: "Research scholar. Mostly in the lab. Need a quiet place to sleep.",
        tags: ["Introvert", "Reader", "Clean"],
        location: "Campus Hostel",
        listings: []
    },
    {
        name: "Meera Joshi",
        email: "meera.joshi@example.com",
        clerkId: "user_seed_008",
        age: 20,
        gender: "Female",
        budget: 7500,
        occupation: "Literature Student",
        bio: "Bookworm and tea lover. Looking for a cozy apartment share.",
        tags: ["Reader", "Tea Lover", "Quiet"],
        location: "GTB Nagar",
        listings: [
            { title: "Classic Novels Collection", price: 800, category: "Books & Notes", description: "Set of 5 classics including Pride & Prejudice." }
        ]
    }
]

async function main() {
    console.log('Start seeding ...')

    for (let i = 0; i < users.length; i++) {
        const u = users[i]
        const image = sampleImages[i]

        // 1. Create User
        const user = await prisma.user.upsert({
            where: { clerkId: u.clerkId },
            update: {},
            create: {
                clerkId: u.clerkId,
                email: u.email,
                name: u.name,
                avatar: image,
                verificationStatus: "VERIFIED", // Auto-verify seed users
            },
        })

        // 2. Create Roommate Profile
        await prisma.roommateProfile.upsert({
            where: { userId: u.clerkId },
            update: {},
            create: {
                userId: u.clerkId,
                name: u.name,
                age: u.age,
                gender: u.gender,
                budget: u.budget,
                occupation: u.occupation,
                bio: u.bio,
                location: u.location,
                tags: u.tags,
                images: [image], // Use the same image for profile
            },
        })

        // 3. Create Listings
        for (const listing of u.listings) {
            await prisma.listing.create({
                data: {
                    title: listing.title,
                    description: listing.description,
                    price: listing.price,
                    category: listing.category,
                    image: "https://placehold.co/600x400?text=" + encodeURIComponent(listing.title), // Placeholder image for listings
                    postedBy: u.name,
                    userId: u.clerkId,
                    status: "ACTIVE"
                }
            })
        }

        console.log(`Created user with id: ${user.id}`)
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
