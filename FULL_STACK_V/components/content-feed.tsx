"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  Music,
  Video,
  FileText,
  Mic,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  AlertCircle,
  Coffee,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { toggleLike, toggleBookmark } from "@/lib/api-client"


interface ContentFeedProps {
  viewMode: "grid" | "list"
  content: any[]
  isLoading: boolean
  error: string | null
}

export function ContentFeed({ viewMode, content, isLoading, error }: ContentFeedProps) {

  //const [content, setContent] = useState<Content[]>([])
	const [localContent, setLocalContent] = useState<any[]>(content);
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [savedPosts, setSavedPosts] = useState<string[]>([])
  const { toast } = useToast()
  const { data: session } = useSession()


  // Update content state when initialContent changes
  /*useEffect(() => {
    console.log("Updating content with initialContent:", initialContent);
    setContent(initialContent);
  }, [initialContent]);*/

	useEffect(() => {
    if (content) {
			setLocalContent(content);
      setLikedPosts(content.filter(item => item.isLiked).map(item => String(item._id)));
      setSavedPosts(content.filter(item => item.isSaved).map(item => String(item._id)));
    }
  }, [content]);
	
	// console.log("Content from feedpage:", content)

  const handleLike = async (id: string) => {
    if (!session) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول للتفاعل مع المحتوى",
      })
      return
    }

		// Optimistic update
    const previousContent = localContent;
		const isCurrentlyLiked = likedPosts.includes(id);
    setLocalContent(prev =>
      prev.map(item =>
        String(item._id) === id
          ? {
              ...item,
              likesCount: isCurrentlyLiked ? item.likesCount - 1 : item.likesCount + 1,
            }
          : item
      )
    );

    try {
      //const { liked } = await toggleLike(id)
      const { liked } = await toggleLike(id)
			console.log("Toggling like for post:", id, "Liked:", liked)
      
			if (liked) {
			setLocalContent(prev =>
        prev.map(item =>
          String(item._id) === id ? { ...item, likesCount: item.likesCount } : item
        )						
			)
         setLikedPosts([...likedPosts, id])
        toast({ title: "تم الإعجاب", description: "تم تسجيل إعجابك بالمنشور" });
      } else {
        setLikedPosts(prev => prev.filter(postId => postId !== id));
        toast({ title: "تم إلغاء الإعجاب", description: "تم إلغاء إعجابك بالمنشور" });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setLocalContent(previousContent); // Revert optimistic update
      toast({
        title: "حدث خطأ",
        description: "تعذر تحديث حالة الإعجاب",
        variant: "destructive",
      });
    }
  };

	
  const handleShare = async (item: any) => {
    const url = `${window.location.origin}/content/${item.slug}`
    const shareData = {
      title: item.title,
      text: item.excerpt || "أعتقد أن هذا المحتوى قد يهمك",
      url: url,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast({
          title: "تم المشاركة",
          description: "تم مشاركة المنشور بنجاح",
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
        toast({
          title: "تم نسخ الرابط",
          description: "تم نسخ رابط المنشور إلى الحافظة",
        })
      }
    } catch (err) {
      console.error("Error sharing:", err)
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast({
          title: "تم نسخ الرابط",
          description: "تم نسخ رابط المنشور إلى الحافظة",
        })
      } catch (clipboardErr) {
        toast({
          title: "خطأ في المشاركة",
          description: "تعذر مشاركة المنشور",
          variant: "destructive",
        })
      }
    }
  }

	
  const handleSave = async (id: string) => {
    if (!session) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول للتفاعل مع المحتوى",
      })
      return
    }

    try {
      const { bookmarked } = await toggleBookmark(id)

      if (bookmarked) {
        setSavedPosts([...savedPosts, id])
        toast({
          title: "تم الحفظ",
          description: "تم حفظ المنشور في قائمتك",
        })
      } else {
        setSavedPosts(savedPosts.filter((postId) => postId !== id))
        toast({
          title: "تم إلغاء الحفظ",
          description: "تم إلغاء حفظ المنشور من قائمتك",
        })
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err)
      toast({
        title: "حدث خطأ",
        description: "تعذر تحديث حالة الحفظ",
        variant: "destructive",
      })
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "articles":
      case "مقالات":
        return <FileText className="h-3 w-3 ml-1" />
      case "stories":
      case "حواديت":
        return <BookOpen className="h-3 w-3 ml-1" />
      case "poetry":
      case "شعر":
        return <Music className="h-3 w-3 ml-1" />
      case "cinema":
      case "سينما":
        return <Video className="h-3 w-3 ml-1" />
      case "reflections":
      case "تأملات":
        return <Coffee className="h-3 w-3 ml-1" />
      case "podcasts":
      case "بودكاست":
        return <Mic className="h-3 w-3 ml-1" />
      default:
        return <FileText className="h-3 w-3 ml-1" />
    }
  }

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

  // If no content is available
  if (localContent?.length === 0) {
    return (
      <div className="text-center py-16 bg-vintage-paper-dark/5 rounded-lg">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">لا يوجد محتوى</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          لم يتم العثور على أي محتوى يطابق معايير البحث الخاصة بك. يرجى تعديل الفلاتر والمحاولة مرة أخرى.
        </p>
      </div>
    )
  }

  // Grid view
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localContent?.map((item, index) => {
          const ItemIcon = getIconForType(item?.contentType?.name) || getIconForType(item?.contentType?.label) || FileText;
          const isLiked = likedPosts.includes(String(item._id)) || item.isLiked;
          const isSaved = savedPosts.includes(String(item._id)) || item.isSaved;

          return (
            <Card
              key={String(item._id)}
              className="border-vintage-border backdrop-blur-sm overflow-hidden h-full flex flex-col"
            >
              <CardContent className="p-0 flex flex-col h-full">
                {item.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.coverImage || "/placeholder.svg?height=400&width=600"}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3}
                      quality={85}
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                        {ItemIcon}
                        {item.contentType?.label || item.contentType?.name || "محتوى"}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8 border border-vintage-border">
                      <AvatarImage src={item.author?.avatar || "/placeholder.svg"} alt={item.author?.name || "غير محدد"} />
                      <AvatarFallback className="bg-vintage-paper-dark text-white">
                        {item.author?.name?.substring(0, 2) || "غ"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{item.author?.name || "غير محدد"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                      </div>
                    </div>
                  </div>

                  <Link href={`/content/${item.slug}`}>
                    <h2 className="text-lg font-bold mb-2 hover:text-vintage-accent transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{item.excerpt}</p>

                  <div className="flex flex-wrap gap-1 mb-3 mt-auto">
                    {item.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-vintage-border bg-vintage-paper-dark/5 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-vintage-border pt-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 p-0 h-auto ${isLiked ? "text-red-500" : ""}`}
                        onClick={() => handleLike(String(item._id))}
                      >
                        <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                        <span>{item.likesCount}</span>
                      </Button>
                      <Link href={`/content/${item.slug}#comments`}>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 p-0 h-auto">
                          <MessageSquare className="h-4 w-4" />
                          <span>{item.commentsCount}</span>
                        </Button>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-0 h-auto ${isSaved ? "text-vintage-accent" : ""}`}
                        onClick={() => handleSave(String(item._id))}
                      >
                        <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => handleShare(item)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // List view (default)
  return (
    <div className="space-y-6">
      {localContent?.map((item) => {
        const ItemIcon =  getIconForType(item?.contentType?.name) || getIconForType(item?.contentType?.label) || FileText;
        const isLiked = likedPosts.includes(String(item._id))
        const isSaved = savedPosts.includes(String(item._id))

        return (
          <Card key={String(item._id)} className="border-vintage-border  backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4 border-b border-vintage-border">
                <Avatar className="h-10 w-10 border border-vintage-border">
                  <AvatarImage src={item.author?.avatar || "/placeholder.svg"} alt={item.author?.name || "غير محدد"} />
                  <AvatarFallback className="bg-vintage-paper-dark text-white">
                    {item.author?.name?.substring(0, 2) || "غ"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{item.author?.name || "غير محدد"}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                  </div>
                </div>
                <Badge className="mr-auto bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                  {ItemIcon}
                  {item.contentType?.label || item.contentType?.name || "محتوى"}
                </Badge>
              </div>

              <div className="p-4">
                <Link href={`/content/${item.slug}`}>
                  <h2 className="text-xl font-bold mb-3 hover:text-vintage-accent transition-colors">{item.title}</h2>
                </Link>

                <div className="md:flex gap-6">
                  {item.coverImage && (
                    <div className="relative h-64 md:h-auto md:w-1/3 mb-4 md:mb-0 rounded-md overflow-hidden">
                      <Image
                        src={item.coverImage || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className={item.coverImage ? "md:w-2/3" : "w-full"}>
                    <div className="mb-4 whitespace-pre-line">
                      {item.excerpt}
                      <Link href={`/content/${item.slug}`} className="block mt-2 text-vintage-accent hover:underline">
                        اقرأ المزيد
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="border-vintage-border bg-vintage-paper-dark/5">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-vintage-border pt-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-1 ${isLiked  || item.isLiked ? "text-red-500" : ""}`}
                          onClick={() => handleLike(String(item._id))}
                        >
                          <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                          <span>{item.likesCount}</span>
                        </Button>
                        <Link href={`/content/${item.slug}#comments`}>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{item.commentsCount}</span>
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={isSaved || item.isSaved ? "text-vintage-accent" : ""}
                          onClick={() => handleSave(String(item._id))}
                        >
                          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare(item)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
