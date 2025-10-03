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
  Heart,
  Leaf,
  Lightbulb,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  Sparkles,
  Newspaper,
  PenTool,
  Camera,
  Headphones,
  Film,
  Feather,
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

// Icon mapping for content types (admin-chosen icons)
const ICON_COMPONENTS = {
  FileText,
  BookOpen,
  Music,
  Video,
  Coffee,
  Mic,
  Newspaper,
  PenTool,
  Camera,
  Headphones,
  Film,
  Feather,
}

interface FeedSidebarProps {
  contentTypes: { id: string; label: string; count: number; _id?: string; icon?: string }[]
  attributes: { id: string; label: string; count: number }[]
  selectedTypes?: string[]
  allCategories?: { id: string; label: string; count: number; contentTypeId?: string; isDefault?: boolean }[]
}

const getIconForType = (label: string, iconName?: string) => {
  // If we have an admin-chosen icon, use it
  if (iconName && ICON_COMPONENTS[iconName as keyof typeof ICON_COMPONENTS]) {
    return ICON_COMPONENTS[iconName as keyof typeof ICON_COMPONENTS]
  }

  // Fallback to hardcoded mapping for categories and legacy content types
  const iconMap: { [key: string]: any } = {
    // Content Types (fallback)
    "مقالات": FileText,        // Articles - Document icon
    "حواديت": BookOpen,        // Stories - Book icon
    "شعر": Heart,              // Poetry - Heart icon (for love/emotion)
    "سينما": Video,            // Cinema - Video icon
    "تأملات": Lightbulb,       // Reflections - Lightbulb icon (for wisdom/insights)
    "بودكاست": Mic,            // Podcasts - Microphone icon
    
    // Categories
    "دراما": Drama,            // Drama
    "كوميدي": Smile,           // Comedy
    "تطوير ذات": Brain,        // Self Development
    "مغامرة": TrendingUp,      // Adventure
    "رومانسي": Heart,          // Romance
    "غموض": Sparkles,          // Mystery
    "حب": Heart,               // Love
    "طبيعة": Leaf,             // Nature
    "فلسفة": Lightbulb,        // Philosophy
    "أكشن": Flame,             // Action
    "وثائقي": FileText,        // Documentary
    "كلاسيكي": Star,           // Classic
    "روحانيات": Sparkles,      // Spirituality
    "وعي": Brain,              // Mindfulness
    "حكمة": Lightbulb,         // Wisdom
    "مقابلات": Users,          // Interviews
    "مناقشات": MessageSquare,  // Discussions
    "قصص": BookOpen,           // Stories (podcast category)
    
    // Default Categories
    "مميز": Star,              // Featured
    "رائج": TrendingUp,        // Trending
    "جديد": Sparkles,          // New
  }
  return iconMap[label] || FileText
}

