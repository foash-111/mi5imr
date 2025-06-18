"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContentFeed } from "@/components/content-feed"
import { FeedSidebar } from "@/components/feed-sidebar"
import { Button } from "@/components/ui/button"
import { Filter, SlidersHorizontal, Grid3X3, List } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { getContent, getContentTypes, getCategories } from "@/lib/api-client"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Category } from "@/backend/models/types"

// Helpers
const getCreatedAtFilter = (time: string | null) => {
  const now = new Date()
  if (time === "today") return { $gte: new Date(now.setHours(0, 0, 0, 0)).toISOString() }
  if (time === "this-week") return { $gte: new Date(now.setDate(now.getDate() - 7)).toISOString() }
  if (time === "this-month") return { $gte: new Date(now.setMonth(now.getMonth() - 1)).toISOString() }
  if (time === "this-year") return { $gte: new Date(now.setFullYear(now.getFullYear() - 1)).toISOString() }
  return undefined
}

export default function FeedPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [contentTypes, setContentTypes] = useState<{ id: string; label: string; count: number }[]>([])
  //const [contentType, setContentType] = useState<string | null>(null)

  const [content, setContent] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attributes, setAttributes] = useState<{ id: string; label: string; count: number }[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
	const sort = useMemo(() => searchParams.get("sort") || "newest", [searchParams])
	const typeParam = useMemo(() => searchParams.get("type")?.split(",") || [], [searchParams])
	const attributesParam = useMemo(() => searchParams.get("attributes")?.split(",") || [], [searchParams])
	const time = useMemo(() => searchParams.get("time"), [searchParams])
	const search = useMemo(() => searchParams.get("q"), [searchParams])
 
	// let selectedType = ''
 

	// first edit i moved those to use effect
  
  useEffect(() => {
		console.log("feedpage")
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
			// العنوان الل بيظهر بعد ما تحدد الفلتر
			// selectedType = useMemo(() => searchParams.get("type") || "المحتويات", [searchParams])

      try {
        const types = await getContentTypes()
        setContentTypes(types.map((t: any) => ({
          id: t.label,
          label: t.label,
          count: t.count || 0,
        })))

        /*const attrs = await getCategories()
        setAttributes(attrs.map((a: any) => ({
          id: a.name,
          label: a.label,
          count: a.count || 0,
        })))*/
			 // fix when fixing attrib
			 setAttributes([
					{ id: "category1", label: "الفئة 1", count: 10 },])
			


        const options: any = {
          contentType: typeParam.length > 0 ? typeParam : undefined,
          category: attributesParam.length > 0 ? attributesParam : undefined,
          sortBy: sort,
          published: true,
          limit: 10,
          skip: 0,
          createdAt: getCreatedAtFilter(time),
          search: search || undefined,
        }
        console.log("feed page options:", options);
        const allContent = await getContent(options)
				console.log("feedpage content:", allContent);
        setContent(allContent)

        toast({
          title: typeParam.length || attributesParam.length || time || search ? "تم تطبيق الفلتر" : "جميع المحتويات",
          description: typeParam.length || attributesParam.length || time || search
            ? "تم عرض المحتوى بناءً على الفلاتر المحددة"
            : "تم عرض كافة المحتويات",
        })
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setError("فشل في تحميل المحتوى")
        toast({
          title: "خطأ",
          description: "فشل في تحميل المحتوى",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
		console.log("after feedpge")
  //}, [typeParam, attributesParam, time, search, sort, toast])
	}, [searchParams, toast])

		//console.log("page feed content types",contentTypes, "attr",attributes)


  const handleSortChange = (sort: "newest" | "popular" | "trending") => {
    const params = new URLSearchParams(searchParams.toString())
    if (sort !== "newest") {
      params.set("sort", sort)
    } else {
      params.delete("sort")
    }
    router.push(`/feed?${params.toString()}`)

    toast({
      title: "تم تغيير الترتيب",
      description: `تم ترتيب المحتوى حسب ${
        sort === "newest" ? "الأحدث" : sort === "popular" ? "الأكثر شعبية" : "الأكثر رواجاً"
      }`,
    })
  }

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar)
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink" dir="rtl">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">المحتويات</h1>
            <Button variant="outline" size="sm" className="border-vintage-border" onClick={toggleMobileSidebar}>
              <Filter className="h-4 w-4 ml-2" />
              {showMobileSidebar ? "إخفاء الفلاتر" : "عرض الفلاتر"}
            </Button>
          </div>

          {/* Sidebar - Mobile */}
          <div className={`md:hidden ${showMobileSidebar ? "block" : "hidden"} w-full mb-6 transition-all duration-300 fixed top-16 left-0 z-50 bg-vintage-paper`}>
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
								<SidebarProvider>
									<FeedSidebar contentTypes={contentTypes} attributes={attributes} />
								</SidebarProvider>
							</div>
          </div>

          {/* Sidebar - Desktop */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5">
            <div className="sticky top-20">
              <SidebarProvider>
                <FeedSidebar contentTypes={contentTypes} attributes={attributes} />
              </SidebarProvider>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold hidden md:block">المحتويات</h1>

              <div className="flex items-center gap-2 mr-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-vintage-border">
                      <SlidersHorizontal className="h-4 w-4 ml-2" />
                      ترتيب حسب
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 border-vintage-border">
                    <DropdownMenuLabel>ترتيب المحتوى</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-vintage-border" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className={sort === "newest" ? "bg-vintage-paper-dark/10" : ""}
                        onClick={() => handleSortChange("newest")}
                      >
                        الأحدث
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={sort === "popular" ? "bg-vintage-paper-dark/10" : ""}
                        onClick={() => handleSortChange("popular")}
                      >
                        الأكثر شعبية
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={sort === "trending" ? "bg-vintage-paper-dark/10" : ""}
                        onClick={() => handleSortChange("trending")}
                      >
                        الأكثر رواجاً
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex border border-vintage-border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none px-2 ${viewMode === "grid" ? "bg-vintage-paper-dark/10" : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="sr-only">عرض شبكي</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none px-2 ${viewMode === "list" ? "bg-vintage-paper-dark/10" : ""}`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">عرض قائمة</span>
                  </Button>
                </div>
              </div>
            </div>

            <ContentFeed
              viewMode={viewMode}
              content={content}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
