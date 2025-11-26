"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2, Star, Zap, ShieldCheck } from "lucide-react"
import { subscribeToPlan, getUserSubscription } from "@/app/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function PricingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState<string | null>(null)
    const [currentPlan, setCurrentPlan] = useState<string | null>(null)

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const sub = await getUserSubscription()
                if (sub) {
                    setCurrentPlan(sub.planId)
                }
            } catch (error) {
                console.error("Failed to fetch subscription", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSubscription()
    }, [])

    const handleSubscribe = async (planName: string, price: string) => {
        if (currentPlan === planName) return

        setSubscribing(planName)
        try {
            // Parse price string "₹99" -> 99
            const priceValue = parseInt(price.replace(/[^0-9]/g, "")) || 0

            const result = await subscribeToPlan(planName, priceValue)

            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success(result.message)
                setCurrentPlan(planName)
                router.refresh()
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setSubscribing(null)
        }
    }

    const plans = [
        {
            name: "Free",
            price: "₹0",
            period: "/month",
            description: "For casual buying and selling",
            features: ["5 active listings", "Basic visibility", "24-hour auto-archive"],
            buttonText: "Continue with Free",
            variant: "outline" as const,
        },
        {
            name: "Pro",
            price: "₹99",
            period: "/month",
            description: "For power sellers & PG owners",
            features: ["50 active listings", "5 Featured boosts/month", "Priority placement", "Pro Seller Badge", "Analytics"],
            buttonText: "Get Pro",
            variant: "default" as const,
            popular: true,
            icon: <Zap className="w-5 h-5 text-yellow-400" />,
        },
        {
            name: "Business",
            price: "₹499",
            period: "/quarter",
            description: "For paid PGs or frequent sellers",
            features: ["Unlimited listings", "20 Featured boosts/month", "Dedicated Promoted Carousel", "Verified Business Badge", "Priority Support"],
            buttonText: "Upgrade to Business",
            variant: "secondary" as const,
            icon: <ShieldCheck className="w-5 h-5 text-purple-500" />,
        },
    ]

    const comparisonFeatures = [
        { feature: "Active Listings", free: "5", pro: "50", business: "Unlimited" },
        { feature: "Featured Boosts", free: "-", pro: "5/mo", business: "20/mo" },
        { feature: "Priority Placement", free: "-", pro: "Top 10%", business: "Carousel" },
        { feature: "Analytics", free: "-", pro: "Basic", business: "Advanced" },
        { feature: "Badges", free: "-", pro: "Pro Seller", business: "Verified Business" },
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Boost your sales. Get noticed on campus.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Promote your listings, get more views, and find buyers faster — with special student pricing.
                    </p>
                </div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {plans.map((plan) => {
                        const isCurrent = currentPlan === plan.name || (plan.name === "Free" && !currentPlan)
                        const isSubscribing = subscribing === plan.name

                        return (
                            <Card key={plan.name} className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${plan.popular ? 'border-purple-500 shadow-lg scale-105 z-10' : 'border-border/50'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" /> Most Popular
                                        </span>
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                        {plan.icon}
                                    </div>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-6 flex items-baseline">
                                        <span className="text-4xl font-extrabold">{plan.price}</span>
                                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <div className="mt-1 bg-green-100 dark:bg-green-900/30 rounded-full p-0.5">
                                                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                </div>
                                                <span className="text-sm text-foreground/80">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full font-semibold text-md h-11"
                                        variant={isCurrent ? "outline" : plan.variant}
                                        disabled={isCurrent || isSubscribing}
                                        onClick={() => handleSubscribe(plan.name, plan.price)}
                                    >
                                        {isSubscribing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : isCurrent ? (
                                            "Current Plan"
                                        ) : (
                                            plan.buttonText
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>

                {/* Comparison Table */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-10">Compare Plans</h2>
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[300px] pl-6">Feature</TableHead>
                                    <TableHead className="text-center">Free</TableHead>
                                    <TableHead className="text-center text-purple-600 font-bold">Pro</TableHead>
                                    <TableHead className="text-center">Business</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comparisonFeatures.map((row) => (
                                    <TableRow key={row.feature}>
                                        <TableCell className="font-medium pl-6">{row.feature}</TableCell>
                                        <TableCell className="text-center text-muted-foreground">{row.free}</TableCell>
                                        <TableCell className="text-center font-semibold bg-purple-50/50 dark:bg-purple-900/10">{row.pro}</TableCell>
                                        <TableCell className="text-center text-muted-foreground">{row.business}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Buyer Premium Teaser */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

                    <h2 className="text-3xl font-bold mb-4 relative z-10">Just browsing? Go Premium.</h2>
                    <p className="text-gray-300 mb-8 max-w-xl mx-auto relative z-10">
                        Get early access to deals, instant alerts, and zero platform fees for just ₹49/month.
                    </p>
                    <Button variant="secondary" size="lg" className="font-semibold relative z-10" onClick={() => handleSubscribe("Buyer Premium", "₹49")}>
                        Get Buyer Premium
                    </Button>
                </div>
            </div>
        </div>
    )
}
