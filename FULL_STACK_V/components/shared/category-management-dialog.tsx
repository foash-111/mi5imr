"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash, Save, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Category {
  _id: string
  name: string
  label: string
  contentTypeId?: string
  isDefault: boolean
}

interface CategoryManagementDialogProps {
  contentTypeId: string
}

export function CategoryManagementDialog({ contentTypeId }: CategoryManagementDialogProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryLabel, setNewCategoryLabel] = useState("")

  // Fetch categories for the selected content type
  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/categories?contentTypeId=${contentTypeId}`)
        if (response.ok) {
          const data = await response.json()
          // Filter to show only categories specific to this content type (not default ones)
          const specificCategories = data.filter(
            (cat: Category) => cat.contentTypeId === contentTypeId && !cat.isDefault,
          )
          setCategories(specificCategories)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "خطأ في تحميل التصنيفات",
          description: "تعذر تحميل التصنيفات",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [contentTypeId, toast])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryLabel.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم ووصف التصنيف",
        variant: "destructive",
      })
      return
    }

    try {
      const newCategory = {
        name: newCategoryName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, ""),
        label: newCategoryLabel,
        contentTypeId,
        isDefault: false,
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
        setCategories([...categories, createdCategory])
        setNewCategoryName("")
        setNewCategoryLabel("")

        toast({
          title: "تم إضافة التصنيف",
          description: `تم إضافة "${newCategoryLabel}" بنجاح`,
        })
      } else {
        throw new Error("Failed to create category")
      }
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "خطأ في إضافة التصنيف",
        description: "تعذر إضافة التصنيف الجديد",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = async () => {
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
        const updatedCategories = categories.map((category) =>
          category._id === currentCategory._id ? { ...category, label: newCategoryLabel } : category,
        )

        setCategories(updatedCategories)
        setCurrentCategory(null)
        setNewCategoryName("")
        setNewCategoryLabel("")
        setIsEditing(false)

        toast({
          title: "تم تعديل التصنيف",
          description: `تم تحديث "${newCategoryLabel}" بنجاح`,
        })
      } else {
        throw new Error("Failed to update category")
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "خطأ في تعديل التصنيف",
        description: "تعذر تحديث التصنيف",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const updatedCategories = categories.filter((category) => category._id !== categoryId)
        setCategories(updatedCategories)

        toast({
          title: "تم حذف التصنيف",
          description: "تم حذف التصنيف بنجاح",
        })
      } else {
        throw new Error("Failed to delete category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "خطأ في حذف التصنيف",
        description: "تعذر حذف التصنيف",
        variant: "destructive",
      })
    }
  }

  const startEditingCategory = (category: Category) => {
    setCurrentCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryLabel(category.label)
    setIsEditing(true)
  }

  if (isLoading) {
    return <div className="py-4 text-center">جاري تحميل التصنيفات...</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 space-y-2">
        {categories.map((category) => (
          <div
            key={category._id}
            className="flex items-center justify-between p-2 border rounded-md border-vintage-border"
          >
            <div className="flex items-center gap-2">
              <span>{category.label}</span>
              <span className="text-xs text-muted-foreground">({category.name})</span>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => startEditingCategory(category)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">تعديل</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteCategory(category._id)}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">حذف</span>
              </Button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">لا توجد تصنيفات خاصة لهذا النوع من المحتوى</div>
        )}
      </div>

      <div className="border rounded-md border-vintage-border p-4">
        <h4 className="font-medium text-sm mb-2">{isEditing ? "تعديل تصنيف" : "إضافة تصنيف جديد"}</h4>
        <div className="space-y-3">
          {!isEditing && (
            <div className="grid gap-1">
              <Label htmlFor="category-name">المعرف (ID)</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="مثال: drama, comedy"
                className="border-vintage-border"
              />
              <p className="text-xs text-muted-foreground">سيتم تحويله تلقائياً إلى معرف صالح</p>
            </div>
          )}
          <div className="grid gap-1">
            <Label htmlFor="category-label">الاسم المعروض</Label>
            <Input
              id="category-label"
              value={newCategoryLabel}
              onChange={(e) => setNewCategoryLabel(e.target.value)}
              placeholder="مثال: دراما، كوميدي"
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
                  setNewCategoryName("")
                  setNewCategoryLabel("")
                }}
              >
                إلغاء
              </Button>
            )}
            <Button
              onClick={isEditing ? handleEditCategory : handleAddCategory}
              className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
            >
              {isEditing ? <Save className="h-4 w-4 ml-1" /> : <Plus className="h-4 w-4 ml-1" />}
              {isEditing ? "حفظ التعديلات" : "إضافة تصنيف"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
