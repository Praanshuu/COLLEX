import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

const sampleListings = [
    {
        title: "RD Sharma Mathematics Class 12",
        description: "Both volumes available. Good condition, slightly highlighted.",
        price: 450,
        category: "Books & Notes",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
        postedBy: "Rahul K.",
        userId: "seed-user-1",
    },
    {
        title: "Casio FX-991EX Classwiz",
        description: "Scientific calculator, allowed in exams. 6 months old.",
        price: 800,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587145820266-a5951ee1f620?w=400&q=80",
        postedBy: "Priya S.",
        userId: "seed-user-2",
    },
    {
        title: "Study Table (Foldable)",
        description: "Wooden foldable table, perfect for laptop and writing.",
        price: 600,
        category: "Furniture",
        image: "https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=400&q=80",
        postedBy: "Amit J.",
        userId: "seed-user-3",
    },
    {
        title: "Roommate Needed - 2BHK Flat",
        description: "Looking for a male roommate. Flat near college gate. WiFi included.",
        price: 4000,
        category: "PGs & Flatmates",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80",
        postedBy: "Vikram R.",
        userId: "seed-user-4",
    },
    {
        title: "Hero Splendor Plus",
        description: "2019 Model. Good mileage. Urgent sell.",
        price: 35000,
        category: "Vehicles & More",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80",
        postedBy: "Sandeep M.",
        userId: "seed-user-5",
    },
    {
        title: "Engineering Graphics Drafter",
        description: "Omega drafter, with scale and clips. Barely used.",
        price: 300,
        category: "Books & Notes",
        image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&q=80",
        postedBy: "Neha G.",
        userId: "seed-user-6",
    },
]

export async function GET() {
    try {
        // Optional: Clear existing listings to avoid duplicates on re-seed
        // await prisma.listing.deleteMany({})

        await prisma.listing.createMany({
            data: sampleListings,
        })

        return NextResponse.json({ message: "Database seeded successfully with 6 listings (PostgreSQL)!" })
    } catch (error) {
        console.error("Error seeding database:", error)
        return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
    }
}
