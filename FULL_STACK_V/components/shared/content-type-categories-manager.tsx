"use client"

import { useState, useEffect, useCallback } from "react"
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
  label: string
  isDefault: boolean
  contentTypeId?: string
}

interface ContentTypeCategoriesManagerProps {
  contentTypeId?: string
  contentTypeLabel?: string
  allCategories?: Category[]
  defaultCategories?: Category[]
  onCategoriesRefresh?: () => void
  renderDialog?: boolean
}

// Move CategoryContent outside to prevent hook order issues
const CategoryContent = ({ 
  allCategories, 
  categories, 
  isEditing, 
  newCategoryName, 
  newCategoryLabel, 
  getFilteredCategoriesForContentType, 
  startEditingCategory, 
  handleDeleteCategory, 
  handleEditCategory, 
  handleAddCategory,
  setNewCategoryName,
  setNewCategoryLabel,
  setIsEditing,
  setCurrentCategory
}: {
  allCategories: Category[]
  categories: Category[]
  isEditing: boolean
  newCategoryName: string
  newCategoryLabel: string
  getFilteredCategoriesForContentType: () => { contentCategories: Category[], defaultCategories: Category[] }
  startEditingCategory: (category: Category) => void
  handleDeleteCategory: (categoryId: string) => void
  handleEditCategory: () => void
  handleAddCategory: () => void
  setNewCategoryName: (name: string) => void
  setNewCategoryLabel: (label: string) => void
  setIsEditing: (editing: boolean) => void
  setCurrentCategory: (category: Category | null) => void
}) => (
  <div className="py-4">
    <div className="mb-4 space-y-2">
      {(() => {
        if (allCategories.length > 0) {
          const filtered = getFilteredCategoriesForContentType()
          
          if (filtered.contentCategories.length > 0) {
            return (
              <>
                <div className="mb-3">
                  <h5 className="text-sm font-medium mb-2 text-gray-700">التصنيفات الخاصة</h5>
                  {filtered.contentCategories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between p-2 border rounded-md border-vintage-border mb-2"
                    >
                    <div className="flex items-center gap-2">
                      <span>{category.label}</span>
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
                </div>
                
              </>
            )
          } else {
            return (
              <div className="text-center py-4 text-muted-foreground">
                لا توجد تصنيفات خاصة لهذا النوع من المحتوى
              </div>
            )
          }
        } else {
          // Fallback to original logic
          if (categories.length > 0) {
            return categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-2 border rounded-md border-vintage-border"
              >
                <div className="flex items-center gap-2">
                  <span>{category.label}</span>
                
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
            ))
          } else {
            return (
              <div className="text-center py-4 text-muted-foreground">
                لا توجد تصنيفات لهذا النوع من المحتوى
              </div>
            )
          }
        }
      })()}
    </div>

    <div className="border rounded-md border-vintage-border p-4">
      <h4 className="font-medium text-sm mb-2">
        {isEditing ? "تعديل تصنيف المحتوى" : "إضافة تصنيف محتوى جديد"}
      </h4>
      <div className="space-y-3">
        <div className="grid gap-1">
          <Label htmlFor="content-category-label">الاسم المعروض</Label>
          <Input
            id="content-category-label"
            key={`label-input-${isEditing}`}
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

