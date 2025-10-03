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
  Archive,
  Reply,
  Trash2,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContactMessage {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  status: "unread" | "read" | "replied" | "archived"
  createdAt: string
  updatedAt: string
  adminReply?: string
  repliedAt?: string
  repliedBy?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ContactTab() {
  const { toast } = useToast()
  
  // State for contact messages management
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactSearch, setContactSearch] = useState("")
  const [contactFilter, setContactFilter] = useState("all")
  const [contactSort, setContactSort] = useState("createdAt")
  const [contactOrder, setContactOrder] = useState<"asc"|"desc">("desc")

  // State for contact modal
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null)
  const [contactModalOpen, setContactModalOpen] = useState(false)

  // Fetch contact messages data
  useEffect(() => {
    async function fetchContactMessages() {
      setLoading(true)
      try {
        const contactRes = await fetcher("/api/contact")
        setContactMessages(contactRes)
        console.debug("Fetched contact messages:", contactRes)
        if (!Array.isArray(contactRes) || contactRes.length === 0) {
          toast({ title: "تنبيه", description: "لم يتم جلب أي رسائل من قاعدة البيانات.", variant: "destructive" })
        }
      } catch (error) {
        console.error("Error fetching contact messages:", error)
        setError("فشل في تحميل بيانات الرسائل")
        toast({ title: "خطأ في جلب الرسائل", description: String(error), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchContactMessages()
  }, [])

  // Filtered data
  const filteredContactMessages = contactMessages.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                         item.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
                         item.subject.toLowerCase().includes(contactSearch.toLowerCase()) ||
                         item.message.toLowerCase().includes(contactSearch.toLowerCase())
    const matchesFilter = contactFilter === "all" ||
                         (contactFilter === "unread" && item.status === "unread") ||
                         (contactFilter === "read" && item.status === "read") ||
                         (contactFilter === "replied" && item.status === "replied") ||
                         (contactFilter === "archived" && item.status === "archived")
    return matchesSearch && matchesFilter
  })

  // Filter and sort contact messages
  const filteredContactMessagesSorted = filteredContactMessages
    .sort((a, b) => {
      let aValue: any, bValue: any
      switch (contactSort) {
        case "name": aValue = a.name; bValue = b.name; break
        case "email": aValue = a.email; bValue = b.email; break
        case "subject": aValue = a.subject; bValue = b.subject; break
        case "createdAt": aValue = new Date(a.createdAt); bValue = new Date(b.createdAt); break
        case "status": aValue = a.status; bValue = b.status; break
        default: aValue = new Date(a.createdAt); bValue = new Date(b.createdAt)
      }
      return contactOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })

  const openContactModal = (msg: ContactMessage) => {
    setSelectedContact(msg)
    setContactModalOpen(true)
  }

  const closeContactModal = async () => {
    setContactModalOpen(false)
    setSelectedContact(null)
    await fetchContactMessages()
  }

  const fetchContactMessages = async () => {
    try {
      const contactRes = await fetcher("/api/contact")
      setContactMessages(contactRes)
    } catch (error) {
      toast({ title: "فشل في تحديث البيانات", variant: "destructive" })
    }
  }

  const handleArchiveContact = async () => {
    if (!selectedContact) return
    try {
      await fetch(`/api/contact/${selectedContact._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" })
      })
      setSelectedContact({ ...selectedContact, status: "archived" })
      toast({ title: "تم أرشفة الرسالة", variant: "default" })
      await closeContactModal()
    } catch {
      toast({ title: "فشل في الأرشفة", variant: "destructive" })
    }
  }

  const handleDeleteContact = async () => {
    if (!selectedContact) return
    try {
      await fetch(`/api/contact/${selectedContact._id}`, { method: "DELETE" })
      toast({ title: "تم حذف الرسالة", variant: "default" })
      await closeContactModal()
    } catch {
      toast({ title: "فشل في الحذف", variant: "destructive" })
    }
  }

  const handleReplyContact = async () => {
    if (!selectedContact) return
    window.open(`mailto:${selectedContact.email}?subject=رد على رسالتك في مخيمر`, "_blank")
    try {
      await fetch(`/api/contact/${selectedContact._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "replied" })
      })
      setSelectedContact({ ...selectedContact, status: "replied" })
      toast({ title: "تم تعيين الرسالة كتم الرد عليها", variant: "default" })
    } catch {
      toast({ title: "فشل في تحديث حالة الرسالة", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge className="bg-red-100 text-red-800">غير مقروءة</Badge>
      case "read":
        return <Badge className="bg-blue-100 text-blue-800">مقروءة</Badge>
      case "replied":
        return <Badge className="bg-green-100 text-green-800">تم الرد</Badge>
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground">مؤرشفة</Badge>
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
        <h2 className="text-2xl font-bold text-vintage-ink">إدارة الرسائل</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredContactMessagesSorted.length} من {contactMessages.length} رسالة
          </Badge>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الرسائل..."
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            className="pl-10 border-vintage-border"
          />
        </div>
        <Select value={contactFilter} onValueChange={setContactFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-vintage-border">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="تصفية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الرسائل</SelectItem>
            <SelectItem value="unread">غير مقروءة</SelectItem>
            <SelectItem value="read">مقروءة</SelectItem>
            <SelectItem value="replied">تم الرد</SelectItem>
            <SelectItem value="archived">مؤرشفة</SelectItem>
          </SelectContent>
        </Select>
        <Select value={contactSort} onValueChange={setContactSort}>
          <SelectTrigger className="w-full sm:w-[180px] border-vintage-border">
            {contactOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />}
            <SelectValue placeholder="ترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">تاريخ الإرسال</SelectItem>
            <SelectItem value="name">الاسم</SelectItem>
            <SelectItem value="email">البريد الإلكتروني</SelectItem>
            <SelectItem value="subject">الموضوع</SelectItem>
            <SelectItem value="status">الحالة</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setContactOrder(contactOrder === "asc" ? "desc" : "asc")}
          className="border-vintage-border"
        >
          {contactOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Contact Messages Table */}
      <div className="bg-white rounded-lg border border-vintage-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-vintage-paper-dark/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  المرسل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  الموضوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  الرسالة
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
              {filteredContactMessagesSorted.map((item) => (
                <tr 
                  key={item._id} 
                  className="hover:bg-vintage-paper-dark/10 cursor-pointer transition-colors"
                  onClick={() => openContactModal(item)}
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
                    <div className="text-sm font-medium text-vintage-ink">{item.subject}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-vintage-ink">
                      <div className="line-clamp-2">{item.message}</div>
                    </div>
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

      {/* Contact Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-vintage-accent/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-vintage-accent" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-vintage-ink">{selectedContact.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedContact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedContact.status)}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-vintage-ink mb-2">الموضوع</h4>
                <div className="bg-vintage-paper-dark/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-vintage-ink">{selectedContact.subject}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-vintage-ink mb-2">الرسالة</h4>
                <div className="bg-vintage-paper-dark/20 p-4 rounded-lg">
                  <p className="text-sm text-vintage-ink whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-vintage-ink mb-2">تاريخ الإرسال</h4>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedContact.createdAt).toLocaleDateString("ar-EG")}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-vintage-ink mb-2">آخر تحديث</h4>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedContact.updatedAt).toLocaleDateString("ar-EG")}
                  </div>
                </div>
              </div>

              {selectedContact.adminReply && (
                <div>
                  <h4 className="font-medium text-vintage-ink mb-2">رد المدير</h4>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">{selectedContact.adminReply}</p>
                    {selectedContact.repliedAt && (
                      <div className="text-xs text-blue-600 mt-2">
                        تم الرد في: {new Date(selectedContact.repliedAt).toLocaleDateString("ar-EG")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4 flex flex-row gap-2">
            <Button variant="outline" onClick={closeContactModal}>إغلاق</Button>
            {selectedContact && selectedContact.status !== "archived" && (
              <Button variant="outline" onClick={handleArchiveContact}>
                <Archive className="h-4 w-4 ml-2" />
                أرشفة
              </Button>
            )}
            {selectedContact && (
              <Button variant="secondary" onClick={handleReplyContact}>
                <Reply className="h-4 w-4 ml-2" />
                رد
              </Button>
            )}
            {selectedContact && (
              <Button variant="destructive" onClick={handleDeleteContact}>
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