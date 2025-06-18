"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Loader2, Star, Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ContentTypeSelector } from "./shared/content-type-selector"
import { DefaultCategoriesSection } from "./shared/default-categories-section"
import { uploadToFalStorage } from "@/lib/upload-utils"
import { useRouter } from "next/navigation"

interface ContentType {
  _id: string
  name: string
  label: string
  icon: string
}

interface PostFormProps {
  mode: "create" | "edit"
  initialData?: {
    id?: string
    title?: string
    content?: string
    excerpt?: string
    contentType?: ContentType
    coverImage?: string
    tags?: string[]
    defaultCategories?: string[]
    externalUrl?: string
    featured?: boolean
    published?: boolean
  }
}

export function PostForm({ mode, initialData }: PostFormProps) {
  const { toast } = useToast()
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState(initialData?.title || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [postType, setPostType] = useState(initialData?.contentType?.label || "")
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(initialData?.contentType || null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState(initialData?.coverImage || "")
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImage || "")
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "")
  const [selectedDefaultCategories, setSelectedDefaultCategories] = useState<string[]>(
    initialData?.defaultCategories || [],
  )
  const [externalUrl, setExternalUrl] = useState(initialData?.externalUrl || "")
  const [featured, setFeatured] = useState(initialData?.featured || false)
  const [published, setPublished] = useState(initialData?.published || false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])

  // Fetch content types
  useEffect(() => {
    async function fetchContentTypes() {
      try {
        const response = await fetch("/api/content-types")
        if (response.ok) {
          const data = await response.json()
          setContentTypes(data)
          if (data.length > 0 && !postType) {
            setPostType(data[0].label)
          }
        }
      } catch (error) {
        console.error("Error fetching content types:", error)
        toast({
          title: "خطأ في تحميل البيانات",
          description: "تعذر تحميل أنواع المحتوى",
          variant: "destructive",
        })
      }
    }

    fetchContentTypes()
  }, [postType, toast])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCoverImage(file)
      setCoverImagePreview(URL.createObjectURL(file))

      try {
        const imageUrl = await uploadToFalStorage(file)
        setCoverImageUrl(imageUrl)
        toast({
          title: "تم تحميل الصورة",
          description: "تم تحميل صورة الغلاف بنجاح",
        })
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "خطأ في تحميل الصورة",
          description: "تعذر تحميل صورة الغلاف",
          variant: "destructive",
        })
      }
    }
  }

  const handleDefaultCategoryChange = (categoryId: string) => {
    if (selectedDefaultCategories.includes(categoryId)) {
      setSelectedDefaultCategories(selectedDefaultCategories.filter((id) => id !== categoryId))
    } else {
      setSelectedDefaultCategories([...selectedDefaultCategories, categoryId])
    }
  }

  const handleSubmit = async (e: React.FormEvent, publishContent = false) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "العنوان مطلوب",
        description: "يرجى إدخال عنوان للمحتوى",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "المحتوى مطلوب",
        description: "يرجى إدخال محتوى للمنشور",
        variant: "destructive",
      })
      return
    }

    if (!selectedContentType) {
      toast({
        title: "نوع المحتوى مطلوب",
        description: "يرجى اختيار نوع المحتوى",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare data for API
      const postData = {
        title,
        content,
        excerpt,
        coverImage: coverImageUrl,
        contentType: selectedContentType,
        defaultCategories: selectedDefaultCategories,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        externalUrl,
        published: publishContent,
        featured,
      }

      // Send to API
      const url = mode === "edit" ? `/api/content/${initialData?.id}` : "/api/content"
      const method = mode === "edit" ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        throw new Error(mode === "edit" ? "فشل في تحديث المحتوى" : "فشل في إنشاء المحتوى")
      }

      const result = await response.json()

      toast({
        title: mode === "edit" ? "تم تحديث المحتوى" : publishContent ? "تم نشر المحتوى" : "تم حفظ المسودة",
        description:
          mode === "edit" ? "تم تحديث المحتوى بنجاح" : publishContent ? "تم نشر المحتوى بنجاح" : "تم حفظ المسودة بنجاح",
      })

      // Redirect based on action
      if (mode === "edit") {
        router.push(`/content/${result.slug || initialData?.id}`)
      } else if (publishContent) {
        router.push(`/content/${result.slug}`)
      } else {
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: mode === "edit" ? "خطأ في تحديث المحتوى" : "خطأ في إنشاء المحتوى",
        description:
          mode === "edit" ? "تعذر تحديث المحتوى. يرجى المحاولة مرة أخرى" : "تعذر إنشاء المحتوى. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">{mode === "edit" ? "تعديل المحتوى" : "إنشاء محتوى جديد"}</CardTitle>
        <Button variant="outline" className="border-vintage-border" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="grid gap-6">
            {/* Content Type Selector with Management */}
            <ContentTypeSelector
              value={postType}
              onChange={setPostType}
              contentTypes={contentTypes}
              onContentTypeChange={setSelectedContentType}
              onContentTypesChange={setContentTypes}
            />

            <div className="grid gap-3">
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المحتوى"
                className="border-vintage-border"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="excerpt">مقتطف</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="أدخل مقتطفاً قصيراً للمحتوى..."
                className="min-h-20 border-vintage-border"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="cover-image">صورة الغلاف</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("cover-image")?.click()}
                  className="border-vintage-border"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  اختر صورة
                </Button>
                <Input id="cover-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {coverImagePreview && (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <img
                      src={coverImagePreview || "/placeholder.svg"}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="content">المحتوى</Label>
              <Tabs defaultValue="write">
                <TabsList className="mb-2">
                  <TabsTrigger value="write">كتابة</TabsTrigger>
                  <TabsTrigger value="preview">معاينة</TabsTrigger>
                </TabsList>
                <TabsContent value="write">
                  <RichTextEditor content={content} onChange={setContent} placeholder="أدخل محتوى المنشور..." />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="min-h-[300px] p-4 border rounded-md border-vintage-border bg-white">
                    {content ? (
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                      <div className="text-muted-foreground text-center py-12">المعاينة ستظهر هنا...</div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {(postType === "سينما" || postType === "بودكاست") && (
              <div className="grid gap-3">
                <Label htmlFor="external-url">رابط خارجي (يوتيوب، سبوتيفاي، ساوند كلاود...)</Label>
                <Input
                  id="external-url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="أدخل الرابط الخارجي"
                  className="border-vintage-border"
                />
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="tags">الوسوم (مفصولة بفواصل)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="مثال: أدب، قصص، خيال"
                className="border-vintage-border"
              />
            </div>

            {/* Default Categories Section */}
            <DefaultCategoriesSection
              selectedCategories={selectedDefaultCategories}
              onCategoryChange={handleDefaultCategoryChange}
            />

            <div className="grid gap-3">
              <Label>خيارات النشر</Label>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={featured ? "default" : "outline"}
                  onClick={() => setFeatured(!featured)}
                  className={
                    featured ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white" : "border-vintage-border"
                  }
                >
                  <Star className="h-4 w-4 mr-1" />
                  {featured ? "مميز" : "غير مميز"}
                </Button>
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant={published ? "default" : "outline"}
                    onClick={() => setPublished(!published)}
                    className={
                      published ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white" : "border-vintage-border"
                    }
                  >
                    {published ? "منشور" : "مسودة"}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === "edit" ? "جاري الحفظ..." : "جاري النشر..."}
                  </>
                ) : (
                  <>
                    {mode === "edit" ? <Save className="h-4 w-4 mr-2" /> : null}
                    {mode === "edit" ? "حفظ التغييرات" : "نشر المحتوى"}
                  </>
                )}
              </Button>
              {mode === "create" && (
                <Button type="submit" variant="outline" className="border-vintage-border" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ كمسودة"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