export function FeedSidebar({ contentTypes, attributes, selectedTypes: initialSelectedTypes, allCategories }: FeedSidebarProps) {
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

  // Local data (fallback to fetching when props are empty)
  const [localContentTypes, setLocalContentTypes] = useState<typeof contentTypes>(contentTypes || [])
  const [localAllCategories, setLocalAllCategories] = useState<FeedSidebarProps["allCategories"]>(allCategories || [])
  const [defaultCategoriesState, setDefaultCategoriesState] = useState<FeedSidebarProps["allCategories"]>([])

  // Fetch content types if not provided
  useEffect(() => {
    if (!contentTypes || contentTypes.length === 0) {
      ;(async () => {
        try {
          const res = await fetch("/api/content-types")
          if (res.ok) {
            const data = await res.json()
            const mapped = (data || []).map((t: any) => ({ id: t._id || t.id, label: t.label, count: t.count || 0, _id: t._id, icon: t.icon }))
            setLocalContentTypes(mapped)
          }
        } catch (e) {
          console.error("Failed to fetch content types:", e)
        }
      })()
    } else {
      setLocalContentTypes(contentTypes)
    }
  }, [contentTypes])

  // Fetch ALL categories once (with counts) and keep in memory for filtering
  useEffect(() => {
    if (!allCategories || allCategories.length === 0) {
      ;(async () => {
        try {
          const res = await fetch("/api/categories?withCounts=true")
          if (res.ok) {
            const data = await res.json()
            const mapped = (data || []).map((c: any) => ({
              id: c._id || c.id,
              label: c.label,
              count: c.count || 0,
              isDefault: !!c.isDefault,
              contentTypeId: c.contentTypeId || undefined,
            }))
            setLocalAllCategories(mapped)
            setDefaultCategoriesState(mapped.filter((c: { isDefault?: boolean }) => !!c.isDefault))
          }
        } catch (e) {
          console.error("Failed to fetch categories:", e)
        }
      })()
    } else {
      setLocalAllCategories(allCategories)
      setDefaultCategoriesState(allCategories.filter((c) => !!c.isDefault))
    }
  }, [allCategories])

  // We no longer fetch per selection; we filter the preloaded list in dynamicAttributes

  // Dynamic category filtering based on selected content types
  const dynamicAttributes = useMemo(() => {
    // Coerce to a unified shape so we can safely read isDefault/contentTypeId
    const normalized = (localAllCategories && localAllCategories.length > 0
      ? localAllCategories
      : attributes
    ).map((c: any) => ({
      id: c.id,
      label: c.label,
      count: c.count,
      isDefault: !!c.isDefault,
      contentTypeId: c.contentTypeId as string | undefined,
    }))

    const baseCategories = normalized
    if (!baseCategories || baseCategories.length === 0) {
      return attributes
    }

    // Scenario 1: When no content types are selected - show only default categories
    if (selectedTypes.length === 0) {
      const defaultCategories = baseCategories
        .filter(cat => cat.isDefault)
        .map(cat => ({
          id: cat.id,
          label: cat.label,
          count: cat.count
        }))
      return defaultCategories
    }

    // Scenario 2: When one or more content types are selected
    // Get content type IDs for selected types
    const selectedTypeIds = (localContentTypes || contentTypes)
      .filter(type => {
        const candidateId = (type as any)._id || type.id
        return selectedTypes.includes(candidateId)
      })
      .map(type => ((type as any)._id || type.id)) // Always use the stable internal id

    // Show only categories associated with the selected content types (hide defaults)
    const contentTypeCategories = baseCategories.filter(cat => 
      !cat.isDefault && selectedTypeIds.includes(cat.contentTypeId)
    )

    // Remove duplicates by strong Arabic-safe normalization
    const normalize = (s: string) => {
      return s
        // remove Arabic tatweel
        .replace(/\u0640/g, "")
        // remove Arabic diacritics (tashkeel)
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
        // unify whitespace
        .replace(/\s+/g, " ")
        .trim()
        .toLocaleLowerCase()
        .normalize("NFKC")
    }
    const seen = new Set<string>()
    const uniqueCategories = contentTypeCategories.filter((cat) => {
      const key = normalize(cat.label)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return uniqueCategories.map(cat => ({
      id: cat.id,
      label: cat.label,
      count: cat.count
    }))
  }, [localAllCategories, attributes, selectedTypes, localContentTypes, contentTypes])

 const filteredContentTypes = useMemo(
    () => (localContentTypes || contentTypes).filter(type => type.label.toLowerCase().includes(contentTypeSearch.toLowerCase())),
    [localContentTypes, contentTypes, contentTypeSearch]
  )

 const filteredAttributes = useMemo(
    () => dynamicAttributes.filter((attr: { label: string }) => attr.label.toLowerCase().includes(attributeSearch.toLowerCase())),
    [dynamicAttributes, attributeSearch]
  )

  // Initialize from URL params
  useEffect(() => {
    const type = searchParams.get("type")?.split(",") || []
    const attr = searchParams.get("attributes")?.split(",") || []
    const time = searchParams.get("time")
    const q = searchParams.get("q") || ""
    const sort = searchParams.get("sort") || "newest"

    // For content types, map URL labels -> internal ids
    const typesByLabel = (localContentTypes || contentTypes)
    const mappedTypeIds = type
      .map((t) => {
        const match = typesByLabel.find((ct) => ct.label === t)
        if (!match) return undefined
        return (match as any)._id || match.id
      })
      .filter((v): v is string => Boolean(v))
    setSelectedTypes(mappedTypeIds)
    
    // For attributes, we need to match by the new id structure (database _id)
    setSelectedAttributes(attr.filter((attrId) => attributes.some((a) => a.id === attrId)))
    setSelectedTimeFilter(timeFilters.some((t) => t.id === time) ? time : null)
    setSearchQuery(q)
    setSelectedSort(sortOptions.some((s) => s.id === sort) ? sort : "newest")
  }, [searchParams, localContentTypes, attributes, contentTypes])

  // Update URL on filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedTypes.length > 0) {
      // Use content type labels for URL parameters
      const typeLabels = selectedTypes.map(typeId => {
        const contentType = (localContentTypes || contentTypes)
          .find(ct => (ct as any)._id === typeId || ct.id === typeId)
        return contentType ? contentType.label : typeId
      })
      params.set("type", typeLabels.join(","))
    } else {
      params.delete("type")
    }
    if (selectedAttributes.length > 0) {
      // Use the new id structure (database _id) for attributes
      params.set("attributes", selectedAttributes.join(","))
    } else {
      params.delete("attributes")
    }
    if (selectedTimeFilter) {
      params.set("time", selectedTimeFilter)
    } else {
      params.delete("time")
    }
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    if (selectedSort !== "newest") {
      params.set("sort", selectedSort)
    } else {
      params.delete("sort")
    }
    const queryString = params.toString()
    router.replace(queryString ? `/feed?${queryString}` : "/feed")
  }, [selectedTypes, selectedAttributes, selectedTimeFilter, searchQuery, selectedSort, router, contentTypes, searchParams])

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
            {(() => {
              const Icon = getIconForType(type.label, type.icon)
              return <Icon className="h-3 w-3 ml-1" />
            })()}
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
            {(() => {
              const Icon = getIconForType(attr.label)
              return <Icon className="h-3 w-3 ml-1" />
            })()}
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
              const Icon = getIconForType(type.label, type.icon)
              const derivedId = (type as any)._id || type.id
              return (
                <div key={derivedId} className="flex items-center justify-between space-x-2 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`type-${derivedId}`}
                      checked={selectedTypes.includes(derivedId)}
                      onCheckedChange={() => handleTypeChange(derivedId)}
                      className="border-vintage-border data-[state=checked]:bg-vintage-accent data-[state=checked]:border-vintage-accent"
                      aria-label={`تحديد ${type.label}`}
                    />
                    <label
                      htmlFor={`type-${derivedId}`}
                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
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
          <h3 className="font-medium mb-2">
            التصنيفات
            {selectedTypes.length > 0 ? (
              <span className="text-xs text-muted-foreground font-normal mr-2">
                (مفلترة حسب الأنواع المحددة)
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-normal mr-2">
                (التصنيفات الافتراضية)
              </span>
            )}
          </h3>
          {selectedTypes.length === 0 && (
            <p className="text-xs text-muted-foreground mb-2">
              اختر نوع محتوى لعرض تصنيفاته الخاصة
            </p>
          )}
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
                    {(() => {
                      const Icon = getIconForType(attr.label)
                      return <Icon className="h-4 w-4" />
                    })()}
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
            {filteredAttributes.length === 0 && !attributeSearch && selectedTypes.length > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                لا توجد تصنيفات متاحة للأنواع المحددة
              </div>
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
                <Clock className="h-3 w-3 ml-1" />
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
