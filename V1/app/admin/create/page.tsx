"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Music, Video, Mic, Coffee, Upload, Eye } from "lucide-react"

export default function CreatePostPage() {
  const [postType, setPostType] = useState("مقالات")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState("")
  const [tags, setTags] = useState("")
  const [attributes, setAttributes] = useState<string[]>([])
  const [externalUrl, setExternalUrl] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCoverImage(file)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAttributeChange = (attr: string) => {
    if (attributes.includes(attr)) {
      setAttributes(attributes.filter((a) => a !== attr))
    } else {
      setAttributes([...attributes, attr])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the post data to your API
    console.log({
      type: postType,
      title,
      content,
      coverImage,
      tags: tags.split(",").map((tag) => tag.trim()),
      attributes,
      externalUrl,
    })
    // Reset form or redirect
  }

  const handlePreview = () => {
    // Here you would typically show a preview of the post
    console.log("Preview post")
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">إنشاء محتوى جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="post-type">نوع المحتوى</Label>
                  <Select defaultValue="مقالات" onValueChange={setPostType}>
                    <SelectTrigger className="border-vintage-border">
                      <SelectValue placeholder="اختر نوع المحتوى" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مقالات">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>مقالات</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="حواديت">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>حواديت</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="شعر">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          <span>شعر</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="سينما">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <span>سينما</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="تأملات">
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4" />
                          <span>تأملات</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="بودكاست">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          <span>بودكاست</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
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
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="أدخل محتوى المنشور..."
                        className="min-h-[300px] border-vintage-border"
                        required
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="min-h-[300px] p-4 border rounded-md border-vintage-border bg-white">
                        {content ? (
                          <div className="prose max-w-none">
                            {content.split("\n\n").map((paragraph, index) => (
                              <p key={index} className="mb-4">
                                {paragraph}
                              </p>
                            ))}
                          </div>
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

                <div className="grid gap-3">
                  <Label>التصنيفات</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant={attributes.includes("دراما") ? "default" : "outline"}
                      onClick={() => handleAttributeChange("دراما")}
                      className={
                        attributes.includes("دراما")
                          ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                          : "border-vintage-border"
                      }
                    >
                      دراما
                    </Button>
                    <Button
                      type="button"
                      variant={attributes.includes("كوميدي") ? "default" : "outline"}
                      onClick={() => handleAttributeChange("كوميدي")}
                      className={
                        attributes.includes("كوميدي")
                          ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                          : "border-vintage-border"
                      }
                    >
                      كوميدي
                    </Button>
                    <Button
                      type="button"
                      variant={attributes.includes("تطوير ذات") ? "default" : "outline"}
                      onClick={() => handleAttributeChange("تطوير ذات")}
                      className={
                        attributes.includes("تطوير ذات")
                          ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                          : "border-vintage-border"
                      }
                    >
                      تطوير ذات
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button type="submit" className="bg-vintage-accent hover:bg-vintage-accent/90 text-white">
                    نشر المحتوى
                  </Button>
                  <Button type="button" variant="outline" onClick={handlePreview} className="border-vintage-border">
                    <Eye className="h-4 w-4 mr-2" />
                    معاينة
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
