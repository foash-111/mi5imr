import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EditPostClient } from "./edit-post-client"
import { getContentById } from "@/backend/lib/db"
import { getServerSession } from "next-auth"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params
  const session = await getServerSession()

  // Check authentication
  if (!session?.user?.email) {
    return (
      <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">غير مصرح</h3>
            <p className="text-muted-foreground">يجب تسجيل الدخول للوصول إلى هذه الصفحة</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  try {
    // Fetch content data
    const content = await getContentById(awaitedParams.id)
    
    if (!content) {
      return (
        <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
          <Navbar />
          <main className="flex-1 container py-8">
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">المحتوى غير موجود</h3>
              <p className="text-muted-foreground">عذراً، المحتوى الذي تبحث عنه غير موجود</p>
            </div>
          </main>
          <Footer />
        </div>
      )
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
          <Suspense fallback={<div>Loading...</div>}>
            <EditPostClient initialData={initialData} />
          </Suspense>
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error("Error in EditPostPage:", error)
    return (
      <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">حدث خطأ</h3>
            <p className="text-muted-foreground">فشل في تحميل المحتوى. يرجى المحاولة مرة أخرى لاحقاً.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
}
