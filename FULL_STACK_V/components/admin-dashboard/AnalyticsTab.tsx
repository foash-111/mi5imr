"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageSquare,
  FileText,
  Calendar,
  Loader2,
  AlertCircle,
  BarChart3,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
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
  ResponsiveContainer,
  Text
} from "recharts"
import { useToast } from "@/hooks/use-toast"
import { getAllUsersWithActivity } from "@/lib/api-client"


const fetcher = (url: string) => fetch(url).then(res => res.json())

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const PAGE_SIZE = 10;

const TOP_USER_METRICS = [
  { key: "engagement", label: "معدل التفاعل (عدد المنشورات المتفاعَل معها)", endpoint: "/api/analytics/top-users/engagement", dataKey: "engagement" },
  { key: "likes", label: "عدد المنشورات المعجَب بها", endpoint: "/api/analytics/top-users/likes", dataKey: "likes" },
  { key: "comments", label: "عدد المنشورات المعلَّق عليها", endpoint: "/api/analytics/top-users/comments", dataKey: "comments" },
];

const TOP_CONTENT_METRICS = [
  { key: "engagement", label: "معدل التفاعل (إعجابات + تعليقات)", endpoint: "/api/analytics/top-content/engagement", dataKey: "engagement" },
  { key: "views", label: "عدد المشاهدات", endpoint: "/api/analytics/top-content/views", dataKey: "views" },
  { key: "likes", label: "عدد الإعجابات", endpoint: "/api/analytics/top-content/likes", dataKey: "likes" },
  { key: "comments", label: "عدد التعليقات", endpoint: "/api/analytics/top-content/comments", dataKey: "comments" },
];


