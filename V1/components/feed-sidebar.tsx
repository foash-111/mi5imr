"use client"

import type React from "react"

import { useState } from "react"
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

// Content types
const contentTypes = [
  { id: "articles", label: "مقالات", icon: FileText },
  { id: "stories", label: "حواديت", icon: BookOpen },
  { id: "poetry", label: "شعر", icon: Music },
  { id: "cinema", label: "سينما", icon: Video },
  { id: "reflections", label: "تأملات", icon: Coffee },
  { id: "podcasts", label: "بودكاست", icon: Mic },
]

// Content attributes
const contentAttributes = [
  { id: "drama", label: "دراما", icon: Drama },
  { id: "comedy", label: "كوميدي", icon: Smile },
  { id: "self-development", label: "تطوير ذات", icon: Brain },
]

// Time filters
const timeFilters = [
  { id: "today", label: "اليوم" },
  { id: "this-week", label: "هذا الأسبوع" },
  { id: "this-month", label: "هذا الشهر" },
  { id: "this-year", label: "هذا العام" },
]

export function FeedSidebar() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleTypeChange = (id: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleAttributeChange = (id: string) => {
    setSelectedAttributes((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleTimeFilterChange = (id: string) => {
    setSelectedTimeFilter(selectedTimeFilter === id ? null : id)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Build active filters list
    const newActiveFilters: string[] = []

    if (searchQuery) {
      newActiveFilters.push(`بحث: ${searchQuery}`)
    }

    selectedTypes.forEach((typeId) => {
      const type = contentTypes.find((t) => t.id === typeId)
      if (type) newActiveFilters.push(type.label)
    })

    selectedAttributes.forEach((attrId) => {
      const attr = contentAttributes.find((a) => a.id === attrId)
      if (attr) newActiveFilters.push(attr.label)
    })

    if (selectedTimeFilter) {
      const time = timeFilters.find((t) => t.id === selectedTimeFilter)
      if (time) newActiveFilters.push(time.label)
    }

    setActiveFilters(newActiveFilters)

    // Here you would typically filter content based on these criteria
    console.log({
      searchQuery,
      selectedTypes,
      selectedAttributes,
      selectedTimeFilter,
    })

    toast({
      title: "تم تطبيق الفلترة",
      description: "تم تحديث المحتوى وفقاً للفلاتر المحددة",
    })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTypes([])
    setSelectedAttributes([])
    setSelectedTimeFilter(null)
    setActiveFilters([])

    toast({
      title: "تم مسح الفلاتر",
      description: "تم إعادة ضبط جميع الفلاتر",
    })
  }

  const removeFilter = (filter: string) => {
    // Remove the filter from active filters
    setActiveFilters(activeFilters.filter((f) => f !== filter))

    // Also remove from the actual filter selections
    if (filter.startsWith("بحث:")) {
      setSearchQuery("")
    } else {
      // Check if it's a content type
      const typeMatch = contentTypes.find((t) => t.label === filter)
      if (typeMatch) {
        setSelectedTypes(selectedTypes.filter((id) => id !== typeMatch.id))
        return
      }

      // Check if it's an attribute
      const attrMatch = contentAttributes.find((a) => a.label === filter)
      if (attrMatch) {
        setSelectedAttributes(selectedAttributes.filter((id) => id !== attrMatch.id))
        return
      }

      // Check if it's a time filter
      const timeMatch = timeFilters.find((t) => t.label === filter)
      if (timeMatch) {
        setSelectedTimeFilter(null)
      }
    }
  }

  return (
    <Card className="border-vintage-border  backdrop-blur-sm">
      <div className="p-4">
        <form onSubmit={handleSearch}>
          <div className="relative mb-4">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 border-vintage-border focus-visible:ring-vintage-accent"
            />
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">الفلاتر النشطة</div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="bg-vintage-paper-dark/10 hover:bg-vintage-paper-dark/20"
                  >
                    {filter}
                    <button className="ml-1 hover:text-vintage-accent" onClick={() => removeFilter(filter)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}

                {activeFilters.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground hover:text-vintage-accent"
                    onClick={clearFilters}
                  >
                    مسح الكل
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-medium mb-2">نوع المحتوى</h3>
            <div className="space-y-2">
              {contentTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => handleTypeChange(type.id)}
                    className="border-vintage-border data-[state=checked]:bg-vintage-accent data-[state=checked]:border-vintage-accent"
                  />
                  <label
                    htmlFor={`type-${type.id}`}
                    className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4 bg-vintage-border" />

          <div className="mb-4">
            <h3 className="font-medium mb-2">التصنيفات</h3>
            <div className="space-y-2">
              {contentAttributes.map((attr) => (
                <div key={attr.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`attr-${attr.id}`}
                    checked={selectedAttributes.includes(attr.id)}
                    onCheckedChange={() => handleAttributeChange(attr.id)}
                    className="border-vintage-border data-[state=checked]:bg-vintage-accent data-[state=checked]:border-vintage-accent"
                  />
                  <label
                    htmlFor={`attr-${attr.id}`}
                    className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <attr.icon className="h-4 w-4" />
                    {attr.label}
                  </label>
                </div>
              ))}
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
              <Button type="button" variant="outline" size="sm" className="justify-start border-vintage-border">
                <Clock className="h-4 w-4 ml-2" />
                الأحدث
              </Button>
              <Button type="button" variant="outline" size="sm" className="justify-start border-vintage-border">
                <Bookmark className="h-4 w-4 ml-2" />
                الأكثر حفظاً
              </Button>
              <Button type="button" variant="outline" size="sm" className="justify-start border-vintage-border">
                <Flame className="h-4 w-4 ml-2" />
                الأكثر رواجاً
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              onClick={handleSearch}
              className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
            >
              تطبيق الفلترة
            </Button>
            <Button variant="outline" onClick={clearFilters} className="border-vintage-border">
              مسح الفلترة
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
