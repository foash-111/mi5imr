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
import { CategoryManagementDialog } from "./category-management-dialog"
import { ContentTypeManagement } from "./shared/content-type-management"
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
} from "lucide-react"

interface ContentType {
  _id: string
  name: string
  label: string
  icon: string
}

interface ContentTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  contentTypes: ContentType[]
  onContentTypeChange?: (contentType: ContentType | null) => void
  onContentTypesChange?: (contentTypes: ContentType[]) => void
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
}: ContentTypeSelectorProps) {
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null)

  // Helper function to get the icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = ICON_COMPONENTS[iconName as keyof typeof ICON_COMPONENTS] || FileText
    return <IconComponent className="h-4 w-4" />
  }

  useEffect(() => {
    const contentType = contentTypes.find((type) => type.label === value)
    setSelectedContentType(contentType || null)
    onContentTypeChange?.(contentType || null)
  }, [value, contentTypes, onContentTypeChange])

  return (
    <div className="space-y-4">
      {/* Content Type Management */}
      <div className="flex items-center justify-between">
        <Label>إدارة أنواع المحتوى</Label>
        {onContentTypesChange && (
          <ContentTypeManagement contentTypes={contentTypes} onContentTypesChange={onContentTypesChange} />
        )}
      </div>

      {/* Content Type Selection */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="post-type">نوع المحتوى</Label>
          {selectedContentType && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-vintage-border">
                  <Settings className="h-4 w-4 ml-1" />
                  إدارة التصنيفات
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إدارة التصنيفات</DialogTitle>
                  <DialogDescription>
                    أضف، عدل، أو احذف التصنيفات الخاصة بـ "{selectedContentType.label}"
                  </DialogDescription>
                </DialogHeader>
                <CategoryManagementDialog contentTypeId={selectedContentType._id} />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="border-vintage-border">
            <SelectValue placeholder="اختر نوع المحتوى" />
          </SelectTrigger>
          <SelectContent>
            {contentTypes.map((type) => (
              <SelectItem key={type._id} value={type.label}>
                <div className="flex items-center gap-2">
                  {getIconComponent(type.icon)}
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
