"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, FileText, Music, Video, Mic, Coffee, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getContent } from "@/lib/api-client"

export function RelatedContent({ slug }: { slug: string }) {
  const [relatedContent, setRelatedContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelatedContent() {
      setIsLoading(true)
      setError(null)
      try {
        // In a real app, you would have a dedicated API endpoint for related content
        // For now, we'll just fetch the latest content
        const data = await getContent({ limit: 3 })

        // Filter out the current content
        const filtered = data.filter((item: any) => item.slug !== slug)

        setRelatedContent(filtered.slice(0, 3))
      } catch (err) {
        console.error("Error fetching related content:", err)
        setError("Failed to load related content")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedContent()
  }, [slug])

  const getIconForType = (type: string) => {
    switch (type) {
      case "articles":
      case "مقالات":
        return FileText
      case "stories":
      case "حواديت":
        return BookOpen
      case "poetry":
      case "شعر":
        return Music
      case "cinema":
      case "سينما":
        return Video
      case "reflections":
      case "تأملات":
        return Coffee
      case "podcasts":
      case "بودكاست":
        return Mic
      default:
        return FileText
    }
  }

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8">
        <CardHeader>
          <CardTitle>محتوى ذو صلة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-vintage-accent mb-2" />
            <p className="text-muted-foreground">جاري تحميل المحتوى...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If error, show error message
  if (error) {
    return (
      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8">
        <CardHeader>
          <CardTitle>محتوى ذو صلة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no related content
  if (relatedContent.length === 0) {
    return (
      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8">
        <CardHeader>
          <CardTitle>محتوى ذو صلة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">لا يوجد محتوى ذو صلة حالياً</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8">
      <CardHeader>
        <CardTitle>محتوى ذو صلة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedContent.map((item) => {
            const ItemIcon = getIconForType(item.contentType.name)

            return (
              <div key={item._id} className="flex gap-3 pb-4 border-b border-vintage-border last:border-0 last:pb-0">
                {item.coverImage && (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image src={item.coverImage || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white text-xs py-0">
                      <ItemIcon className="h-3 w-3 mr-1" />
                      {item.contentType.label}
                    </Badge>
                  </div>
                  <Link href={`/content/${item.slug}`}>
                    <h3 className="font-medium text-sm mb-1 hover:text-vintage-accent transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 border border-vintage-border">
                      <AvatarImage src={item.author.avatar || "/placeholder.svg"} alt={item.author.name} />
                      <AvatarFallback className="bg-vintage-paper-dark text-white text-xs">
                        {item.author.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate">{item.author.name}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
