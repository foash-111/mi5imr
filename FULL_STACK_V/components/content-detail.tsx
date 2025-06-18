"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, FileText, Heart, Bookmark, Share2, Calendar, Edit, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { getContentBySlug, toggleLike, toggleBookmark } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export function ContentDetail({ slug }: { slug: string }) {
  const [content, setContent] = useState<any | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getContentBySlug(slug)
        setContent(data)
      } catch (err) {
        console.error("Error fetching content:", err)
        setError("Failed to load content. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [slug])

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول للتفاعل مع المحتوى",
      })
      return
    }

    try {
      const { liked } = await toggleLike(content._id)
      setIsLiked(liked)

      // Update content like count
      setContent({
        ...content,
        likesCount: liked ? content.likesCount + 1 : content.likesCount - 1,
      })

      toast({
        title: liked ? "تم الإعجاب" : "تم إلغاء الإعجاب",
        description: liked ? "تم تسجيل إعجابك بالمنشور" : "تم إلغاء إعجابك بالمنشور",
      })
    } catch (err) {
      console.error("Error toggling like:", err)
      toast({
        title: "حدث خطأ",
        description: "تعذر تحديث حالة الإعجاب",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!session) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول للتفاعل مع المحتوى",
      })
      return
    }

    try {
      const { bookmarked } = await toggleBookmark(content._id)
      setIsSaved(bookmarked)

      toast({
        title: bookmarked ? "تم الحفظ" : "تم إلغاء الحفظ",
        description: bookmarked ? "تم حفظ المنشور في قائمتك" : "تم إلغاء حفظ المنشور من قائمتك",
      })
    } catch (err) {
      console.error("Error toggling bookmark:", err)
      toast({
        title: "حدث خطأ",
        description: "تعذر تحديث حالة الحفظ",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    const url = window.location.href
    if (!url) return

    if (navigator.share) {
      navigator
        .share({
          title: content?.title || "مشاركة محتوى",
          text: content?.excerpt || "أعتقد أن هذا المحتوى قد يهمك",
          url,
        })
        .catch(() => {
          navigator.clipboard.writeText(url)
          toast({
            title: "تم نسخ الرابط",
            description: "تم نسخ رابط المحتوى إلى الحافظة",
          })
        })
    } else {
      navigator.clipboard.writeText(url)
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط المحتوى إلى الحافظة",
      })
    }
  }

  const handleEdit = () => {
    router.push(`/admin/edit/${content._id}`)
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "articles":
      case "مقالات":
        return FileText
      case "stories":
      case "حواديت":
        return BookOpen
      default:
        return FileText
    }
  }

  // Add this function after the existing handleShare function
  const countWords = (html: string) => {
    // Remove HTML tags and count words
    const text = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    return text.split(" ").filter((word) => word.length > 0).length
  }

  // Add this component before the return statement
  const EndOfPostInteractions = () => (
    <div className="mt-8 pt-6 border-t border-vintage-border">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground mb-4">هل أعجبك هذا المحتوى؟ شاركه مع أصدقائك!</p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className={`border-vintage-border ${isLiked ? "text-red-500 border-red-200" : ""}`}
            onClick={handleLike}
          >
            <Heart className="h-5 w-5 mr-2" fill={isLiked ? "currentColor" : "none"} />
            <span>
              {isLiked ? "أعجبني" : "إعجاب"} ({content.likesCount})
            </span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className={`border-vintage-border ${isSaved ? "text-vintage-accent border-vintage-accent/20" : ""}`}
            onClick={handleSave}
          >
            <Bookmark className="h-5 w-5 mr-2" fill={isSaved ? "currentColor" : "none"} />
            <span>{isSaved ? "محفوظ" : "حفظ"}</span>
          </Button>

          <Button variant="outline" size="lg" className="border-vintage-border" onClick={handleShare}>
            <Share2 className="h-5 w-5 mr-2" />
            <span>مشاركة</span>
          </Button>
        </div>
      </div>
    </div>
  )

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-vintage-accent mb-4" />
        <p className="text-muted-foreground">جاري تحميل المحتوى...</p>
      </div>
    )
  }

  // If error, show error message
  if (error) {
    return (
      <div className="text-center py-16 bg-vintage-paper-dark/5 rounded-lg">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">حدث خطأ</h3>
        <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
      </div>
    )
  }

  // If content not found
  if (!content) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">المحتوى غير موجود</h2>
        <p>عذراً، لم نتمكن من العثور على المحتوى المطلوب.</p>
      </div>
    )
  }

  const IconComponent = getIconForType(content.contentType.name)
  const isAuthor = session?.user?.email === content.author.email
  const isAdmin = session?.user?.isAdmin

  return (
    <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8">
      <CardContent className="p-0">
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={content.coverImage || "/placeholder.svg?height=600&width=1200"}
            alt={content.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
              <Badge className="mb-4 bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                <IconComponent className="h-3 w-3 mr-1" />
                {content.contentType.label}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{content.title}</h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-vintage-border">
                <AvatarImage src={content.author.avatar || "/placeholder.svg"} alt={content.author.name} />
                <AvatarFallback className="bg-vintage-paper-dark text-white">
                  {content.author.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{content.author.name}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(content.createdAt).toLocaleDateString("ar-EG")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isAuthor || isAdmin) && (
                <Button variant="outline" size="sm" className="border-vintage-border" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  <span>تعديل</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" className={isLiked ? "text-red-500" : ""} onClick={handleLike}>
                <Heart className="h-4 w-4 mr-1" fill={isLiked ? "currentColor" : "none"} />
                <span>{content.likesCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className={isSaved ? "text-vintage-accent" : ""} onClick={handleSave}>
                <Bookmark className="h-4 w-4 mr-1" fill={isSaved ? "currentColor" : "none"} />
                <span>حفظ</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                <span>مشاركة</span>
              </Button>
            </div>
          </div>

          <div className="prose prose-lg max-w-none rtl:text-right">
            <div dangerouslySetInnerHTML={{ __html: content.content }} />

            {/* Show end-of-post interactions for long posts (>400 words) */}
            {countWords(content.content) > 400 && <EndOfPostInteractions />}
          </div>

          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-vintage-border">
            {content.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="border-vintage-border bg-vintage-paper-dark/5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
