"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Music, Video, FileText, Mic, Search, Coffee, Drama, Smile, Brain } from "lucide-react"

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

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])

  const handleTypeChange = (id: string) => {
    setSelectedTypes((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleAttributeChange = (id: string) => {
    setSelectedAttributes((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Search query:", searchQuery)
    console.log("Selected types:", selectedTypes)
    console.log("Selected attributes:", selectedAttributes)
    // Here you would typically filter content based on these criteria
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setSelectedAttributes([])
    setSearchQuery("")
  }

  return (
    <Card className="border-vintage-border  backdrop-blur-sm sticky top-20">
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
        </form>

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
      </div>
    </Card>
  )
}
