"use client"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Music,
  Video,
  FileText,
  Mic,
  Coffee,
  Search,
  Drama,
  Smile,
  Brain,
  Bookmark,
  Clock,
  Flame,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Time filters
const timeFilters = [
  { id: "today", label: "اليوم" },
  { id: "this-week", label: "هذا الأسبوع" },
  { id: "this-month", label: "هذا الشهر" },
  { id: "this-year", label: "هذا العام" },
]

// Sort options
const sortOptions = [
  { id: "newest", label: "الأحدث", icon: Clock },
  { id: "popular", label: "الأكثر شعبية", icon: Bookmark },
  { id: "trending", label: "الأكثر رواجاً", icon: Flame },
]


interface FeedSidebarProps {
  contentTypes: { id: string; label: string; count: number }[]
  attributes: { id: string; label: string; count: number }[]
}

const getIconForType = (id: string) => {
  const iconMap: { [key: string]: any } = {
    articles: FileText,
    stories: BookOpen,
    poetry: Music,
    cinema: Video,
    reflections: Coffee,
    podcasts: Mic,
    drama: Drama,
    comedy: Smile,
    'self-development': Brain,
  }
  return iconMap[id] || FileText
}

export function FeedSidebar({ contentTypes, attributes}: FeedSidebarProps) {
	//console.log("side feed content types",contentTypes, "attr",attributes)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string | null>(null)
  const [selectedSort, setSelectedSort] = useState<string>("newest")
  const [contentTypeSearch, setContentTypeSearch] = useState("")
  const [attributeSearch, setAttributeSearch] = useState("")

 const filteredContentTypes = useMemo(
    () => contentTypes.filter(type => type.label.toLowerCase().includes(contentTypeSearch.toLowerCase())),
    [contentTypes, contentTypeSearch]
  )

  const filteredAttributes = useMemo(
    () => attributes.filter(attr => attr.label.toLowerCase().includes(attributeSearch.toLowerCase())),
    [attributes, attributeSearch]
  )

  // Initialize from URL params
  useEffect(() => {
    const type = searchParams.get("type")?.split(",") || []
    const attr = searchParams.get("attributes")?.split(",") || []
    const time = searchParams.get("time")
    const q = searchParams.get("q") || ""
    const sort = searchParams.get("sort") || "newest"

    //setSelectedTypes(type.filter((t) => contentTypes.some((ct) => ct.id === t)))

		setSelectedTypes(type.filter((t) => contentTypes.some((ct) => ct.id === t)))
    setSelectedAttributes(attr.filter((attr) => attributes.some((a) => a.id === attr)))
    setSelectedTimeFilter(timeFilters.some((t) => t.id === time) ? time : null)
    setSearchQuery(q)
    setSelectedSort(sortOptions.some((s) => s.id === sort) ? sort : "newest")
  }, [searchParams])

  // Update URL on filter changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedTypes.length > 0) {
      params.set("type", selectedTypes.join(","))
    }
    if (selectedAttributes.length > 0) {
      params.set("attributes", selectedAttributes.join(","))
    }
    if (selectedTimeFilter) {
      params.set("time", selectedTimeFilter)
    }
    if (searchQuery) {
      params.set("q", searchQuery)
    }
    if (selectedSort !== "newest") {
      params.set("sort", selectedSort)
    }
    const queryString = params.toString()
    router.push(queryString ? `/feed?${queryString}` : "/feed")
  }, [selectedTypes, selectedAttributes, selectedTimeFilter, searchQuery, selectedSort, router])

  const handleTypeChange = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleAttributeChange = (id: string) => {
    setSelectedAttributes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleTimeFilterChange = (id: string) => {
    setSelectedTimeFilter(selectedTimeFilter === id ? null : id)
  }

  const handleSortChange = (id: string) => {
    setSelectedSort(id)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTypes([])
    setSelectedAttributes([])
    setSelectedTimeFilter(null)
    setSelectedSort("newest")
    setContentTypeSearch("")
    setAttributeSearch("")
    toast({
      title: "تم مسح الفلاتر",
      description: "تم إعادة ضبط جميع الفلاتر",
    })
  }

  const removeFilter = (filterType: string, filterId: string) => {
    switch (filterType) {
      case "search":
        setSearchQuery("")
        break
      case "type":
        setSelectedTypes((prev) => prev.filter((id) => id !== filterId))
        break
      case "attribute":
        setSelectedAttributes((prev) => prev.filter((id) => id !== filterId))
        break
      case "time":
        setSelectedTimeFilter(null)
        break
      case "sort":
        setSelectedSort("newest")
        break
    }
  }

  const totalActiveFilters =
    (searchQuery ? 1 : 0) +
    selectedTypes.length +
    selectedAttributes.length +
    (selectedTimeFilter ? 1 : 0) +
    (selectedSort !== "newest" ? 1 : 0)

  return (
    <Card className="border-vintage-border backdrop-blur-sm" dir="rtl">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="font-semibold"> البحث والفلترة</span>
            {totalActiveFilters > 0 && (
              <Badge variant="secondary" className="h-5 text-xs bg-vintage-accent/20">
                {totalActiveFilters} 
              </Badge>
            )}
          </div>
          {totalActiveFilters > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs border-vintage-border hover:bg-vintage-accent hover:text-white"
              aria-label="مسح جميع الفلاتر"
            > 
              مسح الكل  
            </Button>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في المحتوى..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 border-vintage-border focus-visible:ring-vintage-accent"
            aria-label="ابحث في المحتوى"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-6 w-6 p-0"
              onClick={() => setSearchQuery("")}
              aria-label="مسح البحث"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {totalActiveFilters > 0 && (
  <div className="mb-4">
    <div className="text-sm font-medium mb-2">الفلاتر النشطة</div>
    <div className="flex flex-wrap gap-2">
      {searchQuery && (
        <Badge variant="secondary" className="bg-vintage-paper-dark/10 hover:bg-vintage-paper-dark/20">
          بحث: {searchQuery}
          <button
            className="mr-1 hover:text-vintage-accent"
            onClick={() => removeFilter("search", "")}
            aria-label="إزالة فلتر البحث"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {selectedTypes.map((typeId) => {
        const type = contentTypes.find((t) => t.id === typeId);
        return type ? (
          <Badge
            key={typeId}
            variant="secondary"
            className="bg-vintage-paper-dark/10 hover:bg-vintage-paper-dark/20"
          >
            {type.label}
            <button
              className="mr-1 hover:text-vintage-accent"
              onClick={() => removeFilter("type", typeId)}
              aria-label={`إزالة فلتر ${type.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ) : null;
      })}
      {selectedAttributes.map((attrId) => {
        const attr = attributes.find((a) => a.id === attrId);
        return attr ? (
          <Badge
            key={attrId}
            variant="secondary"
            className="bg-vintage-paper-dark/10 hover:bg-vintage-paper-dark/20"
          >
            {attr.label}
            <button
              className="mr-1 hover:text-vintage-accent"
              onClick={() => removeFilter("attribute", attrId)}
              aria-label={`إزالة فلتر ${attr.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ) : null;
      })}
      {selectedTimeFilter && (
        <Badge variant="secondary" className="bg-vintage-paper-dark/10 hover:bg-vintage-paper-dark/20">
          {timeFilters.find((t) => t.id === selectedTimeFilter)?.label}
          <button
            className="mr-1 hover:text-vintage-accent"
            onClick={() => removeFilter("time", "")}
            aria-label="إزالة فلتر الفترة الزمنية"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {selectedSort !== "newest" && (
        <Badge variant="secondary" className="bg-vintage-paper-dark/10 hover:bg-vintage-paper-dark/20">
          {sortOptions.find((s) => s.id === selectedSort)?.label}
          <button
            className="mr-1 hover:text-vintage-accent"
            onClick={() => removeFilter("sort", "")}
            aria-label="إزالة فلتر الترتيب"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  </div>
)}

        <div className="mb-4">
          <h3 className="font-medium mb-2">نوع المحتوى</h3>
          <div className="relative mb-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في الأنواع..."
              value={contentTypeSearch}
              onChange={(e) => setContentTypeSearch(e.target.value)}
              className="pr-8 border-vintage-border"
              aria-label="ابحث في أنواع المحتوى"
            />
            {contentTypeSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => setContentTypeSearch("")}
                aria-label="مسح بحث الأنواع"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="space-y-2">
						{filteredContentTypes.map((type) => {
              const Icon = getIconForType(type.id) // Get the icon component
              return (
                <div key={type.id} className="flex items-center justify-between space-x-2 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={() => handleTypeChange(type.id)}
                      className="border-vintage-border data-[state=checked]:bg-vintage-accent data-[state=checked]:border-vintage-accent"
                      aria-label={`تحديد ${type.label}`}
                    />
                    <label
                      htmlFor={`type-${type.id}`}
                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" /> {/* Use the Icon component */}
                      {type.label}
                    </label>
                  </div>
                  <Badge variant="outline" className="h-5 text-xs border-vintage-border">
                    {type.count}
                  </Badge>
                </div>
              )
            })}
            {filteredContentTypes.length === 0 && contentTypeSearch && (
              <div className="text-center text-sm text-muted-foreground">لا توجد أنواع مطابقة</div>
            )}
          </div>
        </div>

        <Separator className="my-4 bg-vintage-border" />

        <div className="mb-4">
          <h3 className="font-medium mb-2">التصنيفات</h3>
          <div className="relative mb-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في التصنيفات..."
              value={attributeSearch}
              onChange={(e) => setAttributeSearch(e.target.value)}
              className="pr-8 border-vintage-border"
              aria-label="ابحث في التصنيفات"
            />
            {attributeSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => setAttributeSearch("")}
                aria-label="مسح بحث التصنيفات"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {filteredAttributes.map((attr) => (
              <div key={attr.id} className="flex items-center justify-between space-x-2 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`attr-${attr.id}`}
                    checked={selectedAttributes.includes(attr.id)}
                    onCheckedChange={() => handleAttributeChange(attr.id)}
                    className="border-vintage-border data-[state=checked]:bg-vintage-accent data-[state=checked]:border-vintage-accent"
                    aria-label={`تحديد ${attr.label}`}
                  />
                  <label
                    htmlFor={`attr-${attr.id}`}
                    className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {/*<attr.icon className="h-4 w-4" />*/}
                    {attr.label}
                  </label>
                </div>
                <Badge variant="outline" className="h-5 text-xs border-vintage-border">
                  {attr.count}
                </Badge>
              </div>
            ))}
            {filteredAttributes.length === 0 && attributeSearch && (
              <div className="text-center text-sm text-muted-foreground">لا توجد تصنيفات مطابقة</div>
            )}
          </div>
        </div>

        <Separator className="my-4 bg-vintage-border" />

        <div className="mb-4">
          <h3 className="font-medium mb-2">الفترة الزمنية</h3>
          <div className="flex flex-wrap gap-2">
            {timeFilters.map((filter) => (
              <Button
                key={filter.id}
                type="button"
                variant={selectedTimeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeFilterChange(filter.id)}
                className={
                  selectedTimeFilter === filter.id
                    ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                    : "border-vintage-border"
                }
                aria-label={`تصفية حسب ${filter.label}`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-4 bg-vintage-border" />

        <div className="mb-4">
          <h3 className="font-medium mb-2">ترتيب حسب</h3>
          <div className="flex flex-col gap-2">
            {sortOptions.map((sort) => (
              <Button
                key={sort.id}
                type="button"
                variant={selectedSort === sort.id ? "default" : "outline"}
                size="sm"
                className={
                  selectedSort === sort.id
                    ? "justify-start bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                    : "justify-start border-vintage-border"
                }
                onClick={() => handleSortChange(sort.id)}
                aria-label={`ترتيب حسب ${sort.label}`}
              >
                <sort.icon className="h-4 w-4 mr-2" />
                {sort.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>


  )

}
