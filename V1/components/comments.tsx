"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Reply, Send, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

// Mock comments data
const mockComments = {
  "journey-to-imagination": [
    {
      id: 1,
      author: {
        name: "سارة أحمد",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      content: "قصة رائعة! أحببت كيف ربطت بين الخيال والواقع. أتمنى أن تكتب المزيد من هذه النوعية من القصص.",
      date: "٢١ أبريل ٢٠٢٣",
      likes: 5,
      replies: [
        {
          id: 101,
          author: {
            name: "مخيمر",
            avatar: "/placeholder.svg?height=100&width=100",
            isAdmin: true,
          },
          content: "شكراً لك سارة! سعيد أن القصة أعجبتك. بالتأكيد سأكتب المزيد قريباً.",
          date: "٢١ أبريل ٢٠٢٣",
          likes: 2,
        },
      ],
    },
    {
      id: 2,
      author: {
        name: "محمد علي",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      content: "أسلوبك في السرد جميل جداً، استمتعت كثيراً بقراءة هذه القصة. هل هناك جزء ثاني مخطط له؟",
      date: "٢٢ أبريل ٢٠٢٣",
      likes: 3,
      replies: [],
    },
  ],
  "daily-reflections": [
    {
      id: 1,
      author: {
        name: "نور حسن",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      content:
        "هذه التأملات لامست قلبي بشكل كبير. أحاول دائماً أن أجد الوقت للتأمل في حياتي اليومية، لكن كما ذكرت، الحياة السريعة تجعل ذلك صعباً أحياناً.",
      date: "١٦ أبريل ٢٠٢٣",
      likes: 7,
      replies: [
        {
          id: 101,
          author: {
            name: "مخيمر",
            avatar: "/placeholder.svg?height=100&width=100",
            isAdmin: true,
          },
          content:
            "شكراً لك نور على هذا التعليق الجميل. نعم، التحدي الأكبر هو إيجاد الوقت للتأمل وسط مشاغل الحياة، لكن حتى لحظات قصيرة من التأمل يمكن أن تحدث فرقاً كبيراً.",
          date: "١٦ أبريل ٢٠٢٣",
          likes: 3,
        },
      ],
    },
    {
      id: 2,
      author: {
        name: "أحمد محمود",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      content:
        "أحب فكرة تخصيص وقت للصمت والتأمل. بدأت مؤخراً بتخصيص 10 دقائق كل صباح للتأمل، وقد لاحظت تحسناً كبيراً في تركيزي وحالتي المزاجية.",
      date: "١٧ أبريل ٢٠٢٣",
      likes: 5,
      replies: [],
    },
    {
      id: 3,
      author: {
        name: "ليلى عمر",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      content:
        "مقال رائع! أعتقد أن الكتابة هي إحدى أفضل وسائل التأمل. أحتفظ بدفتر يوميات منذ سنوات، وهو يساعدني كثيراً على فهم أفكاري ومشاعري.",
      date: "١٨ أبريل ٢٠٢٣",
      likes: 4,
      replies: [],
    },
  ],
}

export function Comments({ slug }: { slug: string }) {
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [likedComments, setLikedComments] = useState<number[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [comments, setComments] = useState(mockComments[slug as keyof typeof mockComments] || [])
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to comment input when user clicks "Add Comment" button
  const scrollToCommentInput = () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true)
      return
    }

    if (commentInputRef.current) {
      commentInputRef.current.focus()
      commentInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Focus on reply input when replying
  useEffect(() => {
    if (replyingTo !== null && replyInputRef.current) {
      replyInputRef.current.focus()
    }
  }, [replyingTo])

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn) {
      setShowLoginDialog(true)
      return
    }

    if (!comment.trim()) return

    // Create new comment
    const newComment = {
      id: Date.now(),
      author: {
        name: "أنت",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      content: comment,
      date: "الآن",
      likes: 0,
      replies: [],
    }

    // Add to comments
    setComments([newComment, ...comments])
    setComment("")

    // Show success toast
    toast({
      title: "تم إضافة التعليق",
      description: "شكراً على مشاركة رأيك!",
    })
  }

  const handleReplySubmit = (e: React.FormEvent, commentId: number) => {
    e.preventDefault()

    if (!isLoggedIn) {
      setShowLoginDialog(true)
      return
    }

    if (!replyText.trim() || replyingTo === null) return

    // Create new reply
    const newReply = {
      id: Date.now(),
      author: {
        name: "أنت",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      content: replyText,
      date: "الآن",
      likes: 0,
    }

    // Add reply to comment
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply],
        }
      }
      return comment
    })

    setComments(updatedComments)
    setReplyText("")
    setReplyingTo(null)

    // Show success toast
    toast({
      title: "تم إضافة الرد",
      description: "تمت إضافة ردك بنجاح!",
    })
  }

  const toggleLike = (commentId: number) => {
    if (!isLoggedIn) {
      setShowLoginDialog(true)
      return
    }

    if (likedComments.includes(commentId)) {
      setLikedComments(likedComments.filter((id) => id !== commentId))
    } else {
      setLikedComments([...likedComments, commentId])

      // Show like toast
      toast({
        title: "تم الإعجاب",
        description: "تم تسجيل إعجابك بنجاح",
      })
    }
  }

  const handleLogin = () => {
    // Simulate login
    setIsLoggedIn(true)
    setShowLoginDialog(false)

    toast({
      title: "تم تسجيل الدخول",
      description: "أهلاً بك! يمكنك الآن التفاعل مع المحتوى",
    })
  }

  return (
    <>
      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8" id="comments">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>التعليقات</span>
            <Badge variant="outline" className="rounded-full bg-vintage-paper-dark/5 text-sm">
              {comments.length}
            </Badge>
          </CardTitle>
          <Button onClick={scrollToCommentInput} className="bg-vintage-accent hover:bg-vintage-accent/90 text-white">
            إضافة تعليق
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 mb-8">
            {comments.map((comment) => {
              const isLiked = likedComments.includes(comment.id)

              return (
                <div key={comment.id} className="border-b border-vintage-border pb-6 last:border-0">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 border border-vintage-border">
                      <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                      <AvatarFallback className="bg-vintage-paper-dark text-white">
                        {comment.author.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                      </div>
                      <p className="mb-3 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-0 h-auto ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
                          onClick={() => toggleLike(comment.id)}
                        >
                          <Heart className="h-4 w-4 mr-1" fill={isLiked ? "currentColor" : "none"} />
                          <span>{isLiked ? comment.likes + 1 : comment.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto text-muted-foreground"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          <span>رد</span>
                        </Button>
                      </div>

                      {replyingTo === comment.id && (
                        <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-4">
                          <Textarea
                            ref={replyInputRef}
                            placeholder={`الرد على ${comment.author.name}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="mb-3 min-h-20 border-vintage-border focus-visible:ring-vintage-accent"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                              disabled={!replyText.trim()}
                            >
                              <Send className="h-3 w-3 ml-1" />
                              إرسال
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-vintage-border"
                              onClick={() => setReplyingTo(null)}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </form>
                      )}

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3 pr-6 border-r-2 border-vintage-border">
                              <Avatar className="h-8 w-8 border border-vintage-border">
                                <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                                <AvatarFallback className="bg-vintage-paper-dark text-white">
                                  {reply.author.name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{reply.author.name}</span>
                                  {reply.author.isAdmin && (
                                    <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white text-xs py-0 px-1.5">
                                      الكاتب
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">{reply.date}</span>
                                </div>
                                <p className="mb-2 leading-relaxed">{reply.content}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`p-0 h-auto ${likedComments.includes(reply.id) ? "text-red-500" : "text-muted-foreground"}`}
                                  onClick={() => toggleLike(reply.id)}
                                >
                                  <Heart
                                    className="h-3 w-3 mr-1"
                                    fill={likedComments.includes(reply.id) ? "currentColor" : "none"}
                                  />
                                  <span>{likedComments.includes(reply.id) ? reply.likes + 1 : reply.likes}</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {comments.length === 0 && (
              <div className="text-center py-12 bg-vintage-paper-dark/5 rounded-lg">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">لا توجد تعليقات بعد</h3>
                <p className="text-muted-foreground">كن أول من يعلق على هذا المحتوى!</p>
              </div>
            )}
          </div>

          <div className="bg-vintage-paper-dark/5 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">أضف تعليقك</h3>
            <form onSubmit={handleCommentSubmit}>
              <Textarea
                ref={commentInputRef}
                placeholder="شاركنا رأيك حول هذا المحتوى..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-3 min-h-24 border-vintage-border focus-visible:ring-vintage-accent"
              />
              <Button
                type="submit"
                className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                disabled={!comment.trim()}
              >
                <Send className="h-4 w-4 ml-2" />
                إرسال التعليق
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Login Dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent className="border-vintage-border">
          <AlertDialogHeader>
            <AlertDialogTitle>تسجيل الدخول مطلوب</AlertDialogTitle>
            <AlertDialogDescription>
              يجب عليك تسجيل الدخول أولاً للتفاعل مع المحتوى وإضافة التعليقات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-vintage-border">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
              onClick={handleLogin}
            >
              تسجيل الدخول
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
