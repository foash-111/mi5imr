"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlusCircle,
  FileEdit,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  Eye,
  ThumbsUp,
  FileText,
  BookOpen,
  Music,
  Video,
  Mic,
  Coffee,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

// Types
interface ContentType {
  _id: string
  name: string
  label: string
  icon: string
}

interface Category {
  _id: string
  name: string
  label: string
  isDefault: boolean
}

interface ContentItem {
  _id: string
  title: string
  excerpt: string
  slug: string
  coverImage?: string
  contentType: {
    _id: string
    name: string
    label: string
    icon: string
  }
  categories: Array<{
    _id: string
    name: string
    label: string
    isDefault: boolean
  }>
  author: {
    _id: string
    name: string
    avatar?: string
  }
  published: boolean
  featured: boolean
  viewCount: number
  likesCount: number
  commentsCount: number
  createdAt: string
  updatedAt: string
}

interface Comment {
  _id: string
  content: string
  userName: string
  createdAt: string
  contentId: string
  contentTitle: string
  status: "pending" | "approved" | "rejected"
}

interface User {
  _id: string
  name: string
  email: string
  isAdmin: boolean
  createdAt: string
}

// Icon mapping for content types
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    FileText,
    BookOpen,
    Music,
    Video,
    Coffee,
    Mic,
  }
  return iconMap[iconName] || FileText
}

