import { getListing } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MessageCircle, Share2, ShieldCheck, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const listing = await getListing(id)

    if (!listing) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button variant="ghost" className="mb-6" asChild>
                    <Link href="/browse">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Browse
                    </Link>
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
                            <Image
                                src={listing.image}
                                alt={listing.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-sm">
                                    {listing.category}
                                </Badge>
                                <span className="text-sm text-muted-foreground">Posted {listing.postedDate}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{listing.title}</h1>
                            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                ₹{listing.price.toLocaleString("en-IN")}
                            </p>
                        </div>

                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Posted by</p>
                                        <p className="text-lg font-bold">{listing.postedBy}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Chat with Seller
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    <span>Verified Student Seller</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Description</h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {listing.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
