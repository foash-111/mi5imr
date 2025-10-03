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
  UserCheck, 
  UserX, 
  Ban, 
  Unlock,
  Shield,
  UserPlus,
  MoreHorizontal,
  Loader2,
  AlertCircle
} from "lucide-react"
import { getAllUsersWithActivity, blockUser } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface UserWithActivity {
  _id: string
  name: string
  email: string
  avatar?: string
  isAdmin: boolean
  blocked?: boolean
  createdAt: Date
  updatedAt?: Date
  activity: {
    commentsCount: number
    likesCount: number
    bookmarksCount: number
    lastLogin: Date | null
    contentCreated: number
  }
}

export default function UsersTab() {
  const { toast } = useToast()
  
  // State for users management
  const [users, setUsers] = useState<UserWithActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState("")
  const [userSort, setUserSort] = useState("createdAt")
  const [userOrder, setUserOrder] = useState<"asc"|"desc">("desc")
  const [userFilter, setUserFilter] = useState("all")

  // State for user modal
  const [selectedUser, setSelectedUser] = useState<UserWithActivity | null>(null)
  const [userModalOpen, setUserModalOpen] = useState(false)

  // Fetch users data
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const usersRes = await getAllUsersWithActivity()
        setUsers(usersRes)
        console.debug("Fetched users:", usersRes)
        if (!Array.isArray(usersRes) || usersRes.length === 0) {
          toast({ title: "تنبيه", description: "لم يتم جلب أي مستخدمين من قاعدة البيانات.", variant: "destructive" })
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("فشل في تحميل بيانات المستخدمين")
        toast({ title: "خطأ في جلب المستخدمين", description: String(error), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Handle user blocking/unblocking
  const handleBlock = async (userId: string, blocked: boolean) => {
    try {
      await blockUser(userId, blocked)
      setUsers(users.map(u => u._id === userId ? { ...u, blocked } : u))
      toast({ title: blocked ? "تم حظر المستخدم" : "تم إلغاء حظر المستخدم", variant: "default" })
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث حالة المستخدم", variant: "destructive" })
    }
  }

  // Filtered data
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchesFilter = userFilter === "all" ||
                         (userFilter === "admin" && user.isAdmin) ||
                         (userFilter === "active" && !user.blocked) ||
                         (userFilter === "blocked" && user.blocked)
    return matchesSearch && matchesFilter
  })

  // Filter and sort users
  const filteredUsersSorted = filteredUsers
    .sort((a, b) => {
      let aValue: any, bValue: any
      switch (userSort) {
        case "name": aValue = a.name; bValue = b.name; break
        case "email": aValue = a.email; bValue = b.email; break
        case "createdAt": aValue = new Date(a.createdAt); bValue = new Date(b.createdAt); break
        case "lastLogin": aValue = a.activity?.lastLogin ? new Date(a.activity.lastLogin) : new Date(0); bValue = b.activity?.lastLogin ? new Date(b.activity.lastLogin) : new Date(0); break
        case "contentCreated": aValue = a.activity?.contentCreated; bValue = b.activity?.contentCreated; break
        case "commentsCount": aValue = a.activity?.commentsCount; bValue = b.activity?.commentsCount; break
        case "likesCount": aValue = a.activity?.likesCount; bValue = b.activity?.likesCount; break
        default: aValue = new Date(a.createdAt); bValue = new Date(b.createdAt)
      }
      return userOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })

  const openUserModal = (user: UserWithActivity) => {
    setSelectedUser(user)
    setUserModalOpen(true)
  }

  const closeUserModal = () => {
    setSelectedUser(null)
    setUserModalOpen(false)
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
        <h2 className="text-2xl font-bold text-vintage-ink">إدارة المستخدمين</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredUsersSorted.length} من {users.length} مستخدم
          </Badge>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في المستخدمين..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="pl-10 border-vintage-border"
          />
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-vintage-border">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="تصفية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المستخدمين</SelectItem>
            <SelectItem value="admin">المدراء</SelectItem>
            <SelectItem value="active">النشطون</SelectItem>
            <SelectItem value="blocked">المحظورون</SelectItem>
          </SelectContent>
        </Select>
        <Select value={userSort} onValueChange={setUserSort}>
          <SelectTrigger className="w-full sm:w-[180px] border-vintage-border">
            {userOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />}
            <SelectValue placeholder="ترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">تاريخ الانضمام</SelectItem>
            <SelectItem value="name">الاسم</SelectItem>
            <SelectItem value="email">البريد الإلكتروني</SelectItem>
            <SelectItem value="lastLogin">آخر تسجيل دخول</SelectItem>
            <SelectItem value="contentCreated">المحتوى المنشور</SelectItem>
            <SelectItem value="commentsCount">التعليقات</SelectItem>
            <SelectItem value="likesCount">الإعجابات</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setUserOrder(userOrder === "asc" ? "desc" : "asc")}
          className="border-vintage-border"
        >
          {userOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-vintage-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-vintage-paper-dark/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  النشاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  آخر تسجيل دخول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-ink uppercase tracking-wider">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-vintage-border">
              {filteredUsersSorted.map((user) => (
                <tr 
                  key={user._id} 
                  className="hover:bg-vintage-paper-dark/10 cursor-pointer transition-colors"
                  onClick={() => openUserModal(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-vintage-accent/20 flex items-center justify-center">
                          {user.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                          ) : (
                            <span className="text-vintage-accent font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-vintage-ink">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.isAdmin ? (
                        <Badge className="bg-vintage-accent text-white">
                          <Shield className="h-3 w-3 ml-1" />
                          مدير
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          مستخدم
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-vintage-ink">
                    <div className="space-y-1">
                      <div>تعليقات: {user.activity?.commentsCount || 0}</div>
                      <div>إعجابات: {user.activity?.likesCount || 0}</div>
                      <div>محتوى: {user.activity?.contentCreated || 0}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-vintage-ink">
                    {user.activity?.lastLogin ? (
                      new Date(user.activity.lastLogin).toLocaleDateString("ar-EG")
                    ) : (
                      <span className="text-muted-foreground">غير محدد</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.blocked ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          <Ban className="h-3 w-3 ml-1" />
                          محظور
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          <UserCheck className="h-3 w-3 ml-1" />
                          نشط
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div><b>الاسم:</b> {selectedUser.name}</div>
              <div><b>البريد الإلكتروني:</b> {selectedUser.email}</div>
              <div><b>الدور:</b> {selectedUser.isAdmin ? "مدير" : "مستخدم"}</div>
              <div><b>تاريخ الانضمام:</b> {new Date(selectedUser.createdAt).toLocaleDateString("ar-EG")}</div>
              <div><b>آخر تسجيل دخول:</b> {selectedUser.activity?.lastLogin ? new Date(selectedUser.activity.lastLogin).toLocaleDateString("ar-EG") : "غير محدد"}</div>
              <div><b>النشاط:</b> تعليقات: {selectedUser.activity?.commentsCount}, إعجابات: {selectedUser.activity?.likesCount}</div>
              <div><b>الحالة:</b> {selectedUser.blocked ? "محظور" : "نشط"}</div>
            </div>
          )}
          <DialogFooter className="mt-4 flex flex-row gap-2">
            <Button variant="outline" onClick={closeUserModal}>إغلاق</Button>
            {selectedUser && (
              <Button variant={selectedUser.blocked ? "default" : "destructive"} onClick={() => { handleBlock(selectedUser._id, !selectedUser.blocked); closeUserModal(); }}>
                {selectedUser.blocked ? "إلغاء الحظر" : "حظر المستخدم"}
              </Button>
            )}
            {selectedUser && (
              <Link href={`/admin/users/${selectedUser._id}`} passHref legacyBehavior>
                <Button variant="secondary" asChild>
                  <a target="_blank">عرض الملف الشخصي</a>
                </Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 