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
import { getContentBySlug, toggleLike, toggleBookmark, getContentById, checkLikeStatus, checkBookmarkStatus } from "@/lib/api-client"
import { useRouter } from "next/navigation"

interface Content {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  contentType: {
    name: string;
    label: string;
  };
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  likesCount: number;
  tags: string[];
}

interface ContentDetailProps {
  slug: string
  initialContent?: Content
}

export function ContentDetail({ slug, initialContent }: ContentDetailProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<Content | null>(initialContent || null)
  const [isLoading, setIsLoading] = useState(!initialContent)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // If we have initial content, use it and don't fetch again
    if (initialContent) {
      setContent(initialContent)
      setIsLoading(false)
      // Still check user status even with initial content
      if (session && initialContent._id) {
        checkUserStatus(initialContent._id)
      }
      return
    }

    // Only fetch if we don't have initial content and have a valid slug
    if (!slug || slug === "undefined" || slug === "-") {
      setError("Invalid content identifier")
      setIsLoading(false)
      return
    }

    async function fetchContent() {
      setIsLoading(true)
      setError(null)
      try {
        // First try to fetch by slug
        let data = await getContentBySlug(slug)
        
        // If that fails and the slug looks like an ObjectId, try fetching by ID
        if (!data && /^[0-9a-fA-F]{24}$/.test(slug)) {
          console.log("🔄 Slug looks like ObjectId, trying to fetch by ID:", slug)
          data = await getContentById(slug)
        }
        
        if (!data) {
          throw new Error("Content not found")
        }
        
        setContent(data)
        
        // Check user status if logged in
        if (session && data._id) {
          await checkUserStatus(data._id)
        }
      } catch (err) {
        console.error("Error fetching content:", err)
        setError("Failed to load content. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [slug, session])

  // Handle session changes
  useEffect(() => {
    if (content?._id) {
      checkUserStatus(content._id)
    }
  }, [session?.user?.email, content?._id])

  // Separate function to check user status
  const checkUserStatus = async (contentId: string) => {
    if (!session?.user?.email) {
      // Reset status for non-logged-in users
      setIsLiked(false)
      setIsSaved(false)
      return
    }

    try {
      const [likeResponse, bookmarkResponse] = await Promise.all([
        checkLikeStatus(contentId),
        checkBookmarkStatus(contentId)
      ])
      
      setIsLiked(likeResponse.liked)
      setIsSaved(bookmarkResponse.saved)
      
      console.log("✅ User status fetched:", {
        liked: likeResponse.liked,
        saved: bookmarkResponse.saved,
        contentId: contentId
      })
    } catch (error) {
      console.error("❌ Error fetching user status:", error)
      // Reset status on error
      setIsLiked(false)
      setIsSaved(false)
    }
  }

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول للتفاعل مع المحتوى",
      })
      return
    }

    if (!content) return

    try {
      const { liked } = await toggleLike(content._id)
      setIsLiked(liked)

			console.log("handle like",liked)

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

    if (!content) return

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
    if (!content) return
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

  // Improved word counting function for Arabic content
  const countWords = (html: string) => {
    try {
      // Remove HTML tags and count words
      const text = html
        .replace(/<[^>]*>/g, " ") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
        .replace(/&amp;/g, " ") // Replace HTML entities
        .replace(/&lt;/g, " ")
        .replace(/&gt;/g, " ")
        .replace(/&quot;/g, " ")
        .replace(/&#39;/g, " ")
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim()
      
      // Split by spaces and filter out empty strings
      const words = text.split(" ").filter((word) => word.length > 0)
      
      console.log("Word count for post:", words.length, "words")
      return words.length
    } catch (error) {
      console.error("Error counting words:", error)
      // Fallback: estimate word count by content length
      return Math.floor(html.length / 5)
    }
  }

  // Enhanced end-of-post interactions component
  const EndOfPostInteractions = () => (
    <div className="mt-12 pt-8 border-t-2 border-vintage-border/30 bg-gradient-to-r from-vintage-paper-dark/5 to-transparent rounded-lg p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-3 text-vintage-ink">هل أعجبك هذا المحتوى؟</h3>
        <p className="text-sm text-muted-foreground mb-6">شاركه مع أصدقائك واترك إعجابك!</p>
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            variant="outline"
            size="lg"
            className={`border-vintage-border hover:bg-red-50 transition-colors ${
              isLiked ? "text-red-500 border-red-200 bg-red-50" : ""
            }`}
            onClick={handleLike}
          >
            <Heart className="h-5 w-5 mr-2" fill={isLiked ? "currentColor" : "none"} />
            <span>
              {isLiked ? "أعجبني" : "إعجاب"} ({content?.likesCount || 0})
            </span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className={`border-vintage-border hover:bg-vintage-accent/10 transition-colors ${
              isSaved ? "text-vintage-accent border-vintage-accent/20 bg-vintage-accent/10" : ""
            }`}
            onClick={handleSave}
          >
            <Bookmark className="h-5 w-5 mr-2" fill={isSaved ? "currentColor" : "none"} />
            <span>{isSaved ? "محفوظ" : "حفظ"}</span>
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="border-vintage-border hover:bg-blue-50 transition-colors" 
            onClick={handleShare}
          >
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
  const isAuthenticated = !!session?.user?.email // Check if user is actually authenticated (not guest)

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
              {isAuthenticated && (isAuthor || isAdmin) && (
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
            {/* Debug info in development
            {process.env.NODE_ENV === "development" && (
              <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                <strong>Debug:</strong> Word count: {countWords(content.content)} words 
                {countWords(content.content) > 400 ? " (Will show end interactions)" : " (Too short for end interactions)"}
              </div>
            )} */}
            
            <div dangerouslySetInnerHTML={{ __html: content.content }} />

            {/* Show end-of-post interactions for long posts (>400 words) */}
            {countWords(content.content) > 400 && (
              <>
                <div className="my-8 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-vintage-paper-dark/10 px-4 py-2 rounded-full">
                    <span>📖</span>
                    <span>مقال طويل - {countWords(content.content)} كلمة</span>
                  </div>
                </div>
                <EndOfPostInteractions />
              </>
            )}
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