export default function AdminDashboardPage() {
  const { toast } = useToast()

  // State
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Loading states
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>("all")
  const [typeFilter, setTypeFilter] = useState<string | null>("all")

  // Fetch data on component mount
  useEffect(() => {
    fetchContentTypes()
    fetchCategories()
    fetchContent()
    fetchComments()
    fetchUsers()
  }, [])

  const fetchContentTypes = async () => {
    try {
      const response = await fetch("/api/content-types")
      if (response.ok) {
        const data = await response.json()
        setContentTypes(data)
      }
    } catch (error) {
      console.error("Error fetching content types:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchContent = async () => {
    try {
      setIsLoadingContent(true)
      const response = await fetch("/api/content?published=all&limit=50")
      if (response.ok) {
        const data = await response.json()
        setContentItems(data)
      }
    } catch (error) {
      console.error("Error fetching content:", error)
      toast({
        title: "خطأ في تحميل المحتوى",
        description: "تعذر تحميل المحتوى",
        variant: "destructive",
      })
    } finally {
      setIsLoadingContent(false)
    }
  }

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true)
      const response = await fetch("/api/comments?status=all")
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Filter content based on search query and filters
  const filteredContent = contentItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && item.published) ||
      (statusFilter === "draft" && !item.published)

    const matchesType = typeFilter === "all" || item.contentType.name === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate statistics
  const totalViews = contentItems.reduce((total, item) => total + item.viewCount, 0)
  const totalLikes = contentItems.reduce((total, item) => total + item.likesCount, 0)
  const totalComments = contentItems.reduce((total, item) => total + item.commentsCount, 0)
  const publishedCount = contentItems.filter((item) => item.published).length
  const draftCount = contentItems.filter((item) => !item.published).length
  const pendingComments = comments.filter((comment) => comment.status === "pending").length

  // Handle content actions
  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المحتوى؟")) return

    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setContentItems(contentItems.filter((item) => item._id !== contentId))
        toast({
          title: "تم حذف المحتوى",
          description: "تم حذف المحتوى بنجاح",
        })
      } else {
        throw new Error("Failed to delete content")
      }
    } catch (error) {
      console.error("Error deleting content:", error)
      toast({
        title: "خطأ في حذف المحتوى",
        description: "تعذر حذف المحتوى",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublish = async (contentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !currentStatus }),
      })

      if (response.ok) {
        setContentItems(
          contentItems.map((item) => (item._id === contentId ? { ...item, published: !currentStatus } : item)),
        )
        toast({
          title: currentStatus ? "تم إلغاء النشر" : "تم النشر",
          description: currentStatus ? "تم إلغاء نشر المحتوى" : "تم نشر المحتوى بنجاح",
        })
      } else {
        throw new Error("Failed to toggle publish status")
      }
    } catch (error) {
      console.error("Error toggling publish status:", error)
      toast({
        title: "خطأ في تغيير حالة النشر",
        description: "تعذر تغيير حالة النشر",
        variant: "destructive",
      })
    }
  }

  const handleApproveComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      })

      if (response.ok) {
        setComments(
          comments.map((comment) =>
            comment._id === commentId ? { ...comment, status: "approved" as const } : comment,
          ),
        )
        toast({
          title: "تم اعتماد التعليق",
          description: "تم اعتماد التعليق بنجاح",
        })
      } else {
        throw new Error("Failed to approve comment")
      }
    } catch (error) {
      console.error("Error approving comment:", error)
      toast({
        title: "خطأ في اعتماد التعليق",
        description: "تعذر اعتماد التعليق",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments(comments.filter((comment) => comment._id !== commentId))
        toast({
          title: "تم حذف التعليق",
          description: "تم حذف التعليق بنجاح",
        })
      } else {
        throw new Error("Failed to delete comment")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "خطأ في حذف التعليق",
        description: "تعذر حذف التعليق",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">لوحة تحكم الإدارة</h1>
              <p className="text-muted-foreground">مرحباً بك في لوحة تحكم منصة مخيمر</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/create">
                <Button className="bg-vintage-accent hover:bg-vintage-accent/90 text-white">
                  <PlusCircle className="h-4 w-4 ml-2" />
                  إنشاء محتوى جديد
                </Button>
              </Link>
              <Button variant="outline" className="border-vintage-border">
                <Settings className="h-4 w-4 ml-2" />
                الإعدادات
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="border-vintage-border   backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-vintage-accent/10 flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-5 w-5 text-vintage-accent" />
                </div>
                <div className="text-2xl font-bold">{contentItems.length}</div>
                <p className="text-xs text-muted-foreground">إجمالي المحتوى</p>
              </CardContent>
            </Card>
            <Card className="border-vintage-border   backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold">{publishedCount}</div>
                <p className="text-xs text-muted-foreground">منشور</p>
              </CardContent>
            </Card>
            <Card className="border-vintage-border   backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-2xl font-bold">{draftCount}</div>
                <p className="text-xs text-muted-foreground">مسودة</p>
              </CardContent>
            </Card>
            <Card className="border-vintage-border   backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">{totalViews}</div>
                <p className="text-xs text-muted-foreground">مشاهدة</p>
              </CardContent>
            </Card>
            <Card className="border-vintage-border   backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                  <ThumbsUp className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold">{totalLikes}</div>
                <p className="text-xs text-muted-foreground">إعجاب</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full bg-vintage-paper-dark/10 p-0 h-auto">
              <TabsTrigger
                value="content"
                className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none"
              >
                <FileText className="h-4 w-4 ml-2" />
                المحتوى
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none relative"
              >
                <MessageSquare className="h-4 w-4 ml-2" />
                التعليقات
                {pendingComments > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white">
                    {pendingComments}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none"
              >
                <Users className="h-4 w-4 ml-2" />
                المستخدمين
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none"
              >
                <BarChart3 className="h-4 w-4 ml-2" />
                الإحصائيات
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="mt-6">
              <Card className="border-vintage-border   backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-vintage-paper-dark/5 pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-xl">إدارة المحتوى</CardTitle>
                    <div className="flex flex-col md:flex-row gap-2">
                      <div className="relative">
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="بحث في المحتوى..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-9 border-vintage-border focus-visible:ring-vintage-accent md:w-60"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={statusFilter || "all"}
                          onValueChange={(value) => setStatusFilter(value || "all")}
                        >
                          <SelectTrigger className="border-vintage-border w-full md:w-40">
                            <SelectValue placeholder="الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الحالات</SelectItem>
                            <SelectItem value="published">منشور</SelectItem>
                            <SelectItem value="draft">مسودة</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value || "all")}>
                          <SelectTrigger className="border-vintage-border w-full md:w-40">
                            <SelectValue placeholder="النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الأنواع</SelectItem>
                            {contentTypes.map((type) => (
                              <SelectItem key={type._id} value={type.name}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingContent ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin ml-2" />
                      <span>جاري تحميل المحتوى...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-vintage-border bg-vintage-paper-dark/5">
                            <th className="py-3 px-4 text-right font-medium">العنوان</th>
                            <th className="py-3 px-4 text-right font-medium">النوع</th>
                            <th className="py-3 px-4 text-right font-medium">التصنيفات</th>
                            <th className="py-3 px-4 text-right font-medium">التاريخ</th>
                            <th className="py-3 px-4 text-right font-medium">الحالة</th>
                            <th className="py-3 px-4 text-right font-medium">المشاهدات</th>
                            <th className="py-3 px-4 text-right font-medium">الإعجابات</th>
                            <th className="py-3 px-4 text-right font-medium">التعليقات</th>
                            <th className="py-3 px-4 text-right font-medium">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredContent.map((item) => {
                            const ItemIcon = getIconComponent(item.contentType.icon)
                            return (
                              <tr
                                key={item._id}
                                className="border-b border-vintage-border hover:bg-vintage-paper-dark/5"
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-16 rounded overflow-hidden flex-shrink-0">
                                      <Image
                                        src={item.coverImage || "/placeholder.svg?height=40&width=64"}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-medium truncate">{item.title}</div>
                                      <div className="text-xs text-muted-foreground truncate">{item.excerpt}</div>
                                      {item.featured && (
                                        <Badge className="mt-1 bg-yellow-100 text-yellow-800 text-xs">مميز</Badge>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1">
                                    <ItemIcon className="h-3 w-3 text-vintage-accent" />
                                    <span className="text-sm">{item.contentType.label}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap gap-1">
                                    {item.categories.slice(0, 2).map((category) => (
                                      <Badge key={category._id} variant="outline" className="text-xs">
                                        {category.label}
                                      </Badge>
                                    ))}
                                    {item.categories.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{item.categories.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                                </td>
                                <td className="py-3 px-4">
                                  {item.published ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      منشور
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">
                                      <Clock className="h-3 w-3 mr-1" />
                                      مسودة
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm">{item.viewCount}</td>
                                <td className="py-3 px-4 text-sm">{item.likesCount}</td>
                                <td className="py-3 px-4 text-sm">{item.commentsCount}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1">
                                    <Link href={`/content/${item.slug}`}>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <ArrowUpRight className="h-4 w-4" />
                                        <span className="sr-only">عرض</span>
                                      </Button>
                                    </Link>
                                    <Link href={`/admin/edit/${item._id}`}>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <FileEdit className="h-4 w-4" />
                                        <span className="sr-only">تعديل</span>
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleTogglePublish(item._id, item.published)}
                                    >
                                      {item.published ? (
                                        <Clock className="h-4 w-4 text-amber-500" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      )}
                                      <span className="sr-only">{item.published ? "إلغاء النشر" : "نشر"}</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-500"
                                      onClick={() => handleDeleteContent(item._id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">حذف</span>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {filteredContent.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">لم يتم العثور على نتائج مطابقة لبحثك.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="mt-6">
              <Card className="border-vintage-border   backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-vintage-paper-dark/5 pb-3">
                  <CardTitle className="text-xl">إدارة التعليقات</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {isLoadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin ml-2" />
                      <span>جاري تحميل التعليقات...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div
                          key={comment._id}
                          className={`p-4 border ${
                            comment.status === "pending"
                              ? "border-amber-200 bg-amber-50"
                              : comment.status === "approved"
                                ? "border-green-200 bg-green-50"
                                : "border-red-200 bg-red-50"
                          } rounded-md`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{comment.userName}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString("ar-EG")} • على "{comment.contentTitle}"
                              </div>
                            </div>
                            <Badge
                              className={
                                comment.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : comment.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {comment.status === "approved"
                                ? "معتمد"
                                : comment.status === "pending"
                                  ? "قيد المراجعة"
                                  : "مرفوض"}
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{comment.content}</p>
                          <div className="flex gap-2">
                            {comment.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleApproveComment(comment._id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                اعتماد
                              </Button>
                            )}
                            <Link href={`/content/${comment.contentId}`}>
                              <Button variant="outline" size="sm" className="border-vintage-border">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                عرض المحتوى
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-vintage-border text-red-500"
                              onClick={() => handleDeleteComment(comment._id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">لا توجد تعليقات.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-6">
              <Card className="border-vintage-border   backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-vintage-paper-dark/5 pb-3">
                  <CardTitle className="text-xl">إدارة المستخدمين</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin ml-2" />
                      <span>جاري تحميل المستخدمين...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-vintage-border bg-vintage-paper-dark/5">
                            <th className="py-3 px-4 text-right font-medium">المستخدم</th>
                            <th className="py-3 px-4 text-right font-medium">البريد الإلكتروني</th>
                            <th className="py-3 px-4 text-right font-medium">الدور</th>
                            <th className="py-3 px-4 text-right font-medium">تاريخ الانضمام</th>
                            <th className="py-3 px-4 text-right font-medium">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user._id} className="border-b border-vintage-border hover:bg-vintage-paper-dark/5">
                              <td className="py-3 px-4 font-medium">{user.name}</td>
                              <td className="py-3 px-4 text-sm">{user.email}</td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={
                                    user.isAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                  }
                                >
                                  {user.isAdmin ? "مدير" : "مستخدم"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <FileEdit className="h-4 w-4" />
                                    <span className="sr-only">تعديل</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {users.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">لا توجد مستخدمين.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-vintage-border   backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">إحصائيات المحتوى</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span>المشاهدات</span>
                          <span className="font-medium">{totalViews}</span>
                        </div>
                        <Progress
                          value={Math.min((totalViews / Math.max(totalViews, 1000)) * 100, 100)}
                          className="h-2 bg-vintage-paper-dark/10"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span>الإعجابات</span>
                          <span className="font-medium">{totalLikes}</span>
                        </div>
                        <Progress
                          value={Math.min((totalLikes / Math.max(totalLikes, 500)) * 100, 100)}
                          className="h-2 bg-vintage-paper-dark/10"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span>التعليقات</span>
                          <span className="font-medium">{totalComments}</span>
                        </div>
                        <Progress
                          value={Math.min((totalComments / Math.max(totalComments, 200)) * 100, 100)}
                          className="h-2 bg-vintage-paper-dark/10"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span>معدل التفاعل</span>
                          <span className="font-medium">
                            {contentItems.length > 0
                              ? Math.round(((totalLikes + totalComments) / contentItems.length) * 100) / 100
                              : 0}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            contentItems.length > 0
                              ? Math.min(((totalLikes + totalComments) / contentItems.length) * 10, 100)
                              : 0
                          }
                          className="h-2 bg-vintage-paper-dark/10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-vintage-border   backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">توزيع المحتوى</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-vintage-paper-dark/5 p-4 rounded-md text-center">
                          <div className="text-3xl font-bold text-vintage-accent">{publishedCount}</div>
                          <div className="text-sm text-muted-foreground">منشور</div>
                        </div>
                        <div className="bg-vintage-paper-dark/5 p-4 rounded-md text-center">
                          <div className="text-3xl font-bold text-amber-500">{draftCount}</div>
                          <div className="text-sm text-muted-foreground">مسودة</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">توزيع أنواع المحتوى</div>
                        <div className="space-y-2">
                          {contentTypes.map((type) => {
                            const typeCount = contentItems.filter((item) => item.contentType.name === type.name).length
                            const percentage = contentItems.length > 0 ? (typeCount / contentItems.length) * 100 : 0
                            const TypeIcon = getIconComponent(type.icon)

                            return (
                              <div key={type._id}>
                                <div className="flex justify-between items-center mb-1 text-xs">
                                  <span className="flex items-center gap-1">
                                    <TypeIcon className="h-3 w-3" /> {type.label}
                                  </span>
                                  <span>
                                    {typeCount} ({Math.round(percentage)}%)
                                  </span>
                                </div>
                                <Progress value={percentage} className="h-1.5 bg-vintage-paper-dark/10" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
