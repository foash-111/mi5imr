import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentDetail } from "@/components/content-detail"
import { Comments } from "@/components/comments"
import { RelatedContent } from "@/components/related-content"
import { YouMightAlsoLike } from "@/components/you-might-also-like"
import { getContentBySlug } from "@/backend/lib/db"

export default async function ContentPage({ params }: { params: { slug: string } }) {
  // Fetch content to get the ID for comments
	const awaitedParams = await params;
	const decodedSlug = decodeURIComponent(awaitedParams.slug);
  
  console.log("🔍 ContentPage - Received params:", awaitedParams, "Decoded slug:", decodedSlug)
  
  // Handle invalid slug
  if (!decodedSlug || decodedSlug === "undefined" || decodedSlug === "-") {
    console.error("❌ Invalid slug received:", decodedSlug)
    return (
      <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">المحتوى غير موجود</h1>
            <p className="text-muted-foreground">عذراً، المحتوى الذي تبحث عنه غير موجود.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  // console.log("Decoded slug in Comments:", decodedSlug);
  const content = await getContentBySlug(decodedSlug)
  const contentId = content?._id?.toString() || ""
	/* console.log("Fetched content slug page:", contentId)
	console.log("Fetched content slug page:", content) */


  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Loading content...</div>}>
              <ContentDetail slug={awaitedParams.slug} initialContent={content} />
            </Suspense>
            <Suspense fallback={<div>Loading comments...</div>}>
              <Comments slug={awaitedParams.slug} contentId={contentId} />
            </Suspense>
            <Suspense fallback={<div>Loading related content...</div>}>
              <YouMightAlsoLike contentId={contentId} currentSlug={awaitedParams.slug} />
            </Suspense>
          </div>
          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading related content...</div>}>
              <RelatedContent slug={awaitedParams.slug} contentId={contentId} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
