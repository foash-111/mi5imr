'use client'
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"


export default function AboutPage() {
	

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1">
       {/* About Section */}
        <section className="py-16 px-4 bg-vintage-paper-dark/10">
          <div className="max-w-4xl mx-auto">
            <Card className="border-vintage-border  backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center">من هو مخيمر؟</h2>
                <p className="text-lg leading-relaxed mb-6">
                  كاتب وحكواتي يسعى لنقل تجاربه وأفكاره من خلال الكلمات. يؤمن بأن القصص هي جسر للتواصل بين الثقافات
                  والأجيال، وأن الكتابة هي وسيلة للتعبير عن الذات واكتشاف العالم.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  تأسست هذه المنصة لتكون مساحة للإبداع والتأمل، حيث يمكن للقراء الاستمتاع بمجموعة متنوعة من المحتويات من
                  مقالات وقصص وشعر وتأملات.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
