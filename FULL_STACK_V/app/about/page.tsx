'use client'
import React, { Suspense, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Loading } from "@/components/ui/loading"

export default function AboutPage() {
	const [aboutContent, setAboutContent] = useState("")
	const [loading, setLoading] = useState(true)

	// Fetch about content from settings
	useEffect(() => {
		const fetchAboutContent = async () => {
			try {
				const response = await fetch("/api/settings")
				if (response.ok) {
					const data = await response.json()
					setAboutContent(
						(typeof data.about === "string"
							? data.about
							: data.about?.bio) ||
						"محتوى عن الكاتب سيتم تحديثه قريباً..."
					)
				}
			} catch (error) {
				console.error("Failed to fetch about content:", error)
				setAboutContent("محتوى عن الكاتب سيتم تحديثه قريباً...")
			} finally {
				setLoading(false)
			}
		}

		fetchAboutContent()
	}, [])

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Suspense fallback={<Loading variant="page" text="جاري التحميل..." />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">
       {/* About Section */}
        <section className="py-16 px-4 bg-vintage-paper-dark/10">
          <div className="max-w-4xl mx-auto">
            <Card className="border-vintage-border  backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center">من هو مخيمر؟</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <Loading variant="inline" text="جاري تحميل المحتوى..." />
                  </div>
                ) : (
                  <div className="text-lg leading-relaxed whitespace-pre-wrap">
                    {aboutContent}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
