"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash, Save, Plus, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
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

interface ContentTypeManagementProps {
  contentTypes: ContentType[]
  onContentTypesChange: (contentTypes: ContentType[]) => void
}

const AVAILABLE_ICONS = [
  { value: "FileText", label: "مستند", icon: FileText },
  { value: "BookOpen", label: "كتاب", icon: BookOpen },
  { value: "Music", label: "موسيقى", icon: Music },
  { value: "Video", label: "فيديو", icon: Video },
  { value: "Coffee", label: "قهوة", icon: Coffee },
  { value: "Mic", label: "ميكروفون", icon: Mic },
  { value: "Newspaper", label: "جريدة", icon: Newspaper },
  { value: "PenTool", label: "قلم", icon: PenTool },
  { value: "Camera", label: "كاميرا", icon: Camera },
  { value: "Headphones", label: "سماعات", icon: Headphones },
  { value: "Film", label: "فيلم", icon: Film },
  { value: "Feather", label: "ريشة", icon: Feather },
]

export function ContentTypeManagement({ contentTypes, onContentTypesChange }: ContentTypeManagementProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentContentType, setCurrentContentType] = useState<ContentType | null>(null)
  const [newTypeName, setNewTypeName] = useState("")
  const [newTypeLabel, setNewTypeLabel] = useState("")
  const [newTypeIcon, setNewTypeIcon] = useState("FileText")

  const getIconComponent = (iconName: string) => {
    const iconData = AVAILABLE_ICONS.find((icon) => icon.value === iconName)
    if (iconData) {
      const IconComponent = iconData.icon
      return <IconComponent className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const handleAddContentType = async () => {
    if (!newTypeName.trim() || !newTypeLabel.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم ووصف نوع المحتوى",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const newContentType = {
        name: newTypeName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, ""),
        label: newTypeLabel,
        icon: newTypeIcon,
      }

      const response = await fetch("/api/content-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContentType),
      })

      if (response.ok) {
        const createdContentType = await response.json()
        onContentTypesChange([...contentTypes, createdContentType])
        setNewTypeName("")
        setNewTypeLabel("")
        setNewTypeIcon("FileText")

        toast({
          title: "تم إضافة نوع المحتوى",
          description: `تم إضافة "${newTypeLabel}" بنجاح`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create content type")
      }
    } catch (error) {
      console.error("Error adding content type:", error)
      toast({
        title: "خطأ في إضافة نوع المحتوى",
        description: error instanceof Error ? error.message : "تعذر إضافة نوع المحتوى الجديد",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditContentType = async () => {
    if (!currentContentType || !newTypeLabel.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال وصف نوع المحتوى",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const updatedContentType = {
        label: newTypeLabel,
        icon: newTypeIcon,
      }

      const response = await fetch(`/api/content-types/${currentContentType._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedContentType),
      })

      if (response.ok) {
        const updatedTypes = contentTypes.map((type) =>
          type._id === currentContentType._id ? { ...type, label: newTypeLabel, icon: newTypeIcon } : type,
        )

        onContentTypesChange(updatedTypes)
        setCurrentContentType(null)
        setNewTypeName("")
        setNewTypeLabel("")
        setNewTypeIcon("FileText")
        setIsEditing(false)

        toast({
          title: "تم تعديل نوع المحتوى",
          description: `تم تحديث "${newTypeLabel}" بنجاح`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update content type")
      }
    } catch (error) {
      console.error("Error updating content type:", error)
      toast({
        title: "خطأ في تعديل نوع المحتوى",
        description: error instanceof Error ? error.message : "تعذر تحديث نوع المحتوى",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContentType = async (contentTypeId: string) => {
    // Check if this is the last content type
    if (contentTypes.length <= 1) {
      toast({
        title: "لا يمكن الحذف",
        description: "يجب أن يبقى نوع محتوى واحد على الأقل",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`/api/content-types/${contentTypeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const updatedTypes = contentTypes.filter((type) => type._id !== contentTypeId)
        onContentTypesChange(updatedTypes)

        toast({
          title: "تم حذف نوع المحتوى",
          description: "تم حذف نوع المحتوى بنجاح",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete content type")
      }
    } catch (error) {
      console.error("Error deleting content type:", error)
      toast({
        title: "خطأ في حذف نوع المحتوى",
        description: error instanceof Error ? error.message : "تعذر حذف نوع المحتوى",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startEditingContentType = (contentType: ContentType) => {
    setCurrentContentType(contentType)
    setNewTypeName(contentType.name)
    setNewTypeLabel(contentType.label)
    setNewTypeIcon(contentType.icon)
    setIsEditing(true)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-vintage-border">
          <Settings className="h-4 w-4 ml-1" />
          إدارة أنواع المحتوى
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إدارة أنواع المحتوى</DialogTitle>
          <DialogDescription>أضف، عدل، أو احذف أنواع المحتوى المتاحة على المنصة</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6 space-y-3">
            <h4 className="font-medium text-sm">أنواع المحتوى الحالية</h4>
            {contentTypes.map((type) => (
              <div
                key={type._id}
                className="flex items-center justify-between p-3 border rounded-md border-vintage-border"
              >
                <div className="flex items-center gap-3">
                  {getIconComponent(type.icon)}
                  <div>
                    <span className="font-medium">{type.label}</span>
                    <p className="text-sm text-muted-foreground">{type.name}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEditingContentType(type)} disabled={isLoading}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">تعديل</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteContentType(type._id)}
                    disabled={isLoading || contentTypes.length <= 1}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">حذف</span>
                  </Button>
                </div>
              </div>
            ))}

            {contentTypes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">لا توجد أنواع محتوى</div>
            )}
          </div>

          <div className="border rounded-md border-vintage-border p-4 bg-vintage-paper/30">
            <h4 className="font-medium text-sm mb-4">{isEditing ? "تعديل نوع محتوى" : "إضافة نوع محتوى جديد"}</h4>
            <div className="space-y-4">
              {!isEditing && (
                <div className="grid gap-2">
                  <Label htmlFor="type-name">المعرف (ID)</Label>
                  <Input
                    id="type-name"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="مثال: articles, stories"
                    className="border-vintage-border"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    سيتم تحويله تلقائياً إلى معرف صالح (أحرف إنجليزية وشرطات فقط)
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="type-label">الاسم المعروض</Label>
                <Input
                  id="type-label"
                  value={newTypeLabel}
                  onChange={(e) => setNewTypeLabel(e.target.value)}
                  placeholder="مثال: مقالات، حواديت"
                  className="border-vintage-border"
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type-icon">الأيقونة</Label>
                <Select value={newTypeIcon} onValueChange={setNewTypeIcon} disabled={isLoading}>
                  <SelectTrigger className="border-vintage-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ICONS.map((icon) => {
                      const IconComponent = icon.icon
                      return (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{icon.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setCurrentContentType(null)
                      setNewTypeName("")
                      setNewTypeLabel("")
                      setNewTypeIcon("FileText")
                    }}
                    disabled={isLoading}
                  >
                    إلغاء
                  </Button>
                )}
                <Button
                  onClick={isEditing ? handleEditContentType : handleAddContentType}
                  className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 ml-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {isEditing ? "جاري الحفظ..." : "جاري الإضافة..."}
                    </>
                  ) : (
                    <>
                      {isEditing ? <Save className="h-4 w-4 ml-1" /> : <Plus className="h-4 w-4 ml-1" />}
                      {isEditing ? "حفظ التعديلات" : "إضافة نوع"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
