"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PostForm } from "@/components/post-form"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { getContentById } from "@/lib/api-client"

export default function EditPostPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<any | null>(null)

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

  // Fetch content data
  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      setError(null)
      try {
        const contentData = await getContentById(params.id)
        setContent(contentData)
      } catch (err) {
        console.error("Error fetching content:", err)
        setError("Failed to load content. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchContent()
    }
  }, [params.id, status, session])

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-vintage-accent mb-4" />
            <p className="text-muted-foreground">جاري تحميل المحتوى...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // If error, show error message
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="text-center py-16 bg-vintage-paper-dark/5 rounded-lg">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">حدث خطأ</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              العودة
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // If content not found or user not authorized
  if (!content || status !== "authenticated" || !session?.user?.isAdmin) {
    return null
  }

  // Prepare initial data for the form
  const initialData = {
    id: content._id,
    title: content.title,
    content: content.content,
    excerpt: content.excerpt,
    contentType: content.contentType,
    coverImage: content.coverImage,
    tags: content.tags,
    defaultCategories: content.categories?.map((cat: any) => cat._id) || [],
    externalUrl: content.externalUrl,
    featured: content.featured,
    published: content.published,
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <PostForm mode="edit" initialData={initialData} />
      </main>
      <Footer />
    </div>
  )
}
