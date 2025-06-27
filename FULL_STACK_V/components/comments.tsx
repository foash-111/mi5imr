"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Reply, Send, AlertCircle, Loader2, Edit, Trash2, MoreHorizontal } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useSession, signIn } from "next-auth/react"
import { getCommentsByContentId, createComment, toggleCommentLike, checkCommentLikeStatus, updateCommentContent, deleteComment } from "@/lib/api-client"

export function Comments({ slug, contentId }: { slug: string; contentId: string }) {
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [likedComments, setLikedComments] = useState<string[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
	// const [isLiked, setIsLiked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  
  // Edit and delete states
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)
  const editInputRef = useRef<HTMLTextAreaElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchComments() {
      setIsLoading(true)
      setError(null)
      try {
        console.log("🔍 Fetching comments for contentId:", contentId)
        const data = await getCommentsByContentId(contentId)
        console.log("🔍 Comments fetched:", data)
				// check if user liked
				/* const { liked } = await checkCommentLikeStatus(contentId)
				setIsLiked(liked) */
        setComments(data)
				//const liked = data.filter((comment: any) => comment.isLiked).map((comment: any) => comment._id)
				const liked = [
        ...data.filter((comment: any) => comment.isLiked).map((comment: any) => comment._id),
        ...data.flatMap((comment: any) =>
          (comment.replies || []).filter((reply: any) => reply.isLiked).map((reply: any) => reply._id)
        ),
      ]
        setLikedComments(liked)
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

    console.log("🔍 Creating comment for contentId:", contentId)

    try {
      const newComment = await createComment({
        contentId,
        content: comment,
      })

      console.log("🔍 Comment created successfully:", newComment)

      // Add to comments (all comments are now auto-approved)
      setComments([newComment, ...comments])

      setComment("")
      
      toast({
        title: "تم إرسال التعليق",
        description: "تم إضافة تعليقك بنجاح",
      })
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

      // Add reply to comment (all replies are now auto-approved)
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

      setReplyText("")
      setReplyingTo(null)
      
      toast({
        title: "تم إرسال الرد",
        description: "تم إضافة ردك بنجاح",
      })
    } catch (err) {
      console.error("Error creating reply:", err)
      toast({
        title: "حدث خطأ",
        description: "تعذر إرسال الرد",
        variant: "destructive",
      })
    }
  }

  const toggleLike = async (commentId: string) => {
    if (!session) {
      setShowLoginDialog(true)
      return
    }
		try {
			const { liked } = await toggleCommentLike(commentId)
			setLikedComments((prev) =>
        liked ? [...prev, commentId] : prev.filter((id) => id !== commentId)
      )			
			setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? { ...comment, likes: liked ? comment.likes : comment.likes }
            : comment
        )
      )

      toast({
        title: liked ? "تم الإعجاب" : "تم إلغاء الإعجاب",
        description: liked
          ? "تم تسجيل إعجابك بالتعليق بنجاح"
          : "تم إلغاء إعجابك بالتعليق",
      })
		} catch (err) {
			console.error("Error toggling like:", err);
			toast({
				title: "حدث خطأ",
				description: "تعذر تحديث حالة الإعجاب",
				variant: "destructive",
			});
		}
  }

  const handleLogin = () => {
    setShowLoginDialog(false)
    signIn("google")
  }

  // Edit comment handlers
  const startEditingComment = (commentId: string, currentContent: string) => {
    if (!session) {
      setShowLoginDialog(true)
      return
    }
    setEditingComment(commentId)
    setEditText(currentContent)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditText("")
  }

  const handleEditSubmit = async (commentId: string) => {
    if (!editText.trim()) return

    try {
      await updateCommentContent(commentId, editText)
      
      // Update the comment in the local state (handle both comments and replies)
      setComments(prevComments => 
        prevComments.map(comment => {
          // Check if this is the main comment being edited
          if (comment._id === commentId) {
            return { ...comment, content: editText }
          }
          // Check if this is a reply being edited
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply: any) =>
                reply._id === commentId ? { ...reply, content: editText } : reply
              )
            }
          }
          return comment
        })
      )

      setEditingComment(null)
      setEditText("")
      
      toast({
        title: "تم تحديث التعليق",
        description: "تم تحديث تعليقك بنجاح",
      })
    } catch (err) {
      console.error("Error updating comment:", err)
      toast({
        title: "حدث خطأ",
        description: "تعذر تحديث التعليق",
        variant: "destructive",
      })
    }
  }

  // Delete comment handlers
  const confirmDeleteComment = (commentId: string) => {
    if (!session) {
      setShowLoginDialog(true)
      return
    }
    setCommentToDelete(commentId)
    setShowDeleteDialog(true)
  }

  const handleDeleteComment = async () => {
    if (!commentToDelete) return

    try {
      await deleteComment(commentToDelete)
      
      // Remove the comment from local state (handle both comments and replies)
      setComments(prevComments => 
        prevComments.map(comment => {
          // If this is the main comment being deleted, filter it out
          if (comment._id === commentToDelete) {
            return null // This will be filtered out
          }
          // If this is a reply being deleted, remove it from replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter((reply: any) => reply._id !== commentToDelete)
            }
          }
          return comment
        }).filter(Boolean) // Remove null entries
      )

      setShowDeleteDialog(false)
      setCommentToDelete(null)
      
      toast({
        title: "تم حذف التعليق",
        description: "تم حذف التعليق بنجاح",
      })
    } catch (err) {
      console.error("Error deleting comment:", err)
      toast({
        title: "حدث خطأ",
        description: "تعذر حذف التعليق",
        variant: "destructive",
      })
    }
  }

  // Check if user can edit/delete a comment or reply
  const canUserModifyComment = (comment: any) => {
    if (!session?.user) return false
    const userId = session.user.id || session.user._id
    // Check by userId (preferred), fallback to email for legacy data
    return (
      comment.userId === userId ||
      comment.userId?.toString() === userId?.toString() ||
      comment.user?._id === userId ||
      comment.user?._id?.toString() === userId?.toString() ||
      comment.userEmail === session.user.email ||
      (session.user as any)?.isAdmin === true
    )
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
                        {comment.userName ? comment.userName.substring(0, 2) : "؟"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                        {canUserModifyComment(comment) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEditingComment(comment._id, comment.content)}>
                                <Edit className="h-3 w-3 ml-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => confirmDeleteComment(comment._id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-3 w-3 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {editingComment === comment._id ? (
                        <div className="mb-3">
                          <Textarea
                            ref={editInputRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="mb-3 min-h-20 border-vintage-border focus-visible:ring-vintage-accent"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                              onClick={() => handleEditSubmit(comment._id)}
                              disabled={!editText.trim()}
                            >
                              <Send className="h-3 w-3 ml-1" />
                              حفظ
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-vintage-border"
                              onClick={cancelEditing}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="mb-3 leading-relaxed">{comment.content ? comment.content.substring(0, 50) : ""}</p>
                      )}
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
                                  {typeof reply.userName === "string" ? reply.userName.substring(0, 2) : "؟"}
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
                                  {canUserModifyComment(reply) && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => startEditingComment(reply._id, reply.content)}>
                                          <Edit className="h-3 w-3 ml-2" />
                                          تعديل
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => confirmDeleteComment(reply._id)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="h-3 w-3 ml-2" />
                                          حذف
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                                {editingComment === reply._id ? (
                                  <div className="mb-2">
                                    <Textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="mb-2 min-h-16 border-vintage-border focus-visible:ring-vintage-accent text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        className="bg-vintage-accent hover:bg-vintage-accent/90 text-white text-xs"
                                        onClick={() => handleEditSubmit(reply._id)}
                                        disabled={!editText.trim()}
                                      >
                                        <Send className="h-3 w-3 ml-1" />
                                        حفظ
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-vintage-border text-xs"
                                        onClick={cancelEditing}
                                      >
                                        إلغاء
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="mb-2 leading-relaxed">{reply.content ? reply.content.substring(0, 50) : ""}</p>
                                )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-vintage-border">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-vintage-border">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteComment}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
