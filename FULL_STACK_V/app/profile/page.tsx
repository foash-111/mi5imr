"use client"

import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { UserProfile } from "@/components/user-profile"
import { Loading } from "@/components/ui/loading"

export default function ProfilePage() {
  const { status } = useSession()

  // Show loading while checking session
  if (status === "loading") {
    return <Loading variant="page" text="جاري تحميل الملف الشخصي..." />
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <UserProfile />
      </main>
      <Footer />
    </div>
  )
}
