import { prisma } from "@/lib/db"
// Force re-validation
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { revalidatePath } from "next/cache"

// TODO: Move this to a proper Admin check (e.g., check Clerk metadata or a whitelist in DB)
const ADMIN_EMAILS = ["pranushu.sahu@gmail.com", "admin@collex.com"] // Replace with your email

async function verifyUser(userId: string, status: "VERIFIED" | "REJECTED") {
    "use server"
    await prisma.user.update({
        where: { id: userId },
        data: { verificationStatus: status },
    })
    revalidatePath("/admin")
}

export default async function AdminPage() {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin_session")

    if (!adminSession || adminSession.value !== "true") {
        redirect("/admin/login")
    }

    const pendingUsers = await prisma.user.findMany({
        where: { verificationStatus: "PENDING" },
        orderBy: { updatedAt: "desc" },
    })

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage verification requests and platform safety</p>
                    </div>
                    <Badge variant="outline" className="px-4 py-1">
                        {pendingUsers.length} Pending Requests
                    </Badge>
                </div>

                {pendingUsers.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">All caught up!</h3>
                            <p className="text-muted-foreground">No pending verification requests.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingUsers.map((user) => (
                            <Card key={user.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{user.name}</CardTitle>
                                            <CardDescription>{user.email}</CardDescription>
                                        </div>
                                        <Badge variant="secondary">Pending</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm">
                                        <p><span className="font-medium">College:</span> {user.collegeName || "N/A"}</p>
                                        <p><span className="font-medium">Roll No:</span> {user.rollNumber || "N/A"}</p>
                                    </div>
                                    {user.collegeIdCard && (
                                        <div className="aspect-video bg-muted rounded-md overflow-hidden relative group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={user.collegeIdCard}
                                                alt="ID Card"
                                                className="object-cover w-full h-full"
                                            />
                                            <a
                                                href={user.collegeIdCard}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                View Full Size
                                            </a>
                                        </div>
                                    )}

                                    {user.verificationScore !== null && (
                                        <div className="bg-slate-100 p-3 rounded-md text-xs space-y-1">
                                            <div className="flex justify-between font-medium">
                                                <span>Auto-Score:</span>
                                                <span className={user.verificationScore >= 90 ? "text-green-600" : "text-amber-600"}>
                                                    {user.verificationScore}/100
                                                </span>
                                            </div>
                                            {user.verificationData && (
                                                <details className="cursor-pointer">
                                                    <summary className="text-muted-foreground hover:text-foreground">View OCR Data</summary>
                                                    <pre className="mt-2 whitespace-pre-wrap text-[10px] bg-white p-2 rounded border">
                                                        {JSON.stringify(user.verificationData, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <form action={verifyUser.bind(null, user.id, "VERIFIED")} className="flex-1">
                                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                                            Approve
                                        </Button>
                                    </form>
                                    <form action={verifyUser.bind(null, user.id, "REJECTED")} className="flex-1">
                                        <Button type="submit" variant="destructive" className="w-full">
                                            Reject
                                        </Button>
                                    </form>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
