"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Reply, Send, AlertCircle, Loader2 } from "lucide-react"
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
import { useSession, signIn } from "next-auth/react"
import { getCommentsByContentId, createComment } from "@/lib/api-client"

export function Comments({ slug, contentId }: { slug: string; contentId: string }) {
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [likedComments, setLikedComments] = useState<string[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchComments() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getCommentsByContentId(contentId)
        setComments(data)
      } catch (err) {
        console.error("Error fetching comments:", err)
        setError("Failed to load comments. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (contentId) {
      fetchComments()
    }
  }, [contentId])

  // Scroll to comment input when user clicks "Add Comment" button
  const scrollToCommentInput = () => {
    if (!session) {
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      setShowLoginDialog(true)
      return
    }

    if (!comment.trim()) return

    try {
      const newComment = await createComment({
        contentId,
        content: comment,
      })

      // Add to comments if it's auto-approved (admin comments)
      if (newComment.status === "approved") {
        setComments([newComment, ...comments])
      } else {
        toast({
          title: "تم إرسال التعليق",
          description: "سيتم مراجعة تعليقك قبل نشره",
        })
      }

      setComment("")
    } catch (err) {
      console.error("Error creating comment:", err)
      toast({
        title: "حدث خطأ",
        description: "تعذر إرسال التعليق",
        variant: "destructive",
      })
    }
  }

  const handleReplySubmit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault()

    if (!session) {
      setShowLoginDialog(true)
      return
    }

    if (!replyText.trim() || replyingTo === null) return

    try {
      const newReply = await createComment({
        contentId,
        content: replyText,
        parentId: commentId,
      })

      // Add reply to comment if it's auto-approved (admin comments)
      if (newReply.status === "approved") {
        const updatedComments = comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          }
          return comment
        })

        setComments(updatedComments)
      } else {
        toast({
          title: "تم إرسال الرد",
          description: "سيتم مراجعة ردك قبل نشره",
        })
      }

      setReplyText("")
      setReplyingTo(null)
    } catch (err) {
      console.error("Error creating reply:", err)
      toast({
        title: "حدث خطأ",
        description: "تعذر إرسال الرد",
        variant: "destructive",
      })
    }
  }

  const toggleLike = (commentId: string) => {
    if (!session) {
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
    setShowLoginDialog(false)
    signIn("google")
  }

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8" id="comments">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>التعليقات</span>
            <Badge variant="outline" className="rounded-full bg-vintage-paper-dark/5 text-sm">
              0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-vintage-accent mb-2" />
            <p className="text-muted-foreground">جاري تحميل التعليقات...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If error, show error message
  if (error) {
    return (
      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8" id="comments">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>التعليقات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-2" />
            <h3 className="text-lg font-medium mb-1">حدث خطأ</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
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
              const isLiked = likedComments.includes(comment._id)

              return (
                <div key={comment._id} className="border-b border-vintage-border pb-6 last:border-0">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 border border-vintage-border">
                      <AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
                      <AvatarFallback className="bg-vintage-paper-dark text-white">
                        {comment.userName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <p className="mb-3 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-0 h-auto ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
                          onClick={() => toggleLike(comment._id)}
                        >
                          <Heart className="h-4 w-4 mr-1" fill={isLiked ? "currentColor" : "none"} />
                          <span>{isLiked ? comment.likes + 1 : comment.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto text-muted-foreground"
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          <span>رد</span>
                        </Button>
                      </div>

                      {replyingTo === comment._id && (
                        <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="mt-4">
                          <Textarea
                            ref={replyInputRef}
                            placeholder={`الرد على ${comment.userName}...`}
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
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {comment.replies.map((reply: any) => (
                            <div key={reply._id} className="flex gap-3 pr-6 border-r-2 border-vintage-border">
                              <Avatar className="h-8 w-8 border border-vintage-border">
                                <AvatarImage src={reply.userAvatar || "/placeholder.svg"} alt={reply.userName} />
                                <AvatarFallback className="bg-vintage-paper-dark text-white">
                                  {reply.userName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{reply.userName}</span>
                                  {reply.isAdmin && (
                                    <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white text-xs py-0 px-1.5">
                                      الكاتب
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(reply.createdAt).toLocaleDateString("ar-EG")}
                                  </span>
                                </div>
                                <p className="mb-2 leading-relaxed">{reply.content}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`p-0 h-auto ${
                                    likedComments.includes(reply._id) ? "text-red-500" : "text-muted-foreground"
                                  }`}
                                  onClick={() => toggleLike(reply._id)}
                                >
                                  <Heart
                                    className="h-3 w-3 mr-1"
                                    fill={likedComments.includes(reply._id) ? "currentColor" : "none"}
                                  />
                                  <span>{likedComments.includes(reply._id) ? reply.likes + 1 : reply.likes}</span>
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
                disabled={!comment.trim() || !session}
              >
                <Send className="h-4 w-4 ml-2" />
                {session ? "إرسال التعليق" : "سجل دخول للتعليق"}
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
