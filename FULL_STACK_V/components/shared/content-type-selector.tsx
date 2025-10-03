"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ContentTypeManagement } from "./content-type-management"
import { ContentTypeCategoriesManager } from "./content-type-categories-manager"
import {
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
  Check,
} from "lucide-react"

interface ContentType {
  _id: string
  label: string
  icon: string
}

interface Category {
  _id: string
  label: string
  isDefault: boolean
  contentTypeId?: string
}

interface ContentTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  contentTypes: ContentType[]
  onContentTypeChange?: (contentType: ContentType | null) => void
  onContentTypesChange?: (contentTypes: ContentType[]) => void
  onCategoriesRefresh?: () => void
  allCategories?: Category[]
  defaultCategories?: Category[]
}

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

export function ContentTypeSelector({
  value,
  onChange,
  contentTypes,
  onContentTypeChange,
  onContentTypesChange,
  onCategoriesRefresh,
  allCategories = [],
  defaultCategories = [],
}: ContentTypeSelectorProps) {
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null)

  // Helper function to get the icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = ICON_COMPONENTS[iconName as keyof typeof ICON_COMPONENTS] || FileText
    return <IconComponent className="h-4 w-4" />
  }

  // Get category counts for the selected content type
  const getCategoryCounts = () => {
    if (!selectedContentType) return { contentCategories: 0, totalCategories: 0 }
    
    // Get content-specific categories for the selected content type
    const contentSpecificCategories = allCategories.filter(
      category => category.contentTypeId === selectedContentType._id && !category.isDefault
    )
    
    // Filter out duplicates within the same content type based on label
    const uniqueContentCategories: Category[] = []
    const seenLabels = new Set<string>()
    
    contentSpecificCategories.forEach(category => {
      if (!seenLabels.has(category.label)) {
        seenLabels.add(category.label)
        uniqueContentCategories.push(category)
      }
    })
    
    // Default categories are completely isolated, no filtering
    const allDefaultCategories = defaultCategories
    
    const contentCategories = uniqueContentCategories.length
    const totalCategories = contentCategories + allDefaultCategories.length
    
    return { contentCategories, totalCategories }
  }

  useEffect(() => {
    const contentType = contentTypes.find((type) => type.label === value)
    setSelectedContentType(contentType || null)
    onContentTypeChange?.(contentType || null)
  }, [value, contentTypes, onContentTypeChange])

  const { contentCategories, totalCategories } = getCategoryCounts()

  return (
    <div className="space-y-4" dir="rtl">
      {/* Content Type Management */}
      <div className="flex items-center justify-between text-right">
        <Label className="text-right">إدارة أنواع المحتوى والتصنيفات</Label>
        {onContentTypesChange && (
          <ContentTypeManagement 
            contentTypes={contentTypes} 
            onContentTypesChange={onContentTypesChange}
            allCategories={allCategories}
            defaultCategories={defaultCategories}
          />
        )}
      </div>

      {/* Content Type Selection */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between text-right">
          <Label htmlFor="post-type" className="text-right">نوع المحتوى</Label>
          {selectedContentType && (
            <Dialog key={`category-dialog-${selectedContentType._id}`}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-vintage-border">
                  <Settings className="h-4 w-4 ml-1" />
                  إدارة التصنيفات ({contentCategories} تصنيف خاص)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إدارة تصنيفات {selectedContentType.label}</DialogTitle>
                  <DialogDescription>
                    أضف، عدل، أو احذف التصنيفات الخاصة بـ "{selectedContentType.label}". 
                    
                  </DialogDescription>
                </DialogHeader>
                <ContentTypeCategoriesManager 
                  contentTypeId={selectedContentType._id} 
                  contentTypeLabel={selectedContentType.label}
                  allCategories={allCategories}
                  defaultCategories={defaultCategories}
                  onCategoriesRefresh={onCategoriesRefresh}
                  renderDialog={false}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="border-vintage-border text-right flex-row-reverse">
            <SelectValue placeholder="اختر نوع المحتوى" />
          </SelectTrigger>
          <SelectContent className="text-right">
            {contentTypes.map((type) => {
              // Calculate category count for each content type using the same filtering logic
              const typeContentCategories = allCategories.filter(
                category => category.contentTypeId === type._id && !category.isDefault
              )
              
              // Filter out duplicates within the same content type based on label
              const uniqueTypeContentCategories: Category[] = []
              const seenTypeLabels = new Set<string>()
              
              typeContentCategories.forEach(category => {
                if (!seenTypeLabels.has(category.label)) {
                  seenTypeLabels.add(category.label)
                  uniqueTypeContentCategories.push(category)
                }
              })
              
              
              const isSelected = value === type.label;
              return (
                <SelectItem key={type._id} value={type.label} className="text-right [&>span:first-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      {getIconComponent(type.icon)}
                      <span>{type.label}</span>
                    </div>
                    {isSelected && (
                      <span className="mr-auto text-xs">✓</span>
                    )}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        
        {/* Category Summary */}
        {/* {selectedContentType && (
          <div className="text-sm text-muted-foreground p-2 bg-gray-50 rounded-md border border-vintage-border">
            <div className="flex justify-between items-center">
              <span>إجمالي التصنيفات المتاحة:</span>
              <span className="font-medium">{totalCategories} تصنيف</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>التصنيفات الخاصة:</span>
              <span className="font-medium">{contentCategories} تصنيف</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>التصنيفات الافتراضية:</span>
              <span className="font-medium">{defaultCategories.length} تصنيف</span>
            </div>
          </div>
        )} */}
      </div>
    </div>
  )
}
