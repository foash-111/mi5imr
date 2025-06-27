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
  const [contentTypes, setContentTypes] = useState<{ id: string; label: string; count: number; _id?: string; icon?: string }[]>([])
  const [totalCount, setTotalCount] = useState(0) // New state for total count
  const [content, setContent] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
	const [skip, setSkip] = useState(0) // New state for skip
  const limit = 10 // Define limit (same as in getAllContent)
  const [attributes, setAttributes] = useState<{ id: string; label: string; count: number }[]>([])
  const [allCategories, setAllCategories] = useState<{ id: string; label: string; count: number; contentTypeId?: string; isDefault: boolean }[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
	const sort = useMemo(() => searchParams.get("sort") || "newest", [searchParams])
	const typeParam = useMemo(() => searchParams.get("type")?.split(",") || [], [searchParams])
	const attributesParam = useMemo(() => searchParams.get("attributes")?.split(",") || [], [searchParams])
	const time = useMemo(() => searchParams.get("time"), [searchParams])
	const search = useMemo(() => searchParams.get("q"), [searchParams])
	const skipParam = useMemo(() => parseInt(searchParams.get("skip") || "0"), [searchParams]) // Get skip from URL

  
	useEffect(() => {
    setSkip(skipParam) // Initialize skip from URL
  }, [])

  useEffect(() => {
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
          _id: t._id, // Include the database ID
          icon: t.icon, // Include the icon information
        })))

        // Fetch all categories with counts
        const categoriesResponse = await fetch('/api/categories?withCounts=true')
        const allCategoriesData = await categoriesResponse.json()
        setAllCategories(allCategoriesData.map((cat: any) => ({
          id: cat._id, // Use database _id instead of name for uniqueness
          label: cat.label,
          count: cat.count || 0, // Now this will have the actual count
          contentTypeId: cat.contentTypeId,
          isDefault: cat.isDefault,
        })))

        // Filter categories based on selected content types
        let filteredCategories = []
        if (typeParam.length > 0) {
          // Scenario 2: When content types are selected - show only content-specific categories
          const selectedTypeIds = types
            .filter((t: any) => typeParam.includes(t.label))
            .map((t: any) => t._id)
          
          // Show only categories for selected content types (hide defaults)
          filteredCategories = allCategoriesData.filter((cat: any) => 
            !cat.isDefault && selectedTypeIds.includes(cat.contentTypeId)
          )
        } else {
          // Scenario 1: When no content types selected - show only default categories
          filteredCategories = allCategoriesData.filter((cat: any) => cat.isDefault)
        }

        setAttributes(filteredCategories.map((cat: any) => ({
          id: cat._id, // Use database _id instead of name for uniqueness
          label: cat.label,
          count: cat.count || 0, // Use the actual count from the API
        })))

        const options: any = {
          contentType: typeParam.length > 0 ? typeParam : undefined,
          category: attributesParam.length > 0 ? attributesParam : undefined,
          sortBy: sort,
          published: true,
          limit: 10,
          skip,
          createdAt: getCreatedAtFilter(time),
          search: search || undefined,
        }

        // Scenario 3: Handle default category selection for cross-type exploration
        if (attributesParam.length > 0 && typeParam.length === 0) {
          // When default categories are selected but no content types, 
          // we need to find all content types that have categories with the same names
          const selectedDefaultCategories = allCategoriesData.filter((cat: any) => 
            attributesParam.includes(cat._id) && cat.isDefault
          )
          
          if (selectedDefaultCategories.length > 0) {
            // Find all content types that have categories with the same names as selected defaults
            const matchingCategoryNames = selectedDefaultCategories.map(cat => cat.label)
            const matchingContentTypes = allCategoriesData
              .filter((cat: any) => 
                !cat.isDefault && matchingCategoryNames.includes(cat.label)
              )
              .map(cat => cat.contentTypeId)
            
            // Get content type labels for matching types
            const matchingTypeLabels = types
              .filter((t: any) => matchingContentTypes.includes(t._id))
              .map((t: any) => t.label)
            
            if (matchingTypeLabels.length > 0) {
              options.contentType = matchingTypeLabels
            }
          }
        }

        const { content: allContent, totalCount } = await getContent(options)
        setContent(allContent)
        setTotalCount(totalCount) // Set total count

        toast({
          title: typeParam.length || attributesParam.length || time || search ? "تم تطبيق الفلتر" : "جميع المحتويات",
          description: typeParam.length || attributesParam.length || time || search
            ? typeParam.length > 0 
              ? "تم عرض المحتوى بناءً على الأنواع والتصنيفات المحددة"
              : attributesParam.length > 0
              ? "تم عرض المحتوى من جميع الأنواع بناءً على التصنيفات الافتراضية المحددة"
              : "تم عرض المحتوى بناءً على الفلاتر المحددة"
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
//	}, [searchParams, toast])
}, [searchParams, toast, skip, typeParam, attributesParam, sort, time, search])

		//console.log("page feed content types",contentTypes, "attr",attributes)

  const handleSortChange = (sort: "newest" | "popular" | "trending") => {
    const params = new URLSearchParams(searchParams.toString())
    if (sort !== "newest") {
      params.set("sort", sort)
    } else {
      params.delete("sort")
    }
		params.set("skip", "0") // Reset skip when sorting
    router.push(`/feed?${params.toString()}`)

    toast({
      title: "تم تغيير الترتيب",
      description: `تم ترتيب المحتوى حسب ${
        sort === "newest" ? "الأحدث" : sort === "popular" ? "الأكثر شعبية" : "الأكثر رواجاً"
      }`,
    })
  }
	const handlePreviousPage = () => {
    const newSkip = Math.max(0, skip - limit)
    setSkip(newSkip)
    const params = new URLSearchParams(searchParams.toString())
    if (newSkip > 0) {
      params.set("skip", newSkip.toString())
    } else {
      params.delete("skip")
    }
    router.push(`/feed?${params.toString()}`)
  }

  const handleNextPage = () => {
    const newSkip = skip + limit
    setSkip(newSkip)
    const params = new URLSearchParams(searchParams.toString())
    params.set("skip", newSkip.toString())
    router.push(`/feed?${params.toString()}`)
		console.log("next page params:", params.toString())
  }

	const isPreviousDisabled = skip === 0
  const isNextDisabled = skip + limit >= totalCount

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

          {/* Sidebar - Desktop */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto sidebar-scrollable">
              <SidebarProvider>
                <FeedSidebar 
                  contentTypes={contentTypes} 
                  attributes={attributes} 
                  selectedTypes={typeParam}
                  allCategories={allCategories}
                />
              </SidebarProvider>
            </div>
          </div>

          {/* Sidebar - Mobile */}
          <div className={`md:hidden ${showMobileSidebar ? "block" : "hidden"} w-full mb-6 transition-all duration-300 fixed top-16 left-0 z-50 bg-vintage-paper border-b border-vintage-border shadow-lg`}>
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto p-4 sidebar-scrollable">
              <SidebarProvider>
                <FeedSidebar 
                  contentTypes={contentTypes} 
                  attributes={attributes} 
                  selectedTypes={typeParam}
                  allCategories={allCategories}
                />
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
						{/* Pagination Buttons */}
              <div className="mt-4 flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={isPreviousDisabled}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={isNextDisabled}
                >
                  التالي
                </Button>
              </div>
            </div>
          </div>
      </main>
      <Footer />
    </div>
  )
}
