"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface Category {
  _id: string
  name: string
  label: string
  isDefault: boolean
  contentTypeId?: string
}

interface ContentCategoriesSelectorProps {
  selectedCategories: string[]
  onCategoryChange: (categoryId: string) => void
  contentTypeId?: string
  categories?: Category[]
  onCategoriesChange?: (categories: Category[]) => void
}

export function ContentCategoriesSelector({ 
  selectedCategories, 
  onCategoryChange, 
  contentTypeId,
  categories = [],
  onCategoriesChange
}: ContentCategoriesSelectorProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // If categories are provided as props, use them directly
  // Otherwise, fall back to fetching from API (for backward compatibility)
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)

  // Update local categories when prop changes
  useEffect(() => {
    setLocalCategories(categories)
    onCategoriesChange?.(categories)
  }, [categories, onCategoriesChange])

  // Fetch categories for the selected content type (fallback for backward compatibility)
  useEffect(() => {
    // If categories are provided as props, don't fetch
    if (categories.length > 0 || !contentTypeId) {
      return
    }

    async function fetchCategories() {
      setIsLoading(true)
      try {
        // Use a different endpoint that only returns content-type specific categories
        const response = await fetch(`/api/categories?contentTypeId=${contentTypeId}&excludeDefault=true`)
        if (response.ok) {
          const data = await response.json()
          setLocalCategories(data)
          onCategoriesChange?.(data)
        } else {
          throw new Error("Failed to fetch categories")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "خطأ في تحميل التصنيفات",
          description: "تعذر تحميل تصنيفات المحتوى",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [contentTypeId, toast, onCategoriesChange, categories.length])

  const handleCategoryToggle = (categoryId: string) => {
    onCategoryChange(categoryId)
  }

  if (!contentTypeId) {
    return (
      <div className="grid gap-3">
        <Label>تصنيفات المحتوى</Label>
        <div className="text-sm text-muted-foreground p-3 border rounded-md border-vintage-border ">
          يرجى اختيار نوع المحتوى أولاً لعرض التصنيفات المتاحة
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-3">
        <Label>تصنيفات المحتوى</Label>
        <div className="text-sm text-muted-foreground p-3 border rounded-md border-vintage-border">
          جاري تحميل التصنيفات...
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <Label>تصنيفات المحتوى</Label>
      {localCategories.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {localCategories.map((category) => (
            <Button
              key={category._id}
              type="button"
              variant={selectedCategories.includes(category._id) ? "default" : "outline"}
              onClick={() => handleCategoryToggle(category._id)}
              className={
                selectedCategories.includes(category._id)
                  ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                  : "border-vintage-border hover:bg-gray-50"
              }
              size="sm"
            >
              {category.label}
            </Button>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground p-3 border rounded-md border-vintage-border">
          لا توجد تصنيفات متاحة لهذا النوع من المحتوى
        </div>
      )}
      {selectedCategories.length > 0 && (
        <div className="text-xs text-muted-foreground">
          تم اختيار {selectedCategories.length} تصنيف
        </div>
      )}
    </div>
  )
} 