export default function AnalyticsTab() {
  const { toast } = useToast()
  
  const [analytics, setAnalytics] = useState<any>({
    avgLovesAndCommentsByDay: [],
    commentsByDay: [],
    contentTypeDistribution: [],
		signupsByDay: [],
  });
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keyMetrics, setKeyMetrics] = useState<any>(null)
  const [topUserMetric, setTopUserMetric] = useState(TOP_USER_METRICS[0]);
  const [topUsersData, setTopUsersData] = useState<any[]>([]);
  const [topUsersLoading, setTopUsersLoading] = useState(false);
  const [topContentMetric, setTopContentMetric] = useState(TOP_CONTENT_METRICS[0]);
  const [topContentData, setTopContentData] = useState<any[]>([]);
  const [topContentLoading, setTopContentLoading] = useState(false);
  const [topUsersPage, setTopUsersPage] = useState(0);
  const [topUsersTotal, setTopUsersTotal] = useState(0);
  const [topContentPage, setTopContentPage] = useState(0);
  const [topContentTotal, setTopContentTotal] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to the latest month in the data if available, otherwise current month
    const today = new Date();
    return today.toISOString().slice(0, 7); // 'YYYY-MM'
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Fetch new endpoints for main charts
        const [viewsRes, likesRes, commentsRes, typeDistRes, signupsRes] = await Promise.all([
          fetch("/api/analytics/views-by-day"),
          fetch("/api/analytics/likes-by-day"),
          fetch("/api/analytics/comments-by-day"),
          fetch("/api/analytics/content-type-distribution"),
          fetch(`/api/analytics/signups-by-month?month=${selectedMonth}`)
        ]);
        const [viewsByDay, likesByDay, commentsByDay, contentTypeDistribution, signupsByDay] = await Promise.all([
          viewsRes.json(), likesRes.json(), commentsRes.json(), typeDistRes.json(), signupsRes.json()
        ]);
        // Merge likes and views by day for the main chart
        const avgLovesAndCommentsByDay = viewsByDay.map((v: any) => {
          const like = likesByDay.find((l: any) => l.date === v.date) || { likes: 0 };
          return { date: v.date, views: v.views, likes: like.likes };
        });

        setAnalytics({
          avgLovesAndCommentsByDay,
          commentsByDay,
          contentTypeDistribution,
					signupsByDay,
        });
        // Fetch key metrics as before
        const metricsRes = await fetch("/api/analytics/key-metrics");
        setKeyMetrics(await metricsRes.json());
        // Fetch performance metrics
        const perfRes = await fetch("/api/analytics/performance");
        setPerformanceMetrics(await perfRes.json());
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast({ title: "خطأ في جلب التحليلات", description: String(error), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // Refetch signup data when selected month changes
  useEffect(() => {
    async function fetchSignupData() {
      try {
        const signupsRes = await fetch(`/api/analytics/signups-by-month?month=${selectedMonth}`);
        const signupsByDay = await signupsRes.json();
        
        setAnalytics((prev: any) => ({
          ...prev,
          signupsByDay
        }));
      } catch (error) {
        console.error("Error fetching signup data:", error);
      }
    }
    
    if (selectedMonth) {
      fetchSignupData();
    }
  }, [selectedMonth]);

  // Refetch interaction data when selected month changes
  useEffect(() => {
    async function fetchInteractionData() {
      try {
        const [viewsRes, likesRes, commentsRes] = await Promise.all([
          fetch("/api/analytics/views-by-day"),
          fetch("/api/analytics/likes-by-day"),
          fetch("/api/analytics/comments-by-day")
        ]);
        const [viewsByDay, likesByDay, commentsByDay] = await Promise.all([
          viewsRes.json(), likesRes.json(), commentsRes.json()
        ]);
        
        // Merge likes and views by day for the main chart
        const avgLovesAndCommentsByDay = viewsByDay.map((v: any) => {
          const like = likesByDay.find((l: any) => l.date === v.date) || { likes: 0 };
          return { date: v.date, views: v.views, likes: like.likes };
        });
        
        setAnalytics((prev: any) => ({
          ...prev,
          avgLovesAndCommentsByDay,
          commentsByDay
        }));
      } catch (error) {
        console.error("Error fetching interaction data:", error);
      }
    }
    
    if (selectedMonth) {
      fetchInteractionData();
    }
  }, [selectedMonth]);

  useEffect(() => {
    async function fetchTopUsers() {
      setTopUsersLoading(true);
      try {
        const res = await fetch(`${topUserMetric.endpoint}?skip=${topUsersPage * PAGE_SIZE}&limit=${PAGE_SIZE}`);
        const data = await res.json();
        setTopUsersData(data.users || []);
        setTopUsersTotal(data.total || 0);
      } catch (error) {
        setTopUsersData([]);
        setTopUsersTotal(0);
      } finally {
        setTopUsersLoading(false);
      }
    }
    fetchTopUsers();
  }, [topUserMetric, topUsersPage]);

  useEffect(() => {
    async function fetchTopContent() {
      setTopContentLoading(true);
      try {
        const res = await fetch(`${topContentMetric.endpoint}?skip=${topContentPage * PAGE_SIZE}&limit=${PAGE_SIZE}`);
        const data = await res.json();
        setTopContentData(data.posts || []);
        setTopContentTotal(data.total || 0);
      } catch (error) {
        setTopContentData([]);
        setTopContentTotal(0);
      } finally {
        setTopContentLoading(false);
      }
    }
    fetchTopContent();
  }, [topContentMetric, topContentPage]);

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

  // Helper to get all months present in the data
  function getAvailableMonths() {
    const allDates = [
      ...(analytics?.avgLovesAndCommentsByDay || []).map((d: any) => d.date),
      ...(analytics?.commentsByDay || []).map((d: any) => d.date),
      ...(analytics?.signupsByDay || []).map((d: any) => d.date),
    ];
    const monthsSet = new Set(
      allDates.map(date => date?.slice(0, 7)).filter(Boolean)
    );
    return Array.from(monthsSet).sort();
  }

  const availableMonths = getAvailableMonths();

  // Helper function to generate all days in a month
  function getAllDaysInMonth(yearMonth: string) {
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: string[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      days.push(dateStr);
    }
    
    return days;
  }

  // Filter data for the selected month and fill missing days with zeros
  const allDaysInMonth = getAllDaysInMonth(selectedMonth);
  const existingData = (analytics?.avgLovesAndCommentsByDay || [])
    .filter((item: any) => item.date?.startsWith(selectedMonth))
    .map((item: any) => {
      const commentObj = (analytics?.commentsByDay || []).find((c: any) => c.date === item.date) || { comments: 0 };
      return { ...item, comments: commentObj.comments };
    });

  // Create a map of existing data
  const dataMap = new Map(existingData.map((item: any) => [item.date, item]));

  // Fill in missing days with zero values
  const filteredChartData = allDaysInMonth.map(date => {
    const existing = dataMap.get(date);
    if (existing) {
      return existing;
    }
    return {
      date,
      views: 0,
      likes: 0,
      comments: 0
    };
  });

  // Filter daily signup data for the selected month
  const filteredSignupData = (analytics?.signupsByDay || [])
    .filter((item: any) => item.date?.startsWith(selectedMonth));

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
    <>
      <div className="space-y-6">
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-vintage-ink">التحليلات المتقدمة</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              آخر 30 يوم
            </Badge>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Views */}
          <Card className="border-vintage-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
              <Eye className="h-4 w-4 text-vintage-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(keyMetrics?.totalViews || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {keyMetrics?.viewsChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 ml-1" />
                ) : keyMetrics?.viewsChange < 0 ? (
                  <ArrowDownRight className="h-3 w-3 text-red-500 ml-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 text-gray-400 ml-1" />
                )}
                {keyMetrics?.viewsChange !== undefined ? (
                  <span className={
                    keyMetrics.viewsChange > 0
                      ? "text-green-500"
                      : keyMetrics.viewsChange < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }>
                    {keyMetrics.viewsChange > 0 ? '+' : ''}{formatPercentage(keyMetrics.viewsChange)} من الشهر الماضي
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Total Likes */}
          <Card className="border-vintage-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإعجابات</CardTitle>
              <Heart className="h-4 w-4 text-vintage-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(keyMetrics?.totalLikes || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {keyMetrics?.likesChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 ml-1" />
                ) : keyMetrics?.likesChange < 0 ? (
                  <ArrowDownRight className="h-3 w-3 text-red-500 ml-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 text-gray-400 ml-1" />
                )}
                {keyMetrics?.likesChange !== undefined ? (
                  <span className={
                    keyMetrics.likesChange > 0
                      ? "text-green-500"
                      : keyMetrics.likesChange < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }>
                    {keyMetrics.likesChange > 0 ? '+' : ''}{formatPercentage(keyMetrics.likesChange)} من الشهر الماضي
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Total Comments */}
          <Card className="border-vintage-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي التعليقات</CardTitle>
              <MessageSquare className="h-4 w-4 text-vintage-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(keyMetrics?.totalComments || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {keyMetrics?.commentsChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 ml-1" />
                ) : keyMetrics?.commentsChange < 0 ? (
                  <ArrowDownRight className="h-3 w-3 text-red-500 ml-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 text-gray-400 ml-1" />
                )}
                {keyMetrics?.commentsChange !== undefined ? (
                  <span className={
                    keyMetrics.commentsChange > 0
                      ? "text-green-500"
                      : keyMetrics.commentsChange < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }>
                    {keyMetrics.commentsChange > 0 ? '+' : ''}{formatPercentage(keyMetrics.commentsChange)} من الشهر الماضي
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Rate */}
          <Card className="border-vintage-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل التفاعل</CardTitle>
              <Target className="h-4 w-4 text-vintage-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(keyMetrics?.engagementRate || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {keyMetrics?.engagementChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 ml-1" />
                ) : keyMetrics?.engagementChange < 0 ? (
                  <ArrowDownRight className="h-3 w-3 text-red-500 ml-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 text-gray-400 ml-1" />
                )}
                {keyMetrics?.engagementChange !== undefined ? (
                  <span className={
                    keyMetrics.engagementChange > 0
                      ? "text-green-500"
                      : keyMetrics.engagementChange < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }>
                    {keyMetrics.engagementChange > 0 ? '+' : ''}{formatPercentage(keyMetrics.engagementChange)} من الشهر الماضي
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-vintage-border">
            <CardHeader>
              <CardTitle>معدلات التفاعل</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Month navigation */}
              <div className="flex items-center justify-center mb-2 gap-2">
                <button
                  onClick={() => {
                    const idx = availableMonths.indexOf(selectedMonth);
                    if (idx > 0) setSelectedMonth(availableMonths[idx - 1]);
                  }}
                  disabled={availableMonths.indexOf(selectedMonth) === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  aria-label="الشهر السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="font-semibold text-lg">
                  {selectedMonth.replace(/-(\d{2})$/, (m, d) => `/${d}`)}
                </span>
                <button
                  onClick={() => {
                    const idx = availableMonths.indexOf(selectedMonth);
                    if (idx < availableMonths.length - 1) setSelectedMonth(availableMonths[idx + 1]);
                  }}
                  disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  aria-label="الشهر التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={filteredChartData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ textAnchor: "middle", fontSize: 12, dy: 8 }}
                    tickFormatter={date => {
                      // date is expected in 'YYYY-MM-DD' format
                      if (!date) return '';
                      const parts = date.split('-');
                      if (parts.length === 3) {
                        return `${parts[1]}/${parts[2]}`;
                      }
                      return date;
                    }}
                  />
                  <YAxis 
                    orientation="left"
                    tick={{ textAnchor: "end", fontSize: 12, dx: -8 }}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" name="المشاهدات" />
                  <Line type="monotone" dataKey="likes" stroke="#82ca9d" name="الإعجابات" />
                  <Line type="monotone" dataKey="comments" stroke="#FFBB28" name="التعليقات" />
                </LineChart>
              </ResponsiveContainer>
              {/* Legend below the chart */}
              <div className="flex flex-row justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-1.5 rounded bg-[#8884d8]" />
                  <span className="text-sm">المشاهدات</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-1.5 rounded bg-[#82ca9d]" />
                  <span className="text-sm">الإعجابات</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-1.5 rounded bg-[#FFBB28]" />
                  <span className="text-sm">التعليقات</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-vintage-border">
            <CardHeader>
              <CardTitle>تسجيلات المستخدمين شهريًا</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Month navigation */}
              <div className="flex items-center justify-center mb-2 gap-2">
                <button
                  onClick={() => {
                    const idx = availableMonths.indexOf(selectedMonth);
                    if (idx > 0) setSelectedMonth(availableMonths[idx - 1]);
                  }}
                  disabled={availableMonths.indexOf(selectedMonth) === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  aria-label="الشهر السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="font-semibold text-lg">
                  {selectedMonth.replace(/-(\d{2})$/, (m, d) => `/${d}`)}
                </span>
                <button
                  onClick={() => {
                    const idx = availableMonths.indexOf(selectedMonth);
                    if (idx < availableMonths.length - 1) setSelectedMonth(availableMonths[idx + 1]);
                  }}
                  disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  aria-label="الشهر التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={filteredSignupData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ textAnchor: "middle", fontSize: 12, dy: 16 }}
                    tickFormatter={date => {
                      // date is expected in 'YYYY-MM-DD' format
                      if (!date) return '';
                      const parts = date.split('-');
                      if (parts.length === 3) {
                        return `${parts[1]}/${parts[2]}`;
                      }
                      return date;
                    }}
                  />
                  <YAxis
                    orientation="left"
                    tick={{ textAnchor: "end", fontSize: 12, dx: -12 }}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="signups" stroke="#0088FE" name="تسجيلات المستخدمين" />
                </LineChart>
              </ResponsiveContainer>
              {/* Legend below the chart */}
              <div className="flex flex-row justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-1.5 rounded bg-[#0088FE]" />
                  <span className="text-sm">تسجيلات المستخدمين</span>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Type Distribution */}
        <Card className="border-vintage-border">
          <CardHeader>
            <CardTitle>توزيع أنواع المحتوى</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-vintage-ink">تفاصيل التوزيع</h3>
                <div className="space-y-2">
                  {analytics?.contentTypeDistribution?.map((item: any, index: number) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-vintage-ink">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-vintage-ink ml-4">{item.value} منشور</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={analytics?.contentTypeDistribution || []}
                  margin={{ top: 20, right: 30, left: 50, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ textAnchor: "middle", fontSize: 13, fill: '#374151', dy: 8 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    orientation="left"
                    tick={{ textAnchor: "end", fontSize: 13, fill: '#374151', dx: -8 }}
                    width={50}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {analytics?.contentTypeDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Users and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-vintage-border">
            <CardHeader>
              <CardTitle>أفضل المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={topUserMetric.key}
                  onChange={e => {
                    const metric = TOP_USER_METRICS.find(m => m.key === e.target.value);
                    if (metric) {
                      setTopUserMetric(metric);
                      setTopUsersPage(0);
                    }
                  }}
                >
                  {TOP_USER_METRICS.map(metric => (
                    <option key={metric.key} value={metric.key}>{metric.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row items-center">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={topUsersData}
                      layout="vertical"
                      margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={280}
                        interval={0}
                        orientation="left"
                        tick={({ x, y, payload }) => (
                          <Text
                            x={x}
                            y={y}
                            width={260}
                            textAnchor="start"
                            verticalAnchor="middle"
                            fontSize={14}
                            fontFamily="inherit"
                          >
                            {payload.value.length > 35 ? payload.value.slice(0, 33) + '…' : payload.value}
                          </Text>
                        )}
                      />
                      <Tooltip />
                      <Bar dataKey={topUserMetric.dataKey}>
                        {topUsersData.map((entry: any, index: number) => (
                          <Cell key={`cell-user-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <PaginationControls page={topUsersPage} setPage={setTopUsersPage} total={topUsersTotal} pageSize={PAGE_SIZE} />
              </div>
              {topUsersLoading && <div className="text-center text-xs mt-2">جاري التحميل...</div>}
            </CardContent>
          </Card>

          <Card className="border-vintage-border">
            <CardHeader>
              <CardTitle>أفضل المحتوى</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={topContentMetric.key}
                  onChange={e => {
                    const metric = TOP_CONTENT_METRICS.find(m => m.key === e.target.value);
                    if (metric) {
                      setTopContentMetric(metric);
                      setTopContentPage(0);
                    }
                  }}
                >
                  {TOP_CONTENT_METRICS.map(metric => (
                    <option key={metric.key} value={metric.key}>{metric.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row items-center">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={topContentData}
                      layout="vertical"
                      margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="title"
                        type="category"
                        width={280}
                        interval={0}
                        orientation="left"
                        tick={({ x, y, payload }) => (
                          <Text
                            x={x}
                            y={y}
                            width={260}
                            textAnchor="start"
                            verticalAnchor="middle"
                            fontSize={14}
                            fontFamily="inherit"
                          >
                            {payload.value.length > 35 ? payload.value.slice(0, 33) + '…' : payload.value}
                          </Text>
                        )}
                      />
                      <Tooltip />
                      <Bar dataKey={topContentMetric.dataKey}>
                        {topContentData.map((entry: any, index: number) => (
                          <Cell key={`cell-content-${entry.title}-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <PaginationControls page={topContentPage} setPage={setTopContentPage} total={topContentTotal} pageSize={PAGE_SIZE} />
              </div>
              {topContentLoading && <div className="text-center text-xs mt-2">جاري التحميل...</div>}
            </CardContent>
          </Card>
        </div>

  
      </div>
    </>
  )
} 

// Pagination controls component
function PaginationControls({ page, setPage, total, pageSize }: { page: number, setPage: (p: number) => void, total: number, pageSize: number }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const dots = [];
  for (let i = 0; i < totalPages; i++) {
    if (i === page || i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) {
      dots.push(
        <button
          key={i}
          className={`my-1 w-2.5 h-2.5 rounded-full transition-colors duration-150
            ${i === page ? 'bg-vintage-accent' : 'bg-gray-200'}`}
          style={{ border: i === page ? '2px solid #FFBB28' : 'none' }}
          onClick={() => setPage(i)}
          aria-label={`Go to page ${i + 1}`}
        />
      );
    }
  }
  return (
    <div className="flex flex-row items-center justify-end h-full min-h-[120px]">
      <div className="flex flex-col items-center justify-center gap-2 ml-2">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center gap-1">
          {dots}
        </div>
        <button
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 