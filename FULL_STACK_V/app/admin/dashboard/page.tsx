"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Eye, 
  Heart, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Activity,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  PenTool,
  Star,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Edit,
  ExternalLink,
  Loader2,
  Shield,
  UserPlus,
  Ban,
  Unlock,
  SortAsc,
  SortDesc,
  ArrowLeft
} from "lucide-react"

import { getDashboard, exportDashboardReport } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import dynamic from "next/dynamic"

// Import the DynamicFooter component
import { DynamicFooter } from "@/components/DynamicFooter"


interface DashboardData {
  users: {
    total: number
    active: number
    admins: number
    newThisMonth: number
    growthRate: number
  }
  content: {
    total: number
    published: number
    drafts: number
    featured: number
  }
  engagement: {
    totalComments: number
    approvedComments: number
    pendingComments: number
    rejectedComments: number
    totalLikes: number
    totalViews: number
    averageEngagement: number
  }
  newsletter: {
    totalSubscribers: number
    activeSubscribers: number
    newSubscribersThisMonth: number
  }
  performance: {
    contentViewsPerDay: number
    engagementRate: number
    commentApprovalRate: number
  }
  feedback: {
    total: number
    pending: number
    approved: number
    rejected: number
    publicFeedback: number
  }
  contact: {
    total: number
    unread: number
    read: number
    replied: number
    archived: number
  }
}









// Temporarily import directly to debug
import UsersTab from "@/components/admin-dashboard/UsersTab"
import ContentTab from "@/components/admin-dashboard/ContentTab"
import FeedbackTab from "@/components/admin-dashboard/FeedbackTab"
import ContactTab from "@/components/admin-dashboard/ContactTab"
import AnalyticsTab from "@/components/admin-dashboard/AnalyticsTab"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  // State for dashboard data
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  

  










  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login')
    }
  }, [status, router])

  // Fetch all dashboard data using API-client methods
  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        // Use API-client methods for real data
        const dashboardRes = await getDashboard()
        setDashboard(dashboardRes)


      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("فشل في تحميل بيانات لوحة التحكم")
        toast({ title: "خطأ في جلب البيانات", description: String(error), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (status === "authenticated") {
      fetchAll()
    }
  }, [status])























  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-500">لا يمكن تحميل بيانات لوحة التحكم</p>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%'
  }

  const handleExport = async () => {
    try {
      const data = await exportDashboardReport('json')
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({ title: "تم التصدير", description: "تم تصدير تقرير لوحة التحكم بنجاح", variant: "default" })
    } catch (error: any) {
      console.error("Error exporting dashboard:", error)
      toast({ title: "خطأ", description: "فشل في تصدير التقرير", variant: "destructive" })
    }
  }



  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-vintage-paper p-6">
      {/* Dashboard Header */}
      <div className="relative mb-8" dir="rtl">
        {/* Original Background with Subtle Pattern */}
        <div className="absolute inset-0 bg-gradient-to-l from-vintage-paper via-white to-vintage-paper/50 rounded-2xl opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(139,69,19,0.1)_1px,transparent_0)] bg-[length:20px_20px] rounded-2xl"></div>
        
        {/* Header Content */}
        <div className="relative bg-vintage-paper bg-[radial-gradient(circle_at_1px_1px,rgba(139,69,19,0.1)_1px,transparent_0)] bg-[length:20px_20px] backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-start justify-between">
            
            {/* Left Section - Title */}
            <div className="text-right">
              <h1 className="text-3xl font-bold text-vintage-ink mb-2">لوحة التحكم</h1>
              <p className="text-vintage-ink/70 text-sm font-medium">مرحباً بك في لوحة تحكم مخيمر</p>
            </div>

            {/* Right Section - Navigation Buttons */}
            <div className="flex items-center gap-3">

            <Button 
                className="bg-vintage-accent hover:bg-vintage-accent/90 text-white" 
                onClick={handleExport}
              >
                <BarChart3 className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-vintage-ink hover:bg-vintage-paper-dark/10 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                رجوع
              </Button>
              
              
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-vintage-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-vintage-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dashboard.users.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {dashboard.users.growthRate >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 ml-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 ml-1" />
              )}
              {Math.abs(dashboard.users.growthRate).toFixed(1)}% من الشهر الماضي
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {dashboard.users.newThisMonth} مستخدم جديد هذا الشهر
            </div>
          </CardContent>
        </Card>

        <Card className="border-vintage-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المحتوى</CardTitle>
            <FileText className="h-4 w-4 text-vintage-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dashboard.content.total)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-xs">
                {dashboard.content.published} منشور
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dashboard.content.drafts} مسودة
              </Badge>
              <Badge variant="outline" className="text-xs">
              {dashboard.content.featured} محتوى مميز
              </Badge>
            </div>
            
          </CardContent>
        </Card>

        <Card className="border-vintage-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التفاعل</CardTitle>
            <Activity className="h-4 w-4 text-vintage-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dashboard.engagement.totalViews)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Eye className="h-3 w-3" />
              {formatNumber(dashboard.engagement.totalViews)} مشاهدة
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Heart className="h-3 w-3" />
              {formatNumber(dashboard.engagement.totalLikes)} إعجاب
            </div>
          </CardContent>
        </Card>

        <Card className="border-vintage-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التفاعل</CardTitle>
            <Target className="h-4 w-4 text-vintage-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(dashboard.performance.engagementRate)}</div>
            <Progress value={dashboard.performance.engagementRate} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {Number(formatNumber(dashboard.performance.contentViewsPerDay)).toFixed(2)} مشاهدة/يوم
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="users" className="space-y-6" dir="rtl">
        <TabsList className="grid w-full grid-cols-5 border-vintage-border">
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="feedback">الآراء</TabsTrigger>
          <TabsTrigger value="contact">الرسائل</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-6"><UsersTab /></TabsContent>
        <TabsContent value="content" className="space-y-6"><ContentTab /></TabsContent>
        <TabsContent value="feedback" className="space-y-6"><FeedbackTab /></TabsContent>
        <TabsContent value="contact" className="space-y-6"><ContactTab /></TabsContent>
        <TabsContent value="analytics" className="space-y-6"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
    {/* Footer */}
    <DynamicFooter />
    </>
  )
}
