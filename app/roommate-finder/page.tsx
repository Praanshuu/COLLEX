"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Search, Filter } from "lucide-react"
import { getRoommateProfiles } from "@/app/actions"

interface RoommateProfile {
    id: string
    name: string
    age: number
    gender: string
    budget: number
    bio: string
    preferences: string | null
    createdAt: Date
}

export default function RoommateFinderPage() {
    const [profiles, setProfiles] = useState<RoommateProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        gender: "All",
        budget: "",
    })

    useEffect(() => {
        const fetchProfiles = async () => {
            setLoading(true)
            try {
                const data = await getRoommateProfiles(filters)
                setProfiles(data as RoommateProfile[])
            } catch (error) {
                console.error("Failed to fetch profiles", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfiles()
    }, [filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Find a Roommate</h1>
                        <p className="text-muted-foreground">Connect with other students looking for accommodation</p>
                    </div>
                    <Button asChild>
                        <Link href="/roommate-finder/create">
                            <User className="h-4 w-4 mr-2" />
                            Create Your Profile
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Gender Preference</Label>
                                <Select value={filters.gender} onValueChange={(value) => handleFilterChange("gender", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">Any</SelectItem>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Max Budget (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 5000"
                                    value={filters.budget}
                                    onChange={(e) => handleFilterChange("budget", e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button className="w-full" variant="outline" onClick={() => setFilters({ gender: "All", budget: "" })}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    Reset Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profiles Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[300px] bg-muted animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : profiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profiles.map((profile) => (
                            <Card key={profile.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{profile.name}</CardTitle>
                                            <CardDescription>{profile.age} years • {profile.gender}</CardDescription>
                                        </div>
                                        <Badge variant="secondary">₹{profile.budget.toLocaleString("en-IN")}/mo</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Bio</Label>
                                            <p className="text-sm mt-1">{profile.bio}</p>
                                        </div>
                                        {profile.preferences && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Preferences</Label>
                                                <p className="text-sm mt-1">{profile.preferences}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">Contact</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No profiles found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or create your own profile.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
