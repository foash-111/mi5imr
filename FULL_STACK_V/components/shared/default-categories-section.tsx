"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Plus, Save, Pencil, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface Category {
  _id: string
  name: string
  label: string
  isDefault: boolean
}

interface DefaultCategoriesSectionProps {
  selectedCategories: string[]
  onCategoryChange: (categoryId: string) => void
  defaultCategories?: Category[]
  onCategoriesRefresh?: () => void
}

export function DefaultCategoriesSection({ 
  selectedCategories, 
  onCategoryChange, 
  defaultCategories: propDefaultCategories = [],
  onCategoriesRefresh
}: DefaultCategoriesSectionProps) {
  const { toast } = useToast()
  const [defaultCategories, setDefaultCategories] = useState<Category[]>(propDefaultCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [newCategoryLabel, setNewCategoryLabel] = useState("")

  // Update local state when prop changes
  useEffect(() => {
    setDefaultCategories(propDefaultCategories)
    setIsLoading(false)
  }, [propDefaultCategories])

  // Fetch default categories (fallback for backward compatibility)
  useEffect(() => {
    // If defaultCategories are provided as props, don't fetch
    if (propDefaultCategories.length > 0) {
      setIsLoading(false)
      return
    }

    async function fetchDefaultCategories() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/categories?default=true")
        if (response.ok) {
          const data = await response.json()
          setDefaultCategories(data)
        }
      } catch (error) {
        console.error("Error fetching default categories:", error)
        toast({
          title: "خطأ في تحميل التصنيفات الافتراضية",
          description: "تعذر تحميل التصنيفات الافتراضية",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDefaultCategories()
  }, [toast, propDefaultCategories.length])

  const handleAddDefaultCategory = async () => {
    if (!newCategoryLabel.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم التصنيف",
        variant: "destructive",
      })
      return
    }

    try {
      const newCategory = {
        label: newCategoryLabel,
        isDefault: true,
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      })

      if (response.ok) {
        const createdCategory = await response.json()
        const updatedCategories = [...defaultCategories, createdCategory]
        setDefaultCategories(updatedCategories)
        setNewCategoryLabel("")

        // Trigger refresh in parent component
        onCategoriesRefresh?.()

        toast({
          title: "تم إضافة التصنيف الافتراضي",
          description: `تم إضافة "${newCategoryLabel}" بنجاح`,
        })
      } else {
        throw new Error("Failed to create default category")
      }
    } catch (error) {
      console.error("Error adding default category:", error)
      toast({
        title: "خطأ في إضافة التصنيف الافتراضي",
        description: "تعذر إضافة التصنيف الافتراضي الجديد",
        variant: "destructive",
      })
    }
  }

  const handleEditDefaultCategory = async () => {
    if (!currentCategory || !newCategoryLabel.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال وصف التصنيف",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedCategory = {
        label: newCategoryLabel,
      }

      const response = await fetch(`/api/categories/${currentCategory._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCategory),
      })

      if (response.ok) {
        const updatedCategories = defaultCategories.map((category) =>
          category._id === currentCategory._id ? { ...category, label: newCategoryLabel } : category,
        )

        setDefaultCategories(updatedCategories)
        setCurrentCategory(null)
        setNewCategoryLabel("")
        setIsEditing(false)

        // Trigger refresh in parent component
        onCategoriesRefresh?.()

        toast({
          title: "تم تعديل التصنيف الافتراضي",
          description: `تم تحديث "${newCategoryLabel}" بنجاح`,
        })
      } else {
        throw new Error("Failed to update default category")
      }
    } catch (error) {
      console.error("Error updating default category:", error)
      toast({
        title: "خطأ في تعديل التصنيف الافتراضي",
        description: "تعذر تحديث التصنيف الافتراضي",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDefaultCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const updatedCategories = defaultCategories.filter((category) => category._id !== categoryId)
        setDefaultCategories(updatedCategories)

        // Remove from selected categories if it was selected
        if (selectedCategories.includes(categoryId)) {
          onCategoryChange(categoryId)
        }

        // Trigger refresh in parent component
        onCategoriesRefresh?.()

        toast({
          title: "تم حذف التصنيف الافتراضي",
          description: "تم حذف التصنيف الافتراضي بنجاح",
        })
      } else {
        throw new Error("Failed to delete default category")
      }
    } catch (error) {
      console.error("Error deleting default category:", error)
      toast({
        title: "خطأ في حذف التصنيف الافتراضي",
        description: "تعذر حذف التصنيف الافتراضي",
        variant: "destructive",
      })
    }
  }

  const startEditingDefaultCategory = (category: Category) => {
    setCurrentCategory(category)
    setNewCategoryLabel(category.label)
    setIsEditing(true)
  }

  if (isLoading) {
    return <div className="py-4 text-center">جاري تحميل التصنيفات الافتراضية...</div>
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label>التصنيفات الافتراضية</Label>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-vintage-border">
              <Settings className="h-4 w-4 ml-1" />
              إدارة التصنيفات الافتراضية
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إدارة التصنيفات الافتراضية</DialogTitle>
              <DialogDescription>أضف، عدل، أو احذف التصنيفات الافتراضية المتاحة لجميع أنواع المحتوى</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="mb-4 space-y-2">
                {defaultCategories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-2 border rounded-md border-vintage-border"
                  >
                    <div className="flex items-center gap-2">
                      <span>{category.label}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEditingDefaultCategory(category)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">تعديل</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteDefaultCategory(category._id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">حذف</span>
                      </Button>
                    </div>
                  </div>
                ))}

                {defaultCategories.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">لا توجد تصنيفات افتراضية</div>
                )}
              </div>

              <div className="border rounded-md border-vintage-border p-4">
                <h4 className="font-medium text-sm mb-2">
                  {isEditing ? "تعديل تصنيف افتراضي" : "إضافة تصنيف افتراضي جديد"}
                </h4>
                <div className="space-y-3">
                  <div className="grid gap-1">
                    <Label htmlFor="default-category-label">الاسم المعروض</Label>
                    <Input
                      id="default-category-label"
                      value={newCategoryLabel}
                      onChange={(e) => setNewCategoryLabel(e.target.value)}
                      placeholder="مثال: تطوير الذات، فهم الذات"
                      className="border-vintage-border"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    {isEditing && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setCurrentCategory(null)
                          setNewCategoryLabel("")
                        }}
                      >
                        إلغاء
                      </Button>
                    )}
                    <Button
                      onClick={isEditing ? handleEditDefaultCategory : handleAddDefaultCategory}
                      className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                    >
                      {isEditing ? <Save className="h-4 w-4 ml-1" /> : <Plus className="h-4 w-4 ml-1" />}
                      {isEditing ? "حفظ التعديلات" : "إضافة تصنيف"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-3">
        {defaultCategories.map((category) => (
          <Button
            key={category._id}
            type="button"
            variant={selectedCategories.includes(category._id) ? "default" : "outline"}
            onClick={() => onCategoryChange(category._id)}
            className={
              selectedCategories.includes(category._id)
                ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                : "border-vintage-border"
            }
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
