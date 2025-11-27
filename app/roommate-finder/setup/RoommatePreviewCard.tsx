import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MapPin, Briefcase, GraduationCap, IndianRupee } from "lucide-react"
import Image from "next/image"

interface RoommatePreviewCardProps {
    data: {
        name: string
        age: string
        gender: string
        occupation: string
        budget: string
        location: string
        bio: string
        tags: string
        imageUrl: string
    }
}

export function RoommatePreviewCard({ data }: RoommatePreviewCardProps) {
    const tagsArray = data.tags.split(",").map(t => t.trim()).filter(Boolean)

    return (
        <Card className="relative w-full h-[600px] overflow-hidden rounded-3xl border-0 shadow-2xl bg-black/5 backdrop-blur-sm">
            {/* Image Background */}
            <div className="absolute inset-0">
                <Image
                    src={data.imageUrl || "/placeholder-user.jpg"}
                    alt={data.name}
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-4">
                {/* Header Info */}
                <div className="space-y-1">
                    <div className="flex items-end gap-3">
                        <h2 className="text-3xl font-bold leading-none">{data.name || "Your Name"}</h2>
                        <span className="text-2xl font-medium opacity-90">{data.age || "Age"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                        {data.gender && <span>{data.gender}</span>}
                        {data.occupation && (
                            <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    {data.occupation === "Student" ? <GraduationCap className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                                    {data.occupation}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Location & Budget */}
                <div className="flex flex-wrap gap-3">
                    {data.location && (
                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                            <MapPin className="w-3 h-3 mr-1" />
                            {data.location}
                        </Badge>
                    )}
                    {data.budget && (
                        <Badge variant="secondary" className="bg-green-500/80 hover:bg-green-500/90 text-white border-0 backdrop-blur-md">
                            <IndianRupee className="w-3 h-3 mr-1" />
                            {parseInt(data.budget).toLocaleString("en-IN")}/mo
                        </Badge>
                    )}
                </div>

                {/* Bio */}
                {data.bio && (
                    <p className="text-sm text-gray-200 line-clamp-3 leading-relaxed">
                        {data.bio}
                    </p>
                )}

                {/* Tags */}
                {tagsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {tagsArray.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="border-white/40 text-white bg-black/20">
                                {tag}
                            </Badge>
                        ))}
                        {tagsArray.length > 3 && (
                            <Badge variant="outline" className="border-white/40 text-white bg-black/20">
                                +{tagsArray.length - 3} more
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}
