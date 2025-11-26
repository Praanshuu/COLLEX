import { getPublicUserProfile, getUserListingsById } from "@/app/actions"
import { ListingCard } from "@/components/listing-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, XCircle, MapPin, Calendar } from "lucide-react"
import { notFound } from "next/navigation"

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getPublicUserProfile(id)
    const listings = await getUserListingsById(id)

    if (!user) {
        notFound()
    }

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified Student</Badge>
            case "PENDING":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="w-3 h-3 mr-1" /> Verification Pending</Badge>
            case "REJECTED":
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Verification Rejected</Badge>
            default:
                return <Badge variant="outline" className="text-muted-foreground">Unverified</Badge>
        }
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Header */}
                <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                    <CardContent className="pt-8 pb-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                                <AvatarImage src={user.avatar || ""} className="object-cover" />
                                <AvatarFallback className="text-4xl">{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center md:text-left space-y-3">
                                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-3xl font-bold">{user.name}</h1>
                                    {getVerificationBadge(user.verificationStatus)}
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground">
                                    {user.collegeName && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{user.collegeName}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {user.bio && (
                                    <p className="text-muted-foreground max-w-2xl mx-auto md:mx-0 pt-2">
                                        {user.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">About</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Course</p>
                                    <p className="font-medium">{user.course || "Not specified"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
                                    <p className="font-medium capitalize">{user.verificationStatus.toLowerCase()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Listings Grid */}
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold mb-6">Listings by {user.name}</h2>
                        {listings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {listings.map((listing) => (
                                    <ListingCard key={listing.id} listing={listing as any} />
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-muted/30 border-dashed">
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <p>No active listings found.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
