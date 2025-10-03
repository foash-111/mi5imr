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
  CheckCircle,
  XCircle,
  Archive,
  Reply,
  Trash2,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Calendar,
  MessageSquare
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Feedback {
  _id: string
  name: string
  email: string
  role: string
  message: string
  status: "pending" | "approved" | "replied" | "archived"
  isPublic: boolean
  createdAt: string
  updatedAt: string
  adminNotes?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function FeedbackTab() {
  const { toast } = useToast()
  
  // State for feedback management
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedbackSearch, setFeedbackSearch] = useState("")
  const [feedbackFilter, setFeedbackFilter] = useState("all")
  const [feedbackSort, setFeedbackSort] = useState("createdAt")
  const [feedbackOrder, setFeedbackOrder] = useState<"asc"|"desc">("desc")

  // State for feedback modal
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)

  // Fetch feedback data
  useEffect(() => {
    async function fetchFeedback() {
      setLoading(true)
      try {
        const feedbackRes = await fetcher("/api/feedback")
        setFeedback(feedbackRes)
        console.debug("Fetched feedback:", feedbackRes)
        if (!Array.isArray(feedbackRes) || feedbackRes.length === 0) {
          toast({ title: "تنبيه", description: "لم يتم جلب أي آراء من قاعدة البيانات.", variant: "destructive" })
        }
      } catch (error) {
        console.error("Error fetching feedback:", error)
        setError("فشل في تحميل بيانات الآراء")
        toast({ title: "خطأ في جلب الآراء", description: String(error), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchFeedback()
  }, [])

  // Filtered data
  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                         item.message.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                         item.role.toLowerCase().includes(feedbackSearch.toLowerCase())
    const matchesFilter = feedbackFilter === "all" ||
                         (feedbackFilter === "pending" && item.status === "pending") ||
                         (feedbackFilter === "approved" && item.status === "approved") ||
                         (feedbackFilter === "replied" && item.status === "replied") ||
                         (feedbackFilter === "archived" && item.status === "archived")
    return matchesSearch && matchesFilter
  })

  // Filter and sort feedback
  const filteredFeedbackSorted = filteredFeedback
    .sort((a, b) => {
      let aValue: any, bValue: any
      switch (feedbackSort) {
        case "name": aValue = a.name; bValue = b.name; break
        case "email": aValue = a.email; bValue = b.email; break
        case "role": aValue = a.role; bValue = b.role; break
        case "createdAt": aValue = new Date(a.createdAt); bValue = new Date(b.createdAt); break
        case "status": aValue = a.status; bValue = b.status; break
        default: aValue = new Date(a.createdAt); bValue = new Date(b.createdAt)
      }
      return feedbackOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })

  const openFeedbackModal = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setFeedbackModalOpen(true)
  }

  const closeFeedbackModal = async () => {
    setFeedbackModalOpen(false)
    setSelectedFeedback(null)
    await fetchFeedback()
  }

  const fetchFeedback = async () => {
    try {
      const feedbackRes = await fetcher("/api/feedback")
      setFeedback(feedbackRes)
    } catch (error) {
      toast({ title: "فشل في تحديث البيانات", variant: "destructive" })
    }
  }

  const handleArchiveFeedback = async () => {
    if (!selectedFeedback) return
    try {
      await fetch(`/api/feedback/${selectedFeedback._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" })
      })
      setSelectedFeedback({ ...selectedFeedback, status: "archived" })
      toast({ title: "تم أرشفة الرأي", variant: "default" })
      await closeFeedbackModal()
    } catch {
      toast({ title: "فشل في الأرشفة", variant: "destructive" })
    }
  }

  const handleApproveFeedback = async () => {
    if (!selectedFeedback) return
    try {
      await fetch(`/api/feedback/${selectedFeedback._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", isPublic: true })
      })
      setSelectedFeedback({ ...selectedFeedback, status: "approved", isPublic: true })
      toast({ title: "تمت الموافقة على الرأي", variant: "default" })
      await closeFeedbackModal()
    } catch {
      toast({ title: "فشل في الموافقة", variant: "destructive" })
    }
  }

  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return
    try {
      await fetch(`/api/feedback/${selectedFeedback._id}`, { method: "DELETE" })
      toast({ title: "تم حذف الرأي", variant: "default" })
      await closeFeedbackModal()
    } catch {
      toast({ title: "فشل في الحذف", variant: "destructive" })
    }
  }

  const handleReplyFeedback = () => {
    if (!selectedFeedback) return
    window.open(`mailto:${selectedFeedback.email}?subject=رد على رأيك في مخيمر`, "_blank")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">في الانتظار</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">تمت الموافقة</Badge>
      case "replied":
        return <Badge className="bg-blue-100 text-blue-800">تم الرد</Badge>
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground">مؤرشف</Badge>
      default:
        return <Badge variant="outline">غير محدد</Badge>
    }
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
        <h2 className="text-2xl font-bold text-vintage-ink">إدارة الآراء</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredFeedbackSorted.length} من {feedback.length} رأي
          </Badge>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الآراء..."
            value={feedbackSearch}
            onChange={(e) => setFeedbackSearch(e.target.value)}
            className="pl-10 border-vintage-border"
          />
        </div>
        <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-vintage-border">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="تصفية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الآراء</SelectItem>
            <SelectItem value="pending">في الانتظار</SelectItem>
            <SelectItem value="approved">تمت الموافقة</SelectItem>
            <SelectItem value="replied">تم الرد</SelectItem>
            <SelectItem value="archived">مؤرشف</SelectItem>
          </SelectContent>
        </Select>
        <Select value={feedbackSort} onValueChange={setFeedbackSort}>
          <SelectTrigger className="w-full sm:w-[180px] border-vintage-border">
            {feedbackOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />}
            <SelectValue placeholder="ترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">تاريخ الإرسال</SelectItem>
            <SelectItem value="name">الاسم</SelectItem>
            <SelectItem value="email">البريد الإلكتروني</SelectItem>
            <SelectItem value="role">الدور</SelectItem>
            <SelectItem value="status">الحالة</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setFeedbackOrder(feedbackOrder === "asc" ? "desc" : "asc")}
          className="border-vintage-border"
        >
          {feedbackOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-lg border border-vintage-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-vintage-paper-dark/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  المرسل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  الرأي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  الدور
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
              {filteredFeedbackSorted.map((item) => (
                <tr 
                  key={item._id} 
                  className="hover:bg-vintage-paper-dark/10 cursor-pointer transition-colors"
                  onClick={() => openFeedbackModal(item)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-vintage-accent/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-vintage-accent" />
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-vintage-ink">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-vintage-ink">
                      <div className="line-clamp-2">{item.message}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="text-xs">
                      {item.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-vintage-ink">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الرأي</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-vintage-accent/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-vintage-accent" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-vintage-ink">{selectedFeedback.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedFeedback.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedFeedback.role}</Badge>
                    {getStatusBadge(selectedFeedback.status)}
                    {selectedFeedback.isPublic && (
                      <Badge className="bg-blue-100 text-blue-800">عام</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-vintage-ink mb-2">الرأي</h4>
                <div className="bg-vintage-paper-dark/20 p-4 rounded-lg">
                  <p className="text-sm text-vintage-ink whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-vintage-ink mb-2">تاريخ الإرسال</h4>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedFeedback.createdAt).toLocaleDateString("ar-EG")}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-vintage-ink mb-2">آخر تحديث</h4>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedFeedback.updatedAt).toLocaleDateString("ar-EG")}
                  </div>
                </div>
              </div>

              {selectedFeedback.adminNotes && (
                <div>
                  <h4 className="font-medium text-vintage-ink mb-2">ملاحظات المدير</h4>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">{selectedFeedback.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4 flex flex-row gap-2">
            <Button variant="outline" onClick={closeFeedbackModal}>إغلاق</Button>
            {selectedFeedback && selectedFeedback.status === "pending" && (
              <Button variant="default" onClick={handleApproveFeedback} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="h-4 w-4 ml-2" />
                موافقة
              </Button>
            )}
            {selectedFeedback && selectedFeedback.status !== "archived" && (
              <Button variant="outline" onClick={handleArchiveFeedback}>
                <Archive className="h-4 w-4 ml-2" />
                أرشفة
              </Button>
            )}
            {selectedFeedback && (
              <Button variant="secondary" onClick={handleReplyFeedback}>
                <Reply className="h-4 w-4 ml-2" />
                رد
              </Button>
            )}
            {selectedFeedback && (
              <Button variant="destructive" onClick={handleDeleteFeedback}>
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 