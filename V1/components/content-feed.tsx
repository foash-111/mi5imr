"use client"

import { useState } from "react"
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// Mock content data
const contentItems = [
  {
    id: 1,
    title: "رحلة إلى عالم الخيال",
    content:
      "في هذه القصة نتناول رحلة خيالية إلى عوالم لم يسبق لأحد أن زارها من قبل. نستكشف معاً الحدود بين الواقع والخيال، ونتأمل في معنى الوجود والإبداع. هذه القصة هي دعوة للتفكير خارج الصندوق والتحليق بعيداً في سماء الإبداع.",
    type: "حواديت",
    icon: BookOpen,
    image: "/novel.png?height=400&width=600",
    date: "٢٠ أبريل ٢٠٢٣",
    likes: 42,
    comments: 7,
    author: {
      name: "مخيمر",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    slug: "journey-to-imagination",
    tags: ["خيال", "إبداع", "قصص"],
  },
  {
    id: 2,
    title: "تأملات في الحياة اليومية",
    content:
      "مجموعة من التأملات والأفكار حول الحياة اليومية والتحديات التي نواجهها. كيف يمكننا أن نجد المعنى في التفاصيل الصغيرة؟ وكيف نتعامل مع ضغوط الحياة المعاصرة؟ هذه المقالة تقدم بعض الأفكار والتأملات التي قد تساعدنا على فهم أنفسنا والعالم من حولنا بشكل أفضل.",
    type: "تأملات",
    icon: FileText,
    image: "/people-leave.png?height=400&width=600",
    date: "١٥ أبريل ٢٠٢٣",
    likes: 35,
    comments: 12,
    author: {
      name: "مخيمر",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    slug: "daily-reflections",
    tags: ["تأملات", "حياة", "فلسفة"],
  },
  {
    id: 3,
    title: "قصيدة الصباح",
    content:
      "صباحٌ يتنفس الأمل\nويرسم للحياة ملامح جديدة\nصباحٌ يغسل الروح\nويزيل عنها غبار الأمس\nصباحٌ يحمل في طياته\nوعوداً بغدٍ أجمل\nوأحلاماً تنتظر التحقق",
    type: "شعر",
    icon: Music,
    image: "/patience.jpeg?height=400&width=600",
    date: "١٠ أبريل ٢٠٢٣",
    likes: 56,
    comments: 8,
    author: {
      name: "مخيمر",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    slug: "morning-poem",
    tags: ["شعر", "صباح", "أمل"],
  },
  {
    id: 4,
    title: "مراجعة فيلم: رحلة الروح",
    content:
      "في هذه المراجعة النقدية نتناول فيلم 'رحلة الروح' الذي يطرح أسئلة فلسفية عميقة حول معنى الحياة والموت والخلود. الفيلم يجمع بين الجانب الفني الجمالي والعمق الفكري، مما يجعله تجربة سينمائية فريدة تستحق المشاهدة والتأمل.",
    type: "سينما",
    icon: Video,
    image: "/post.png?height=400&width=600",
    date: "٥ أبريل ٢٠٢٣",
    likes: 28,
    comments: 15,
    author: {
      name: "مخيمر",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    slug: "soul-journey-review",
    tags: ["سينما", "نقد", "فلسفة"],
  },
  {
    id: 5,
    title: "حلقة بودكاست: الإبداع والإلهام",
    content:
      "في هذه الحلقة من البودكاست نتحدث عن مصادر الإلهام وكيفية تنمية القدرات الإبداعية. نستضيف كاتباً وفناناً للحديث عن تجاربهم الشخصية مع الإبداع والتحديات التي واجهوها في مسيرتهم الفنية.",
    type: "بودكاست",
    icon: Mic,
    image: "/podcast.png?height=400&width=600",
    date: "١ أبريل ٢٠٢٣",
    likes: 32,
    comments: 6,
    author: {
      name: "مخيمر",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    slug: "creativity-podcast",
    tags: ["بودكاست", "إبداع", "فن"],
  },
]

interface ContentFeedProps {
  viewMode: "grid" | "list"
  sortBy: "newest" | "popular" | "trending"
}

export function ContentFeed({ viewMode, sortBy }: ContentFeedProps) {
  const [likedPosts, setLikedPosts] = useState<number[]>([])
  const [savedPosts, setSavedPosts] = useState<number[]>([])
  const { toast } = useToast()

  // Sort content based on sortBy prop
  const getSortedContent = () => {
    switch (sortBy) {
      case "popular":
        return [...contentItems].sort((a, b) => b.likes - a.likes)
      case "trending":
        return [...contentItems].sort((a, b) => b.comments - a.comments)
      case "newest":
      default:
        return contentItems // Assuming the original array is already sorted by date
    }
  }

  const sortedContent = getSortedContent()

  const handleLike = (id: number) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(likedPosts.filter((postId) => postId !== id))
      toast({
        title: "تم إلغاء الإعجاب",
        description: "تم إلغاء إعجابك بالمنشور",
      })
    } else {
      setLikedPosts([...likedPosts, id])
      toast({
        title: "تم الإعجاب",
        description: "تم تسجيل إعجابك بالمنشور",
      })
    }
  }

  const handleSave = (id: number) => {
    if (savedPosts.includes(id)) {
      setSavedPosts(savedPosts.filter((postId) => postId !== id))
      toast({
        title: "تم إلغاء الحفظ",
        description: "تم إلغاء حفظ المنشور من قائمتك",
      })
    } else {
      setSavedPosts([...savedPosts, id])
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المنشور في قائمتك",
      })
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "حواديت":
        return BookOpen
      case "تأملات":
        return FileText
      case "شعر":
        return Music
      case "سينما":
        return Video
      case "بودكاست":
        return Mic
      default:
        return FileText
    }
  }

  // If no content is available
  if (sortedContent.length === 0) {
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
        {sortedContent.map((item) => {
          const ItemIcon = getIconForType(item.type)
          const isLiked = likedPosts.includes(item.id)
          const isSaved = savedPosts.includes(item.id)

          return (
            <Card
              key={item.id}
              className="border-vintage-border  backdrop-blur-sm overflow-hidden h-full flex flex-col"
            >
              <CardContent className="p-0 flex flex-col h-full">
                {item.image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                        <ItemIcon className="h-3 w-3 ml-1" />
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8 border border-vintage-border">
                      <AvatarImage src={item.author.avatar || "/placeholder.svg"} alt={item.author.name} />
                      <AvatarFallback className="bg-vintage-paper-dark text-white">
                        {item.author.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{item.author.name}</div>
                      <div className="text-xs text-muted-foreground">{item.date}</div>
                    </div>
                  </div>

                  <Link href={`/content/${item.slug}`}>
                    <h2 className="text-lg font-bold mb-2 hover:text-vintage-accent transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{item.content}</p>

                  <div className="flex flex-wrap gap-1 mb-3 mt-auto">
                    {item.tags.map((tag) => (
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
                        onClick={() => handleLike(item.id)}
                      >
                        <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                        <span>{isLiked ? item.likes + 1 : item.likes}</span>
                      </Button>
                      <Link href={`/content/${item.slug}#comments`}>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 p-0 h-auto">
                          <MessageSquare className="h-4 w-4" />
                          <span>{item.comments}</span>
                        </Button>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-0 h-auto ${isSaved ? "text-vintage-accent" : ""}`}
                        onClick={() => handleSave(item.id)}
                      >
                        <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
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
      {sortedContent.map((item) => {
        const ItemIcon = getIconForType(item.type)
        const isLiked = likedPosts.includes(item.id)
        const isSaved = savedPosts.includes(item.id)

        return (
          <Card key={item.id} className="border-vintage-border  backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4 border-b border-vintage-border">
                <Avatar className="h-10 w-10 border border-vintage-border">
                  <AvatarImage src={item.author.avatar || "/placeholder.svg"} alt={item.author.name} />
                  <AvatarFallback className="bg-vintage-paper-dark text-white">
                    {item.author.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{item.author.name}</div>
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                </div>
                <Badge className="mr-auto bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                  <ItemIcon className="h-3 w-3 ml-1" />
                  {item.type}
                </Badge>
              </div>

              <div className="p-4">
                <Link href={`/content/${item.slug}`}>
                  <h2 className="text-xl font-bold mb-3 hover:text-vintage-accent transition-colors">{item.title}</h2>
                </Link>

                <div className="md:flex gap-6">
                  {item.image && (
                    <div className="relative h-64 md:h-auto md:w-1/3 mb-4 md:mb-0 rounded-md overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    </div>
                  )}

                  <div className={item.image ? "md:w-2/3" : "w-full"}>
                    <div className="mb-4 whitespace-pre-line">
                      {item.content.length > 300 ? `${item.content.substring(0, 300)}...` : item.content}
                      {item.content.length > 300 && (
                        <Link href={`/content/${item.slug}`} className="block mt-2 text-vintage-accent hover:underline">
                          اقرأ المزيد
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag) => (
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
                          className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
                          onClick={() => handleLike(item.id)}
                        >
                          <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                          <span>{isLiked ? item.likes + 1 : item.likes}</span>
                        </Button>
                        <Link href={`/content/${item.slug}#comments`}>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{item.comments}</span>
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={isSaved ? "text-vintage-accent" : ""}
                          onClick={() => handleSave(item.id)}
                        >
                          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                        </Button>
                        <Button variant="ghost" size="sm">
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
