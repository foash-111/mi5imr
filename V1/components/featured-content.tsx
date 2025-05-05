"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft, BookOpen, Music, Video, FileText, Mic } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock featured content data
const featuredContent = [
  {
    id: 1,
    title: "رحلة إلى عالم الخيال",
    excerpt: "في هذه القصة نتناول رحلة خيالية إلى عوالم لم يسبق لأحد أن زارها من قبل...",
    type: "حواديت",
    icon: BookOpen,
    image: "/novel.png?height=400&width=600",
    date: "٢٠ أبريل ٢٠٢٣",
    slug: "journey-to-imagination",
  },
  {
    id: 2,
    title: "تأملات في الحياة اليومية",
    excerpt: "مجموعة من التأملات والأفكار حول الحياة اليومية والتحديات التي نواجهها...",
    type: "تأملات",
    icon: FileText,
    image: "/people-leave.png?height=400&width=600",
    date: "١٥ أبريل ٢٠٢٣",
    slug: "daily-reflections",
  },
  {
    id: 3,
    title: "قصيدة الصباح",
    excerpt: "قصيدة تتحدث عن جمال الصباح وبداية يوم جديد مليء بالأمل والتفاؤل...",
    type: "شعر",
    icon: Music,
    image: "/patience.jpeg?height=400&width=600",
    date: "١٠ أبريل ٢٠٢٣",
    slug: "morning-poem",
  },
  {
    id: 4,
    title: "مراجعة فيلم: رحلة الروح",
    excerpt: "مراجعة نقدية لفيلم رحلة الروح الذي يتناول قضايا فلسفية عميقة...",
    type: "سينما",
    icon: Video,
    image: "/post.png?height=400&width=600",
    date: "٥ أبريل ٢٠٢٣",
    slug: "soul-journey-review",
  },
  {
    id: 5,
    title: "حلقة بودكاست: الإبداع والإلهام",
    excerpt: "في هذه الحلقة نتحدث عن مصادر الإلهام وكيفية تنمية القدرات الإبداعية...",
    type: "بودكاست",
    icon: Mic,
    image: "/podcast.png?height=400&width=600",
    date: "١ أبريل ٢٠٢٣",
    slug: "creativity-podcast",
  },
]

export function FeaturedContent() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const maxVisibleItems = 3
  const totalItems = featuredContent.length
  const containerRef = useRef<HTMLDivElement>(null)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 >= totalItems ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? totalItems - 1 : prevIndex - 1))
  }

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Get visible items based on current index
  const getVisibleItems = () => {
    const items = []
    for (let i = 0; i < maxVisibleItems; i++) {
      const index = (currentIndex + i) % totalItems
      items.push(featuredContent[index])
    }
    return items
  }

  return (
    <div className="relative">
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="border-vintage-border hover:bg-vintage-paper-dark/10"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">السابق</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="border-vintage-border hover:bg-vintage-paper-dark/10"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">التالي</span>
        </Button>
      </div>

      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getVisibleItems().map((item) => (
          <Link href={`/content/${item.slug}`} key={item.id}>
            <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md border-vintage-border  backdrop-blur-sm">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                    <item.icon className="h-3 w-3 mr-1" />
                    {item.type}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-2">{item.date}</div>
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-muted-foreground line-clamp-3">{item.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
