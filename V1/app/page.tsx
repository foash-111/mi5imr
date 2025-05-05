"use client"; // Add this directive at the very top of the file

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeaturedContent } from "@/components/featured-content";
import { FeedbackWall } from "@/components/feedback-wall";
import { Newsletter } from "@/components/newsletter";
import { BookOpen, Coffee } from "lucide-react";
import { useRouter } from "next/navigation"; // Import from next/navigation

export default function Home() {
  const router = useRouter(); // Initialize useRouter

  const redirectToAuth = () => {
    router.push("/auth/login"); // Redirect to the auth page
  };

  const redirectToFeed = () => {
    router.push("/feed"); // Redirect to the feed page
  };

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
              <Button
                size="lg"
                className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                onClick={redirectToAuth} // Redirect to auth page
              >
                تسجيل الدخول بحساب جوجل
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-vintage-accent text-vintage-accent hover:bg-vintage-accent/10"
                onClick={redirectToFeed} // Redirect to feed page
              >
                ابدأ القراءة
              </Button>
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] opacity-5 bg-repeat"></div>
        </section>

        {/* Featured Content */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">أحدث المحتويات</h2>
            <FeaturedContent />
          </div>
        </section>

        {/* About Section */}
        <section 
        id="about"
        className="py-16 px-4 bg-vintage-paper-dark/10">
          <div className="max-w-4xl mx-auto">
            <Card className="border-vintage-border  backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center">من هو مخيمر؟</h2>
                <p className="text-lg leading-relaxed mb-6">
                  كاتب وحكواتي يسعى لنقل تجاربه وأفكاره من خلال الكلمات. يؤمن بأن القصص هي جسر للتواصل بين الثقافات
                  والأجيال، وأن الكتابة هي وسيلة للتعبير عن الذات واكتشاف العالم.
                </p>
                <p className="text-lg leading-relaxed">
                  تأسست هذه المنصة لتكون مساحة للإبداع والتأمل، حيث يمكن للقراء الاستمتاع بمجموعة متنوعة من المحتويات من
                  مقالات وقصص وشعر وتأملات.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feedback Wall */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">آراء القراء</h2>
            <FeedbackWall />
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
  );
}