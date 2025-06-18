"use client"
import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PostForm } from "@/components/post-form"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

export default function CreatePostPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  // Check if user is authenticated and admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated" && !session?.user?.isAdmin) {
      router.push("/")
      toast({
        title: "غير مصرح",
        description: "يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة",
        variant: "destructive",
      })
    }
  }, [status, session, router, toast])

  // If not authenticated or not admin, don't render the page
  if (status !== "authenticated" || !session?.user?.isAdmin) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <PostForm mode="create" />
      </main>
      <Footer />
    </div>
  )
}
