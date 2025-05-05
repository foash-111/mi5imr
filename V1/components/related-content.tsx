import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Music, FileText, Mic } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock related content data
const relatedContentData = {
  "journey-to-imagination": [
    {
      id: 1,
      title: "قصيدة الخيال",
      excerpt: "قصيدة تتحدث عن قوة الخيال وتأثيره على حياتنا...",
      type: "شعر",
      icon: Music,
      image: "/creativity.jpg?height=200&width=300",
      slug: "imagination-poem",
    },
    {
      id: 2,
      title: "عوالم موازية",
      excerpt: "قصة قصيرة عن العوالم الموازية والواقع البديل...",
      type: "حواديت",
      icon: BookOpen,
      image: "/dark.jpg?height=200&width=300",
      slug: "parallel-worlds",
    },
    {
      id: 3,
      title: "الإبداع والخيال",
      excerpt: "مقال يناقش العلاقة بين الإبداع والخيال وكيفية تنميتهما...",
      type: "تأملات",
      icon: FileText,
      image: "/light.jpg? height=200&width=300",
      slug: "creativity-imagination",
    },
  ],
  "daily-reflections": [
    {
      id: 1,
      title: "التأمل اليومي",
      excerpt: "دليل عملي لممارسة التأمل اليومي وفوائده...",
      type: "تأملات",
      icon: FileText,
      image: "/placeholder.svg?height=200&width=300",
      slug: "daily-meditation",
    },
    {
      id: 2,
      title: "حديث النفس",
      excerpt: "قصيدة عن الحوار الداخلي والتأمل الذاتي...",
      type: "شعر",
      icon: Music,
      image: "/placeholder.svg?height=200&width=300",
      slug: "self-talk-poem",
    },
    {
      id: 3,
      title: "بودكاست: الوعي والحضور",
      excerpt: "حلقة بودكاست تناقش أهمية الوعي والحضور في اللحظة الراهنة...",
      type: "بودكاست",
      icon: Mic,
      image: "/placeholder.svg?height=200&width=300",
      slug: "mindfulness-podcast",
    },
  ],
}

export function RelatedContent({ slug }: { slug: string }) {
  const relatedContent = relatedContentData[slug as keyof typeof relatedContentData] || []

  if (relatedContent.length === 0) {
    return null
  }

  return (
    <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6">محتوى ذو صلة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedContent.map((item) => {
            const ItemIcon = item.icon

            return (
              <Link href={`/content/${item.slug}`} key={item.id}>
                <div className="group cursor-pointer">
                  <div className="relative h-40 mb-3 overflow-hidden rounded-md">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                        <ItemIcon className="h-3 w-3 mr-1" />
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-vintage-accent transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
