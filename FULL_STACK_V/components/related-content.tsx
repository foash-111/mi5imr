"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, FileText, Music, Video, Mic, Coffee, Loader2, AlertCircle, TrendingUp, Clock, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getRelatedContent } from "@/lib/api-client"

interface RelatedContentProps {
  slug: string
  contentId?: string
}

export function RelatedContent({ slug, contentId }: RelatedContentProps) {
  const [relatedContent, setRelatedContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelatedContent() {
      if (!contentId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const data = await getRelatedContent(contentId, 6)
        setRelatedContent(data)
      } catch (err) {
        console.error("Error fetching related content:", err)
        setError("Failed to load related content")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedContent()
  }, [contentId])

  const getIconForType = (type: string) => {
    switch (type) {
      case "articles":
      case "مقالات":
        return <FileText className="h-3 w-3 mr-1" />
      case "stories":
      case "حواديت":
        return <BookOpen className="h-3 w-3 mr-1" />
      case "poetry":
      case "شعر":
        return <Music className="h-3 w-3 mr-1" />
      case "cinema":
      case "سينما":
        return <Video className="h-3 w-3 mr-1" />
      case "reflections":
      case "تأملات":
        return <Coffee className="h-3 w-3 mr-1" />
      case "podcasts":
      case "بودكاست":
        return <Mic className="h-3 w-3 mr-1" />
      default:
        return <FileText className="h-3 w-3 mr-1" />
    }
  }

  const getRelevanceBadge = (item: any) => {
    if (!item.score) return null
    
    let relevance = "متوسط"
    let color = "bg-yellow-500"
    
    if (item.score >= 20) {
      relevance = "عالية جداً"
      color = "bg-green-600"
    } else if (item.score >= 15) {
      relevance = "عالية"
      color = "bg-green-500"
    } else if (item.score >= 10) {
      relevance = "متوسطة"
      color = "bg-yellow-500"
    } else if (item.score >= 5) {
      relevance = "منخفضة"
      color = "bg-orange-500"
    } else {
      relevance = "ضعيفة"
      color = "bg-gray-500"
    }
    
    return (
      <Badge className={`${color} text-white text-xs`}>
        <TrendingUp className="h-3 w-3 mr-1" />
        {relevance}
      </Badge>
    )
  }

  const getCategoryBadge = (item: any) => {
    if (!item.categories || item.categories.length === 0) return null
    
    const primaryCategory = item.categories[0]
    return (
      <Badge variant="outline" className="border-vintage-border bg-vintage-paper-dark/5 text-xs">
        {primaryCategory.label}
      </Badge>
    )
  }

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <Card className="border-vintage-border backdrop-blur-sm overflow-hidden mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-vintage-accent" />
            محتوى ذو صلة
          </CardTitle>
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
      <Card className="border-vintage-border backdrop-blur-sm overflow-hidden mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-vintage-accent" />
            محتوى ذو صلة
          </CardTitle>
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
      <Card className="border-vintage-border backdrop-blur-sm overflow-hidden mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-vintage-accent" />
            محتوى ذو صلة
          </CardTitle>
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
    <Card className="border-vintage-border backdrop-blur-sm overflow-hidden mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-vintage-accent" />
          محتوى ذو صلة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedContent.map((item) => {
            const ItemIcon = getIconForType(item.contentType?.name || "articles")

            return (
              <div key={item._id} className="pb-4 border-b border-vintage-border last:border-0 last:pb-0">
                <div className="flex gap-3">
                  {item.coverImage && (
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image src={item.coverImage || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1 flex-wrap">
                      <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white text-xs py-0">
                        {ItemIcon}
                        {item.contentType?.label || "غير محدد"}
                      </Badge>
                      {getCategoryBadge(item)}
                      {getRelevanceBadge(item)}
                    </div>
                    <Link href={`/content/${item.slug}`}>
                      <h3 className="font-medium text-sm mb-1 hover:text-vintage-accent transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate">{item.author?.name || "غير محدد"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString("ar-EG")}</span>
                      </div>
                    </div>
                    {item.excerpt && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}
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
