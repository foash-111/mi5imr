import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentDetail } from "@/components/content-detail"
import { RelatedContent } from "@/components/related-content"
import { Comments } from "@/components/comments"

export default async function ContentPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <ContentDetail slug={slug} />
          <Comments slug={slug} />
          <RelatedContent slug={slug} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
