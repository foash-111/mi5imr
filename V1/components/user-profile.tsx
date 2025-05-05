"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, FileText, Heart, Bookmark, Settings, Upload, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock user data
const userData = {
  name: "أحمد محمود",
  username: "ahmed_m",
  email: "ahmed@example.com",
  avatar: "/placeholder.svg?height=200&width=200",
  bio: "قارئ نهم ومحب للأدب والشعر. أستمتع بقراءة القصص الخيالية والتأملات الفلسفية.",
  joinDate: "مايو ٢٠٢٣",
}

// Mock saved content
const savedContent = [
  {
    id: 1,
    title: "رحلة إلى عالم الخيال",
    excerpt: "في هذه القصة نتناول رحلة خيالية إلى عوالم لم يسبق لأحد أن زارها من قبل...",
    type: "حواديت",
    icon: BookOpen,
    image: "/placeholder.svg?height=200&width=300",
    date: "٢٠ أبريل ٢٠٢٣",
    slug: "journey-to-imagination",
  },
  {
    id: 2,
    title: "تأملات في الحياة اليومية",
    excerpt: "مجموعة من التأملات والأفكار حول الحياة اليومية والتحديات التي نواجهها...",
    type: "تأملات",
    icon: FileText,
    image: "/placeholder.svg?height=200&width=300",
    date: "١٥ أبريل ٢٠٢٣",
    slug: "daily-reflections",
  },
]

// Mock liked content
const likedContent = [
  {
    id: 3,
    title: "قصيدة الصباح",
    excerpt: "قصيدة تتحدث عن جمال الصباح وبداية يوم جديد مليء بالأمل والتفاؤل...",
    type: "شعر",
    icon: BookOpen,
    image: "/placeholder.svg?height=200&width=300",
    date: "١٠ أبريل ٢٠٢٣",
    slug: "morning-poem",
  },
  {
    id: 4,
    title: "مراجعة فيلم: رحلة الروح",
    excerpt: "مراجعة نقدية لفيلم رحلة الروح الذي يتناول قضايا فلسفية عميقة...",
    type: "سينما",
    icon: FileText,
    image: "/placeholder.svg?height=200&width=300",
    date: "٥ أبريل ٢٠٢٣",
    slug: "soul-journey-review",
  },
]

export function UserProfile() {
  const [name, setName] = useState(userData.name)
  const [bio, setBio] = useState(userData.bio)
  const [email, setEmail] = useState(userData.email)
  const [avatar, setAvatar] = useState(userData.avatar)
  const [isEditing, setIsEditing] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatar(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = () => {
    // Here you would typically send the updated profile to your API
    console.log({ name, bio, email, avatar })
    setIsEditing(false)
  }

  return (
    <div className="space-y-8">
      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-48 bg-gradient-to-r from-vintage-paper-dark/30 to-vintage-accent/20">
            <div className="absolute -bottom-16 right-6 flex items-end">
              <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                <AvatarImage src={avatar || "/placeholder.svg"} alt={userData.name} />
                <AvatarFallback className="bg-vintage-paper-dark text-white text-2xl">
                  {userData.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="pt-20 pb-6 px-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                <p className="text-muted-foreground">@{userData.username}</p>
                <p className="text-sm text-muted-foreground mt-1">عضو منذ {userData.joinDate}</p>
              </div>
              <Button variant="outline" className="border-vintage-border" onClick={() => setIsEditing(!isEditing)}>
                <Settings className="h-4 w-4 ml-2" />
                {isEditing ? "إلغاء التعديل" : "تعديل الملف الشخصي"}
              </Button>
            </div>

            {isEditing ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-vintage-border"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-vintage-border"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">نبذة شخصية</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="border-vintage-border min-h-24"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="avatar">الصورة الشخصية</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("avatar")?.click()}
                      className="border-vintage-border"
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      تغيير الصورة
                    </Button>
                    <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                  >
                    حفظ التغييرات
                  </Button>
                  <Button variant="outline" className="border-vintage-border" onClick={() => setIsEditing(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <p className="leading-relaxed">{userData.bio}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="w-full bg-vintage-paper-dark/10 p-0 h-auto">
          <TabsTrigger
            value="saved"
            className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none"
          >
            <Bookmark className="h-4 w-4 ml-2" />
            المحتوى المحفوظ
          </TabsTrigger>
          <TabsTrigger
            value="liked"
            className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none"
          >
            <Heart className="h-4 w-4 ml-2" />
            الإعجابات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedContent.map((item) => {
              const ItemIcon = item.icon

              return (
                <Link href={`/content/${item.slug}`} key={item.id}>
                  <Card className="h-full border-vintage-border  backdrop-blur-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative h-40">
                        <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div className="p-4 text-white">
                            <div className="flex items-center gap-1 text-xs mb-1">
                              <ItemIcon className="h-3 w-3" />
                              <span>{item.type}</span>
                            </div>
                            <h3 className="font-bold">{item.title}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground mb-2">{item.date}</div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}

            {savedContent.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-vintage-paper-dark/5 rounded-lg">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">لا يوجد محتوى محفوظ</h3>
                <p className="text-muted-foreground">لم تقم بحفظ أي محتوى بعد.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {likedContent.map((item) => {
              const ItemIcon = item.icon

              return (
                <Link href={`/content/${item.slug}`} key={item.id}>
                  <Card className="h-full border-vintage-border  backdrop-blur-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative h-40">
                        <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div className="p-4 text-white">
                            <div className="flex items-center gap-1 text-xs mb-1">
                              <ItemIcon className="h-3 w-3" />
                              <span>{item.type}</span>
                            </div>
                            <h3 className="font-bold">{item.title}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground mb-2">{item.date}</div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}

            {likedContent.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-vintage-paper-dark/5 rounded-lg">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">لا توجد إعجابات</h3>
                <p className="text-muted-foreground">لم تقم بالإعجاب بأي محتوى بعد.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">إعدادات الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-vintage-border rounded-md">
              <div>
                <h3 className="font-medium">تغيير كلمة المرور</h3>
                <p className="text-sm text-muted-foreground">
                  قم بتحديث كلمة المرور الخاصة بك بشكل دوري للحفاظ على أمان حسابك
                </p>
              </div>
              <Button variant="outline" className="border-vintage-border">
                تغيير
              </Button>
            </div>

            <div className="flex justify-between items-center p-4 border border-vintage-border rounded-md">
              <div>
                <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                <p className="text-sm text-muted-foreground">إدارة إشعارات البريد الإلكتروني التي ترغب في تلقيها</p>
              </div>
              <Button variant="outline" className="border-vintage-border">
                إدارة
              </Button>
            </div>

            <div className="flex justify-between items-center p-4 border border-red-200 rounded-md bg-red-50">
              <div>
                <h3 className="font-medium text-red-600">حذف الحساب</h3>
                <p className="text-sm text-red-600/80">سيؤدي هذا إلى حذف حسابك وجميع بياناتك بشكل نهائي</p>
              </div>
              <Button variant="destructive">حذف الحساب</Button>
            </div>

            <Button variant="outline" className="w-full border-vintage-border mt-4">
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
