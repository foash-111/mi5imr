"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Music, Video, Mic, Coffee, Loader2, AlertCircle, TrendingUp, Clock, User, Heart, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getRelatedContent } from "@/lib/api-client"

interface YouMightAlsoLikeProps {
  contentId: string
  currentSlug: string
  limit?: number
}

export function YouMightAlsoLike({ contentId, currentSlug, limit = 6 }: YouMightAlsoLikeProps) {
  const [relatedContent, setRelatedContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelatedContent() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRelatedContent(contentId, limit)
        // Filter out the current content by slug
        const filtered = data.filter((item: any) => item.slug !== currentSlug)
        setRelatedContent(filtered)
      } catch (err) {
        console.error("Error fetching related content:", err)
        setError("Failed to load related content")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedContent()
  }, [contentId, currentSlug, limit])

  const getIconForType = (type: string) => {
    switch (type) {
      case "articles":
      case "مقالات":
        return <FileText className="h-4 w-4" />
      case "stories":
      case "حواديت":
        return <BookOpen className="h-4 w-4" />
      case "poetry":
      case "شعر":
        return <Music className="h-4 w-4" />
      case "cinema":
      case "سينما":
        return <Video className="h-4 w-4" />
      case "reflections":
      case "تأملات":
        return <Coffee className="h-4 w-4" />
      case "podcasts":
      case "بودكاست":
        return <Mic className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getRelevanceLevel = (score: number) => {
    if (score >= 20) return { level: "عالية جداً", color: "bg-green-600" }
    if (score >= 15) return { level: "عالية", color: "bg-green-500" }
    if (score >= 10) return { level: "متوسطة", color: "bg-yellow-500" }
    if (score >= 5) return { level: "منخفضة", color: "bg-orange-500" }
    return { level: "ضعيفة", color: "bg-gray-500" }
  }

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <Card className="border-vintage-border backdrop-blur-sm overflow-hidden mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-vintage-accent" />
            قد يعجبك أيضاً
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-vintage-accent mb-4" />
            <p className="text-muted-foreground">جاري تحميل المحتوى المقترح...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If error, show error message
  if (error) {
    return (
      <Card className="border-vintage-border backdrop-blur-sm overflow-hidden mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-vintage-accent" />
            قد يعجبك أيضاً
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no related content
  if (relatedContent.length === 0) {
    return null
  }

  return (
    <Card className="border-vintage-border backdrop-blur-sm overflow-hidden mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-vintage-accent" />
          قد يعجبك أيضاً
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedContent.map((item) => {
            const ItemIcon = getIconForType(item.contentType?.name || "articles")
            const relevance = getRelevanceLevel(item.score || 0)

            return (
              <Link href={`/content/${item.slug}`} key={item._id}>
                <Card className="border-vintage-border hover:border-vintage-accent transition-colors cursor-pointer group h-full">
                  <CardContent className="p-0">
                    {item.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={item.coverImage || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                            {ItemIcon}
                            {item.contentType?.label || "غير محدد"}
                          </Badge>
                          <Badge className={`${relevance.color} text-white`}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {relevance.level}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold mb-2 hover:text-vintage-accent transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.excerpt && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                          {item.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-6 w-6 border border-vintage-border">
                          <AvatarImage src={item.author?.avatar || "/placeholder.svg"} alt={item.author?.name || "غير محدد"} />
                          <AvatarFallback className="bg-vintage-paper-dark text-white text-xs">
                            {item.author?.name?.substring(0, 2) || "غ"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">{item.author?.name || "غير محدد"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(item.createdAt).toLocaleDateString("ar-EG")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{item.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{item.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 