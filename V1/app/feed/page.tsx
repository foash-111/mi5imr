"use client"

import { useState } from "react"
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

export default function FeedPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "trending">("newest")
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const { toast } = useToast()

  const handleSortChange = (sort: "newest" | "popular" | "trending") => {
    setSortBy(sort)
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
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
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

          {/* Sidebar - Mobile (Collapsible) */}
          <div
            className={`md:hidden ${showMobileSidebar ? "block" : "hidden"} w-full mb-6 transition-all duration-300`}
          >
            <FeedSidebar />
          </div>

          {/* Sidebar - Desktop */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5">
            <div className="sticky top-20">
              <FeedSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold hidden md:block">المحتويات</h1>

              <div className="flex items-center gap-2 mr-auto">
                {/* Sort Dropdown */}
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
                        className={sortBy === "newest" ? "bg-vintage-paper-dark/10" : ""}
                        onClick={() => handleSortChange("newest")}
                      >
                        الأحدث
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={sortBy === "popular" ? "bg-vintage-paper-dark/10" : ""}
                        onClick={() => handleSortChange("popular")}
                      >
                        الأكثر شعبية
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={sortBy === "trending" ? "bg-vintage-paper-dark/10" : ""}
                        onClick={() => handleSortChange("trending")}
                      >
                        الأكثر رواجاً
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle */}
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

            <ContentFeed viewMode={viewMode} sortBy={sortBy} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
