"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  ArrowDownRight
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"
import { getDashboard, exportDashboardReport } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

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
    byType: Array<{
      name: string
      count: number
      published: number
    }>
    byCategory: Array<{
      name: string
      count: number
    }>
    topContent: Array<{
      id: string
      title: string
      views: number
      likes: number
      comments: number
      score: number
    }>
    recentContent: Array<any>
  }
  engagement: {
    totalComments: number
    approvedComments: number
    pendingComments: number
    rejectedComments: number
    totalLikes: number
    totalViews: number
    averageEngagement: number
    topEngagedContent: Array<{
      id: string
      title: string
      engagementRate: number
      views: number
      likes: number
      comments: number
    }>
  }
  newsletter: {
    totalSubscribers: number
    activeSubscribers: number
    newSubscribersThisMonth: number
  }
  timeSeries: {
    contentCreated: Array<{ date: string; count: number }>
    userRegistrations: Array<{ date: string; count: number }>
    commentsPosted: Array<{ date: string; count: number }>
  }
  performance: {
    contentViewsPerDay: number
    engagementRate: number
    commentApprovalRate: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchDashboardData() {
      if (status === "authenticated" && session?.user) {
        try {
          setIsLoading(true)
          const data = await getDashboard()
          setDashboardData(data)
        } catch (err: any) {
          console.error("Error fetching dashboard data:", err)
          setError(err.message || "Failed to fetch dashboard data")
          toast({
            title: "خطأ",
            description: "فشل في تحميل بيانات لوحة التحكم",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchDashboardData()
  }, [session, status, toast])

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vintage-accent mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
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
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "تم التصدير",
        description: "تم تصدير تقرير لوحة التحكم بنجاح",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error exporting dashboard:", error)
      toast({
        title: "خطأ",
        description: "فشل في تصدير التقرير",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">لوحة تحكم المدير</h1>
          <p className="text-muted-foreground mt-2">نظرة شاملة على أداء المنصة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-vintage-border">
            <Calendar className="h-4 w-4 ml-2" />
            آخر 30 يوم
          </Button>
          <Button className="bg-vintage-accent hover:bg-vintage-accent/90 text-white" onClick={handleExport}>
            <BarChart3 className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
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
            <div className="text-2xl font-bold">{formatNumber(dashboardData.users.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {dashboardData.users.growthRate >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 ml-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 ml-1" />
              )}
              {Math.abs(dashboardData.users.growthRate).toFixed(1)}% من الشهر الماضي
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {dashboardData.users.newThisMonth} مستخدم جديد هذا الشهر
            </div>
          </CardContent>
        </Card>

        <Card className="border-vintage-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المحتوى</CardTitle>
            <FileText className="h-4 w-4 text-vintage-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dashboardData.content.total)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-xs">
                {dashboardData.content.published} منشور
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dashboardData.content.drafts} مسودة
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {dashboardData.content.featured} محتوى مميز
            </div>
          </CardContent>
        </Card>

        <Card className="border-vintage-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التفاعل</CardTitle>
            <Activity className="h-4 w-4 text-vintage-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dashboardData.engagement.totalViews)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Eye className="h-3 w-3" />
              {formatNumber(dashboardData.engagement.totalViews)} مشاهدة
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Heart className="h-3 w-3" />
              {formatNumber(dashboardData.engagement.totalLikes)} إعجاب
            </div>
          </CardContent>
        </Card>

        <Card className="border-vintage-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التفاعل</CardTitle>
            <Target className="h-4 w-4 text-vintage-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(dashboardData.performance.engagementRate)}</div>
            <Progress value={dashboardData.performance.engagementRate} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {formatNumber(dashboardData.performance.contentViewsPerDay)} مشاهدة/يوم
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 border-vintage-border">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="engagement">التفاعل</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Series Chart */}
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-vintage-accent" />
                  النشاط خلال 30 يوم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.timeSeries.contentCreated}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('ar-EG')}
                      formatter={(value: any) => [value, 'المحتوى']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#FF6B35" 
                      strokeWidth={2}
                      name="المحتوى المنشور"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Content Distribution */}
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-vintage-accent" />
                  توزيع المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.content.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {dashboardData.content.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, 'المحتوى']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-vintage-accent" />
                  التعليقات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">إجمالي التعليقات</span>
                    <span className="font-bold">{formatNumber(dashboardData.engagement.totalComments)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      معتمدة
                    </span>
                    <span className="font-bold">{formatNumber(dashboardData.engagement.approvedComments)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      في الانتظار
                    </span>
                    <span className="font-bold">{formatNumber(dashboardData.engagement.pendingComments)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      مرفوضة
                    </span>
                    <span className="font-bold">{formatNumber(dashboardData.engagement.rejectedComments)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-vintage-accent" />
                  النشرة الإخبارية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">إجمالي المشتركين</span>
                    <span className="font-bold">{formatNumber(dashboardData.newsletter.totalSubscribers)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">المشتركين النشطين</span>
                    <span className="font-bold">{formatNumber(dashboardData.newsletter.activeSubscribers)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">جدد هذا الشهر</span>
                    <span className="font-bold">{formatNumber(dashboardData.newsletter.newSubscribersThisMonth)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-vintage-accent" />
                  المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">إجمالي المستخدمين</span>
                    <span className="font-bold">{formatNumber(dashboardData.users.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">المستخدمين النشطين</span>
                    <span className="font-bold">{formatNumber(dashboardData.users.active)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">المديرين</span>
                    <span className="font-bold">{formatNumber(dashboardData.users.admins)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Content */}
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-vintage-accent" />
                  أفضل المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.content.topContent.slice(0, 5).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-vintage-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-vintage-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {formatNumber(item.views)}
                            <Heart className="h-3 w-3" />
                            {formatNumber(item.likes)}
                            <MessageSquare className="h-3 w-3" />
                            {formatNumber(item.comments)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatNumber(item.score)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content by Category */}
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-vintage-accent" />
                  المحتوى حسب الفئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.content.byCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [value, 'المحتوى']} />
                    <Bar dataKey="count" fill="#FF6B35" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Rate Chart */}
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-vintage-accent" />
                  معدل التفاعل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.timeSeries.commentsPosted}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('ar-EG')}
                      formatter={(value: any) => [value, 'التعليقات']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#FF6B35" 
                      fill="#FF6B35" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Engaged Content */}
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-vintage-accent" />
                  أعلى المحتوى تفاعلاً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.engagement.topEngagedContent.slice(0, 5).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-vintage-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-vintage-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {formatNumber(item.views)}
                            <Heart className="h-3 w-3" />
                            {formatNumber(item.likes)}
                            <MessageSquare className="h-3 w-3" />
                            {formatNumber(item.comments)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatPercentage(item.engagementRate)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Registration Trend */}
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-vintage-accent" />
                  تسجيل المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.timeSeries.userRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('ar-EG')}
                      formatter={(value: any) => [value, 'المستخدمين']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                      name="المستخدمين الجدد"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="border-vintage-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-vintage-accent" />
                  مقاييس الأداء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">معدل التفاعل</span>
                      <span className="text-sm font-bold">{formatPercentage(dashboardData.performance.engagementRate)}</span>
                    </div>
                    <Progress value={dashboardData.performance.engagementRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">معدل اعتماد التعليقات</span>
                      <span className="text-sm font-bold">{formatPercentage(dashboardData.performance.commentApprovalRate)}</span>
                    </div>
                    <Progress value={dashboardData.performance.commentApprovalRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">المشاهدات اليومية</span>
                      <span className="text-sm font-bold">{formatNumber(dashboardData.performance.contentViewsPerDay)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      متوسط المشاهدات اليومية للمحتوى المنشور
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
