"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Eye, 
  Heart, 
  MessageSquare, 
  Star,
  Edit,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Calendar
} from "lucide-react"
import { getPaginatedContent, deleteContent } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface ContentWithStats {
  _id: string
  title: string
  slug: string
  excerpt?: string
  coverImage?: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  contentType: {
    _id: string
    name: string
    label: string
    icon: string
  }
  published: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
  detailedStats: {
    totalViews: number
    totalLikes: number
    totalComments: number
    engagementRate: number
  }
  viewCount: number
  likesCount: number
  commentsCount: number
}

export default function ContentTab() {
  const { toast } = useToast()
  
  // State for content management
  const [content, setContent] = useState<ContentWithStats[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentSearch, setContentSearch] = useState("")
  const [contentSort, setContentSort] = useState("createdAt")
  const [contentOrder, setContentOrder] = useState<"asc"|"desc">("desc")
  const [contentFilter, setContentFilter] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 20

  // State for content modal
  const [selectedContent, setSelectedContent] = useState<ContentWithStats | null>(null)
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch paginated content data
  useEffect(() => {
    async function fetchContent() {
      setLoading(true)
      try {
        const { content: contentRes, totalCount } = await getPaginatedContent({ limit: pageSize, skip: (page - 1) * pageSize })
        setContent(contentRes)
        setTotalCount(totalCount)
        if (!Array.isArray(contentRes) || contentRes.length === 0) {
          toast({ title: "تنبيه", description: "لم يتم جلب أي محتوى من قاعدة البيانات.", variant: "destructive" })
        }
      } catch (error) {
        console.error("Error fetching content:", error)
        setError("فشل في تحميل بيانات المحتوى")
        toast({ title: "خطأ في جلب المحتوى", description: String(error), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [page])

  // Filtered data
  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
                         (item.author?.name?.toLowerCase().includes(contentSearch.toLowerCase()) ?? false)
    const matchesFilter = contentFilter === "all" ||
                         (contentFilter === "published" && item.published) ||
                         (contentFilter === "draft" && !item.published) ||
                         (contentFilter === "featured" && item.featured)
    return matchesSearch && matchesFilter
  })

  // Filter and sort content
  const filteredContentSorted = filteredContent
    .sort((a, b) => {
      let aValue: any, bValue: any
      switch (contentSort) {
        case "title": aValue = a.title; bValue = b.title; break
        case "author": aValue = a.author?.name; bValue = b.author?.name; break
        case "createdAt": aValue = new Date(a.createdAt); bValue = new Date(b.createdAt); break
        case "views": aValue = a.detailedStats?.totalViews; bValue = b.detailedStats?.totalViews; break
        case "likes": aValue = a.detailedStats?.totalLikes; bValue = b.detailedStats?.totalLikes; break
        case "comments": aValue = a.detailedStats?.totalComments; bValue = b.detailedStats?.totalComments; break
        case "engagement": aValue = a.detailedStats?.engagementRate; bValue = b.detailedStats?.engagementRate; break
        default: aValue = new Date(a.createdAt); bValue = new Date(b.createdAt)
      }
      return contentOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })

  const openContentModal = (item: ContentWithStats) => {
    setSelectedContent(item)
    setContentModalOpen(true)
  }

  const closeContentModal = () => {
    setSelectedContent(null)
    setContentModalOpen(false)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%'
  }

  // Helper function to calculate engagement rate
  function calcEngagementRate(likes: number, comments: number, views: number) {
    return ((likes + comments) / Math.max(views, 1)) * 100;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-vintage-ink">إدارة المحتوى</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredContentSorted.length} من {totalCount} محتوى
          </Badge>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في المحتوى..."
            value={contentSearch}
            onChange={(e) => setContentSearch(e.target.value)}
            className="pl-10 border-vintage-border"
          />
        </div>
        <Select value={contentFilter} onValueChange={setContentFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-vintage-border">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="تصفية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المحتوى</SelectItem>
            <SelectItem value="published">المنشور</SelectItem>
            <SelectItem value="draft">المسودات</SelectItem>
            <SelectItem value="featured">المميز</SelectItem>
          </SelectContent>
        </Select>
        <Select value={contentSort} onValueChange={setContentSort}>
          <SelectTrigger className="w-full sm:w-[180px] border-vintage-border">
            {contentOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />}
            <SelectValue placeholder="ترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
            <SelectItem value="title">العنوان</SelectItem>
            <SelectItem value="author">الكاتب</SelectItem>
            <SelectItem value="views">المشاهدات</SelectItem>
            <SelectItem value="likes">الإعجابات</SelectItem>
            <SelectItem value="comments">التعليقات</SelectItem>
            <SelectItem value="engagement">معدل التفاعل</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setContentOrder(contentOrder === "asc" ? "desc" : "asc")}
          className="border-vintage-border"
        >
          {contentOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg border border-vintage-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-vintage-paper-dark/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  المحتوى
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  الكاتب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  الإحصائيات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-vintage-border">
              {filteredContentSorted.map((item) => {
                if (!item || !item._id) {
                  return (
                    <tr key={Math.random()}>
                      <td colSpan={6} className="text-center text-muted-foreground">
                        بيانات غير مكتملة لهذا الصف
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr 
                    key={item._id} 
                    className="hover:bg-vintage-paper-dark/10 cursor-pointer transition-colors"
                    onClick={() => openContentModal(item)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {item.coverImage ? (
                            <img className="h-12 w-12 rounded-lg object-cover" src={item.coverImage} alt={item.title} />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-vintage-accent/20 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-vintage-accent" />
                            </div>
                          )}
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-vintage-ink">{item.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2 max-w-xs break-words">{item.excerpt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-vintage-accent/20 flex items-center justify-center">
                            {item.author?.avatar ? (
                              <img className="h-8 w-8 rounded-full" src={item.author.avatar} alt={item.author?.name || '—'} />
                            ) : (
                              <span className="text-vintage-accent font-semibold text-sm">
                                {item.author?.name ? item.author.name.charAt(0).toUpperCase() : '—'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mr-3">
                          <div className="text-sm font-medium text-vintage-ink">{item.author?.name || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {item.contentType?.label || '—'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-vintage-ink">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(item.viewCount || 0)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {formatNumber(item.likesCount || 0)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {formatNumber(item.commentsCount || 0)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.published ? (
                          <Badge className="bg-green-100 text-green-800">
                            منشور
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            مسودة
                          </Badge>
                        )}
                        {item.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 ml-1" />
                            مميز
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-vintage-ink">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls at the end of the content list/table */}
      <div className="flex justify-center gap-4 mt-8">
       
        <Button
            variant="outline"
						onClick={() => setPage(page - 1)}
						disabled={page === 1}
					>
						السابق
        </Button>

        <span className="px-2 py-1 text-sm">صفحة {page} من {Math.ceil(totalCount / pageSize) || 1}</span>

 <Button
					variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil(totalCount / pageSize)}
        >
          التالي
        </Button>
      </div>

      {/* Content Modal */}
      <Dialog open={contentModalOpen} onOpenChange={setContentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المحتوى</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {selectedContent.coverImage && (
                  <img 
                    className="h-24 w-24 rounded-lg object-cover" 
                    src={selectedContent.coverImage} 
                    alt={selectedContent.title} 
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-vintage-ink">{selectedContent.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedContent.excerpt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedContent.contentType.label}</Badge>
                    {selectedContent.published ? (
                      <Badge className="bg-green-100 text-green-800">منشور</Badge>
                    ) : (
                      <Badge variant="outline">مسودة</Badge>
                    )}
                    {selectedContent.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 ml-1" />
                        مميز
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-vintage-ink mb-2">الكاتب</h4>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-vintage-accent/20 flex items-center justify-center">
                      {selectedContent.author?.avatar ? (
                        <img className="h-8 w-8 rounded-full" src={selectedContent.author.avatar} alt={selectedContent.author?.name || '—'} />
                      ) : (
                        <span className="text-vintage-accent font-semibold text-sm">
                          {selectedContent.author?.name ? selectedContent.author.name.charAt(0).toUpperCase() : '—'}
                        </span>
                      )}
                    </div>
                    <span className="text-sm">{selectedContent.author?.name || '—'}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-vintage-ink mb-2">التاريخ</h4>
                  <div className="text-sm text-muted-foreground">
                    <div>إنشاء: {new Date(selectedContent.createdAt).toLocaleDateString("ar-EG")}</div>
                    <div>تحديث: {new Date(selectedContent.updatedAt).toLocaleDateString("ar-EG")}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-vintage-ink mb-2">الإحصائيات</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-vintage-paper-dark/20 rounded-lg">
                    <div className="text-lg font-bold text-vintage-ink">{formatNumber(selectedContent.viewCount || 0)}</div>
                    <div className="text-xs text-muted-foreground">مشاهدة</div>
                  </div>
                  <div className="text-center p-3 bg-vintage-paper-dark/20 rounded-lg">
                    <div className="text-lg font-bold text-vintage-ink">{formatNumber(selectedContent.likesCount || 0)}</div>
                    <div className="text-xs text-muted-foreground">إعجاب</div>
                  </div>
                  <div className="text-center p-3 bg-vintage-paper-dark/20 rounded-lg">
                    <div className="text-lg font-bold text-vintage-ink">{formatNumber(selectedContent.commentsCount || 0)}</div>
                    <div className="text-xs text-muted-foreground">تعليق</div>
                  </div>
                  <div className="text-center p-3 bg-vintage-paper-dark/20 rounded-lg">
                    <div className="text-lg font-bold text-vintage-ink">
                      {selectedContent ?
                        formatPercentage(calcEngagementRate(selectedContent.likesCount || 0, selectedContent.commentsCount || 0, selectedContent.viewCount || 0))
                        : '0.0%'}
                    </div>
                    <div className="text-xs text-muted-foreground">تفاعل</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 flex flex-row gap-2">
            <Button variant="outline" onClick={closeContentModal}>إغلاق</Button>
            {selectedContent && (
              <Link href={`/content/${selectedContent.slug}`} passHref legacyBehavior>
                <Button variant="secondary" asChild>
                  <a target="_blank">
                    <ExternalLink className="h-4 w-4 ml-2" />
                    عرض المحتوى
                  </a>
                </Button>
              </Link>
            )}
            {selectedContent && (
              <Link href={`/admin/edit/${selectedContent._id}`} passHref legacyBehavior>
                <Button variant="default" asChild>
                  <a>
                    <Edit className="h-4 w-4 ml-2" />
                    تعديل
                  </a>
                </Button>
              </Link>
            )}
            {selectedContent && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
              >
                حذف
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showDeleteConfirm && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
            </DialogHeader>
            <div className="py-4">هل أنت متأكد أنك تريد حذف هذا المحتوى؟ لا يمكن التراجع عن هذا الإجراء.</div>
            <DialogFooter className="flex flex-row gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>إلغاء</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  setDeleting(true)
                  try {
                    await deleteContent(selectedContent?._id || '')
                    setShowDeleteConfirm(false)
                    setContentModalOpen(false)
                    toast({ title: "تم الحذف", description: "تم حذف المحتوى بنجاح." })
                    // Refresh content list
                    const { content: contentRes, totalCount } = await getPaginatedContent({ limit: pageSize, skip: (page - 1) * pageSize })
                    setContent(contentRes)
                    setTotalCount(totalCount)
                  } catch (error) {
                    toast({ title: "خطأ في الحذف", description: String(error), variant: "destructive" })
                  } finally {
                    setDeleting(false)
                  }
                }}
                disabled={deleting}
              >
                {deleting ? "جاري الحذف..." : "تأكيد الحذف"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
