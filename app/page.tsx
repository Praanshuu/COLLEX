"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingBag, Users, ShieldCheck, Zap } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-background to-background dark:from-purple-900/20 dark:via-background dark:to-background" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                            Campus Marketplace <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                Reimagined.
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Buy, sell, and connect with students at your college. Safe, fast, and exclusively for your campus community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all" asChild>
                                <Link href="/browse">
                                    Start Exploring <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full border-2 hover:bg-secondary/50" asChild>
                                <Link href="/add-listing">
                                    Sell an Item
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section (Bento Grid) */}
            <section className="py-24 bg-secondary/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Collex?</h2>
                        <p className="text-muted-foreground">Everything you need to trade on campus.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1: Large Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-2 bg-card border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShoppingBag className="w-64 h-64 text-primary" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Marketplace</h3>
                                <p className="text-muted-foreground max-w-md">
                                    Buy and sell textbooks, electronics, furniture, and more. Find great deals from seniors and batchmates within your college.
                                </p>
                            </div>
                        </motion.div>

                        {/* Feature 2: Tall Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:row-span-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden"
                        >
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                                        <ShieldCheck className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Verified Users</h3>
                                    <p className="text-white/80">
                                        Every user is verified with their college ID. No scams, no strangers. Only real students.
                                    </p>
                                </div>
                                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="font-medium text-sm">Trust Score</span>
                                    </div>
                                    <div className="text-3xl font-bold">100%</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-card border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Roommate Finder</h3>
                            <p className="text-muted-foreground">
                                Looking for a flatmate? Browse profiles and find someone who matches your vibe.
                            </p>
                        </motion.div>

                        {/* Feature 4 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-card border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Instant Chat</h3>
                            <p className="text-muted-foreground">
                                Connect directly via WhatsApp with one click. No awkward emails.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}
