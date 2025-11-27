import { getUserProfile } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, XCircle, Clock, Edit } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getUserSubscription } from "@/app/actions"
import { Zap, ShieldCheck } from "lucide-react"
import { VerifyButton } from "@/components/profile/VerifyButton"

async function SubscriptionCard() {
  const sub = await getUserSubscription()
  const planName = sub?.planId || "Free"
  const boosts = sub?.boostsRemaining || 0

  return (
    <Card className="border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/10">
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
          {planName === "Business" ? <ShieldCheck className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          Your Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{planName}</div>
        <p className="text-xs text-muted-foreground mb-4">
          {sub ? `Active until ${sub.endDate.toLocaleDateString()}` : "Upgrade to unlock features"}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Boosts Remaining</span>
            <span className="font-bold">{boosts}</span>
          </div>

          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90" asChild>
            <Link href="/pricing">
              {sub ? "Manage Subscription" : "Upgrade Plan"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ProfilePage() {
  const user = await getUserProfile()

  if (!user) {
    redirect("/sign-in")
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
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {getVerificationBadge(user.verificationStatus)}
                </div>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile/edit">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  {(user.verificationStatus === "UNVERIFIED" || user.verificationStatus === "REJECTED") && (
                    <VerifyButton user={user} className={user.verificationStatus === "REJECTED" ? "bg-red-600 hover:bg-red-700" : ""} />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Details Section */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Phone Number</p>
                    <div className="flex items-center gap-2">
                      {user.phoneNumber ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.phoneNumber}</span>
                          {user.isPhoneVerified ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                              Unverified
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Not added</span>
                      )}
                      <Button variant="ghost" size="sm" asChild className="ml-auto">
                        <Link href="/profile/edit">
                          <Edit className="w-4 h-4 mr-2" />
                          {user.phoneNumber ? "Update" : "Add Number"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                {user.bio ? (
                  <p className="text-muted-foreground whitespace-pre-line">{user.bio}</p>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No bio added yet.</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/profile/edit">Add a bio</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>College Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">College</p>
                    <p className="font-medium">{user.collegeName || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Course</p>
                    <p className="font-medium">{user.course || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
                    <p className="font-medium">{user.rollNumber || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Father's Name</p>
                    <p className="font-medium">{user.fatherName || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admission Number</p>
                    <p className="font-medium">{user.admissionNumber || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Enrollment Number</p>
                    <p className="font-medium">{user.enrollmentNumber || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valid Up To</p>
                    <p className="font-medium">{user.validYear || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Trust Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {user.verificationStatus === "VERIFIED" ? "100%" : "20%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.verificationStatus === "VERIFIED"
                    ? "Excellent! You are a verified student."
                    : "Verify your ID to boost your trust score."}
                </p>
              </CardContent>
            </Card>

            <SubscriptionCard />
          </div>
        </div>
      </div>
    </div >
  )
}
