import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookOpen, Coffee } from "lucide-react"
import Link from "next/link"
import dynamic from 'next/dynamic'

// Lazy load client-only components
const FeaturedContent = dynamic(() => import("@/components/featured-content").then(mod => ({ default: mod.FeaturedContent })), {
  loading: () => <div className="h-64 bg-vintage-paper-dark/10 animate-pulse rounded-md" />
})

const FeedbackWall = dynamic(() => import("@/components/feedback-wall").then(mod => ({ default: mod.FeedbackWall })), {
  loading: () => <div className="h-64 bg-vintage-paper-dark/10 animate-pulse rounded-md" />
})

const Newsletter = dynamic(() => import("@/components/newsletter").then(mod => ({ default: mod.Newsletter })), {
  loading: () => <div className="h-32 bg-vintage-paper-dark/10 animate-pulse rounded-md" />
})

const ClientAuthButton = dynamic(() => import("@/components/client-auth-button"), {
  loading: () => <div className="h-12 w-48 bg-vintage-paper-dark/10 animate-pulse rounded-md" />
})

// Server-side data fetching
async function getAboutContent() {
  try {
    // For server-side rendering, we'd need to make this work without the session context
    // For now, return default content
    return "كاتب وحكواتي يسعى لنقل تجاربه وأفكاره من خلال الكلمات. يؤمن بأن القصص هي جسر للتواصل بين الثقافات والأجيال، وأن الكتابة هي وسيلة للتعبير عن الذات واكتشاف العالم."
  } catch (error) {
    console.error("Failed to fetch about content:", error)
    return "كاتب وحكواتي يسعى لنقل تجاربه وأفكاره من خلال الكلمات. يؤمن بأن القصص هي جسر للتواصل بين الثقافات والأجيال، وأن الكتابة هي وسيلة للتعبير عن الذات واكتشاف العالم."
  }
}

export default async function Home() {
  const aboutContent = await getAboutContent()

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 overflow-hidden border-b border-vintage-border">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="mb-6 inline-block">
              <div className="flex items-center justify-center gap-2 text-vintage-accent">
                <BookOpen className="h-8 w-8" />
                <Coffee className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-vintage-ink">مخيمر</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              منصة للقصص والحكايات والتأملات، حيث تجتمع الكلمات لتنسج عالماً من الخيال والمعرفة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ClientAuthButton />
              <Link href="/feed">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-vintage-accent text-vintage-accent hover:bg-vintage-accent/10 w-full sm:w-auto"
                >
                  ابدأ القراءة
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] opacity-5 bg-repeat"></div>
        </section>

        {/* Featured Content */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">أحدث المحتويات</h2>
            <FeaturedContent />
            <div className="mt-8 text-center">
              <Link href="/feed">
                <Button className="bg-vintage-accent hover:bg-vintage-accent/90 text-white">عرض جميع المحتويات</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 px-4 bg-vintage-paper-dark/10">
          <div className="max-w-4xl mx-auto">
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center">من هو مخيمر؟</h2>
                <div className="text-lg leading-relaxed whitespace-pre-wrap mb-6">
                  {aboutContent}
                </div>
                <div className="text-center">
                  <Link href="/about">
                    <Button
                      variant="outline"
                      className="border-vintage-accent text-vintage-accent hover:bg-vintage-accent/10"
                    >
                      المزيد عن الكاتب
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feedback Wall */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">آراء القراء</h2>
            <FeedbackWall />
            <div className="mt-8 text-center">
              <Link href="/feedback">
                <Button
                  variant="outline"
                  className="border-vintage-accent text-vintage-accent hover:bg-vintage-accent/10"
                >
                  شارك برأيك
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 px-4 bg-vintage-paper-dark/10">
          <div className="max-w-3xl mx-auto">
            <Newsletter />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