export function ContentTypeCategoriesManager({ 
  contentTypeId, 
  contentTypeLabel,
  allCategories = [],
  defaultCategories = [],
  onCategoriesRefresh,
  renderDialog = true
}: ContentTypeCategoriesManagerProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryLabel, setNewCategoryLabel] = useState("")

  const getFilteredCategoriesForContentType = useCallback(() => {
    if (!contentTypeId || allCategories.length === 0) {
      return { contentCategories: [], defaultCategories: [] }
    }

    // Filter content-specific categories for this content type
    const contentCategories = allCategories.filter(
      (category) => category.contentTypeId === contentTypeId && !category.isDefault
    )

    // Default categories are completely isolated, no filtering
    const filteredDefaultCategories = defaultCategories

    return {
      contentCategories,
      defaultCategories: filteredDefaultCategories,
    }
  }, [contentTypeId, allCategories, defaultCategories])

  // Fetch categories for the content type (fallback for backward compatibility)
  useEffect(() => {
    async function fetchCategories() {
      if (!contentTypeId) {
        setCategories([])
        setIsLoading(false)
        return
      }

      // If we have allCategories, use the filtered approach
      if (allCategories.length > 0) {
        const filtered = getFilteredCategoriesForContentType()
        setCategories([...filtered.contentCategories, ...filtered.defaultCategories])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/categories?contentTypeId=${contentTypeId}`)
        if (response.ok) {
          const data = await response.json()
          // Filter out default categories, only show content-type specific ones
          const contentTypeCategories = data.filter((cat: Category) => !cat.isDefault)
          setCategories(contentTypeCategories)
        }
      } catch (error) {
        console.error("Error fetching content type categories:", error)
        toast({
          title: "خطأ في تحميل تصنيفات المحتوى",
          description: "تعذر تحميل تصنيفات هذا النوع من المحتوى",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [contentTypeId, toast, allCategories, defaultCategories])

  const handleAddCategory = useCallback(async () => {
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
        contentTypeId: contentTypeId,
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
        
        // Update local state with new filtering logic
        if (allCategories.length > 0) {
          const filtered = getFilteredCategoriesForContentType()
          setCategories([...filtered.contentCategories, ...filtered.defaultCategories])
        } else {
          setCategories([...categories, createdCategory])
        }
        
        setNewCategoryLabel("")

        // Trigger refresh in parent component
        onCategoriesRefresh?.()

        toast({
          title: "تم إضافة تصنيف المحتوى",
          description: `تم إضافة "${newCategoryLabel}" بنجاح`,
        })
      } else {
        throw new Error("Failed to create content type category")
      }
    } catch (error) {
      console.error("Error adding content type category:", error)
      toast({
        title: "خطأ في إضافة تصنيف المحتوى",
        description: "تعذر إضافة التصنيف الجديد",
        variant: "destructive",
      })
    }
  }, [newCategoryName, newCategoryLabel, contentTypeId, allCategories, categories, getFilteredCategoriesForContentType, onCategoriesRefresh, toast])

  const handleEditCategory = useCallback(async () => {
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
        // Update local state with new filtering logic
        if (allCategories.length > 0) {
          const filtered = getFilteredCategoriesForContentType()
          setCategories([...filtered.contentCategories, ...filtered.defaultCategories])
        } else {
          const updatedCategories = categories.map((category) =>
            category._id === currentCategory._id ? { ...category, label: newCategoryLabel } : category,
          )
          setCategories(updatedCategories)
        }
        
        setCurrentCategory(null)
        setNewCategoryName("")
        setNewCategoryLabel("")
        setIsEditing(false)

        // Trigger refresh in parent component
        onCategoriesRefresh?.()

        toast({
          title: "تم تعديل تصنيف المحتوى",
          description: `تم تحديث "${newCategoryLabel}" بنجاح`,
        })
      } else {
        throw new Error("Failed to update content type category")
      }
    } catch (error) {
      console.error("Error updating content type category:", error)
      toast({
        title: "خطأ في تعديل تصنيف المحتوى",
        description: "تعذر تحديث التصنيف",
        variant: "destructive",
      })
    }
  }, [currentCategory, newCategoryLabel, allCategories, categories, getFilteredCategoriesForContentType, onCategoriesRefresh, toast])

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Update local state with new filtering logic
        if (allCategories.length > 0) {
          const filtered = getFilteredCategoriesForContentType()
          setCategories([...filtered.contentCategories, ...filtered.defaultCategories])
        } else {
          const updatedCategories = categories.filter((category) => category._id !== categoryId)
          setCategories(updatedCategories)
        }

        // Trigger refresh in parent component
        onCategoriesRefresh?.()

        toast({
          title: "تم حذف تصنيف المحتوى",
          description: "تم حذف التصنيف بنجاح",
        })
      } else {
        throw new Error("Failed to delete content type category")
      }
    } catch (error) {
      console.error("Error deleting content type category:", error)
      toast({
        title: "خطأ في حذف تصنيف المحتوى",
        description: "تعذر حذف التصنيف",
        variant: "destructive",
      })
    }
  }, [allCategories, categories, getFilteredCategoriesForContentType, onCategoriesRefresh, toast])

  const startEditingCategory = useCallback((category: Category) => {
    setCurrentCategory(category)
    setNewCategoryLabel(category.label)
    setIsEditing(true)
  }, [])

  if (!contentTypeId) {
    return null
  }

  if (isLoading) {
    return <div className="py-4 text-center">جاري تحميل تصنيفات المحتوى...</div>
  }

  // If renderDialog is false, return just the content (for use inside another dialog)
  if (!renderDialog) {
    return <CategoryContent allCategories={allCategories} categories={categories} isEditing={isEditing} newCategoryName={newCategoryName} newCategoryLabel={newCategoryLabel} getFilteredCategoriesForContentType={getFilteredCategoriesForContentType} startEditingCategory={startEditingCategory} handleDeleteCategory={handleDeleteCategory} handleEditCategory={handleEditCategory} handleAddCategory={handleAddCategory} setNewCategoryName={setNewCategoryName} setNewCategoryLabel={setNewCategoryLabel} setIsEditing={setIsEditing} setCurrentCategory={setCurrentCategory} />
  }

  // Otherwise, render the full component with its own dialog
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label>تصنيفات {contentTypeLabel}</Label>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-vintage-border">
              <Settings className="h-4 w-4 ml-1" />
              إدارة تصنيفات المحتوى
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إدارة تصنيفات {contentTypeLabel}</DialogTitle>
              <DialogDescription>أضف، عدل، أو احذف التصنيفات المتاحة لهذا النوع من المحتوى</DialogDescription>
            </DialogHeader>
            <CategoryContent allCategories={allCategories} categories={categories} isEditing={isEditing} newCategoryName={newCategoryName} newCategoryLabel={newCategoryLabel} getFilteredCategoriesForContentType={getFilteredCategoriesForContentType} startEditingCategory={startEditingCategory} handleDeleteCategory={handleDeleteCategory} handleEditCategory={handleEditCategory} handleAddCategory={handleAddCategory} setNewCategoryName={setNewCategoryName} setNewCategoryLabel={setNewCategoryLabel} setIsEditing={setIsEditing} setCurrentCategory={setCurrentCategory} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 