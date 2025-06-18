"use client"

import type React from "react"
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, FileText, Heart, Bookmark, Settings, Upload, LogOut, Coffee, Video, Mic } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { updateUser, deleteUser, updateAvatar, getUserBookmarks, getUserLikes } from "@/lib/api-client"
import { deactivateUserStatus } from "@/lib/api-client"

// Add these imports at the top of the file
import {
  PlusCircle,
  FileEdit,
  Users,
  BarChart3,
  MessageSquare,
  Eye,
  ThumbsUp,
  PenTool,
  Music,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Content } from "@/backend/models/types"

// const publishedContent = [
//   {
//     id: 1,
//     title: "رحلة إلى عالم الخيال",
//     excerpt: "في هذه القصة نتناول رحلة خيالية إلى عوالم لم يسبق لأحد أن زارها من قبل...",
//     type: "حواديت",
//     icon: BookOpen,
//     image: "/placeholder.svg?height=200&width=300",
//     date: "٢٠ أبريل ٢٠٢٣",
//     slug: "journey-to-imagination",
//     status: "published",
//     views: 245,
//     likes: 42,
//     comments: 7,
//   },
//   {
//     id: 2,
//     title: "تأملات في الحياة اليومية",
//     excerpt: "مجموعة من التأملات والأفكار حول الحياة اليومية والتحديات التي نواجهها...",
//     type: "تأملات",
//     icon: FileText,
//     image: "/placeholder.svg?height=200&width=300",
//     date: "١٥ أبريل ٢٠٢٣",
//     slug: "daily-reflections",
//     status: "published",
//     views: 189,
//     likes: 35,
//     comments: 12,
//   },
//   {
//     id: 3,
//     title: "مسودة قصيدة جديدة",
//     excerpt: "قصيدة قيد الكتابة تتناول موضوع الأمل والتفاؤل في زمن الصعاب...",
//     type: "شعر",
//     icon: Music,
//     image: "/placeholder.svg?height=200&width=300",
//     date: "٥ مايو ٢٠٢٣",
//     slug: "new-poem-draft",
//     status: "draft",
//     views: 0,
//     likes: 0,
//     comments: 0,
//   },
// ]


export function UserProfile() {

	// Helper function to get the icon component
			const getIconComponent = (iconName: string) => {
				switch (iconName) {
					case "FileText":
						return <FileText className="h-4 w-4" />
					case "BookOpen":
						return <BookOpen className="h-4 w-4" />
					case "Music":
						return <Music className="h-4 w-4" />
					case "Video":
						return <Video className="h-4 w-4" />
					case "Coffee":
						return <Coffee className="h-4 w-4" />
					case "Mic":
						return <Mic className="h-4 w-4" />
					case "Drama":
						return <div className="h-4 w-4 flex items-center justify-center">د</div>
					case "Smile":
						return <div className="h-4 w-4 flex items-center justify-center">ك</div>
					case "Brain":
						return <div className="h-4 w-4 flex items-center justify-center">ت</div>
					default:
						return <FileText className="h-4 w-4" />
				}
			}
	const { toast } = useToast()
  const router = useRouter()
	const { data: session, status } = useSession();
  const [userData, setUserData] = useState({
		name: "",
    username: "",
    email: "",
    avatar: "",
    bio: "",
    createdAt: "",
    isAdmin: false,	
  });
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
	const [avatar, setAvatar] = useState(session?.user?.avatar || '');
  const [isEditing, setIsEditing] = useState(false)
  const [likedContent, setLikedContent] = useState<Content[]>([])
  const [savedContent, setSavedContent] = useState<Content[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const [publishedContent, setPublishedContent] = useState<Content[]>([])


	// Fetch user data when session is authenticated

  console.log("status", status)
	useEffect(() => {
  if (status === "unauthenticated") {
    router.push('/auth/login');
  }
}, [status, router]);

	useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Simulate fetching additional user data (e.g., from your database)
      // For now, combine session data with defaults
     const loadedUser = {
        name: session.user.name || "مستخدم غير معروف",
        username: session.user.username || "user",
        email: session.user.email || "لا يوجد بريد إلكتروني",
        avatar: session.user.avatar || "/placeholder.svg",
        bio: session.user.bio || "لا توجد نبذة شخصية",
        createdAt: session.user.createdAt || "لا يوجد تاريخ",
        isAdmin: session.user.isAdmin || false,
      };
			console.log("userloader", loadedUser)

      setUserData(loadedUser);
      setName(loadedUser.name);
      setBio(loadedUser.bio);
      setEmail(loadedUser.email);
      setAvatar(loadedUser.avatar);

			async function fetchContent() {
						setIsLoading(true)
						try {
							const userBookmarks = await getUserBookmarks()
							console.log("userBookmarks", userBookmarks)
							const userLikes = await getUserLikes()
							setLikedContent(userLikes);
							setSavedContent(userBookmarks);
							console.log("savedContent length", userBookmarks,  userBookmarks.length)
							/* setPublishedContent(userPublished); */
						} catch (err) {
							console.error("Error fetching content:", err)
						} finally {
							setIsLoading(false)
						}
					}
			
					fetchContent()

    }
  }, [session, status]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || !e.target.files[0]) return;

		const file = e.target.files[0];
    // Preview the image locally before upload
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
		if (!session?.user?.id) {
    toast({
      title: 'خطأ',
      description: 'يرجى تسجيل الدخول لتحميل الصورة',
      variant: 'destructive',
    });
    URL.revokeObjectURL(previewUrl);
    return;
  }
		try {
      // Validate file (e.g., size, type)
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'خطأ',
          description: 'يرجى تحميل صورة صالحة (JPG, PNG, إلخ)',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'خطأ',
          description: 'حجم الصورة كبير جدًا (الحد الأقصى 5 ميجابايت)',
          variant: 'destructive',
        });
        return;
      }
			// Create FormData to send the file
      const formData = new FormData();
      formData.append('avatar', file);

      // Send the image to the backend
			console.log("profile", formData)
      const response = await updateAvatar(session?.user?.id, formData);

			const data = await response.json();

			if (!data.avatarUrl) {
				throw new Error('Invalid response from server');
			}

      setAvatar(data.avatarUrl);
      toast({
        title: 'تم التحديث',
        description: 'تم تحميل الصورة الشخصية بنجاح',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل تحميل الصورة. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
      // Revert to previous avatar or null on error
      setAvatar(session?.user?.avatar || '');
			}
			finally {
				URL.revokeObjectURL(previewUrl);
			}
		}

  const handleSaveProfile = async () => {
   if (!session) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول لتحديث الملف الشخصي',
        variant: 'destructive',
      });
      return;
    }
    if (!session?.user?.id) {
      toast({
        title: 'خطأ',
        description: 'بيانات المستخدم غير متوفرة',
        variant: 'destructive',
      });
      return;
    }

    const updatedData = { ...userData, name, bio, email, avatar };
    setUserData(updatedData);
		const { createdAt, ...updatedDataWithoutCreatedAt } = { ...userData, name, bio, email, avatar };
		console.log(updatedDataWithoutCreatedAt)
     setUserData({ ...userData, name, bio, email, avatar });
    try {
      await updateUser(session.user.id, updatedDataWithoutCreatedAt);
      toast({
        title: 'تم تحديث الملف الشخصي',
        description: 'تم تحديث الملف الشخصي بنجاح',
        variant: 'default',
      });
      console.log('Profile updated:', { name, bio, email, avatar });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'تعذر تحديث الملف الشخصي',
        variant: 'destructive',
      });
    }
  };
  

	const handleDeleteProfile = async () => {
    if (!session) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول لحذف الملف الشخصي',
        variant: 'destructive',
      });
      return;
    }
    if (!session.user?.id) {
      toast({
        title: 'خطأ',
        description: 'بيانات المستخدم غير متوفرة',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('هل أنت متأكد من حذف ملفك الشخصي؟')) {
      return;
    }

    try {
			console.log('Deleting profile user prfile page:', session.user.id);
      await deleteUser(session.user?.id);
      toast({
        title: 'تم حذف الملف الشخصي',
        description: 'تم حذف الملف الشخصي بنجاح',
        variant: 'default',
      });
			console.log('Profile deleted');
    await signOut({ redirect: false }); // Clear session
    router.push('/auth/login');
    
    } catch (error: any) {
      toast({
        title: 'حدث خطأ',
        //description: error.message || 'تعذر حذف الملف الشخصي',
				description: 'تعذر حذف الملف الشخصي',
        variant: 'destructive',
      });
    }
  };
	
	const handleLogout = async () => {

		try {
    // Set the user's active status to false
    await deactivateUserStatus(false);
    // Sign out the user without automatic redirect
    await signOut({ redirect: false });
    // Redirect to login page
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
    // Optionally show a user-friendly error message
    alert('Failed to log out. Please try again.');
  }
	};



  return (
    <div className="space-y-8">
      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-48 bg-gradient-to-r from-vintage-paper-dark/30 to-vintage-accent/20">
            <div className="absolute -bottom-16 right-6 flex items-end">
              <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
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
                <p className="text-sm text-muted-foreground mt-1">عضو منذ {userData.createdAt}</p>
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
            className="flex-1 py-3 data-[state=active]:  data-[state=active]:shadow-sm rounded-none"
          >
            <Bookmark className="h-4 w-4 ml-2" />
            المحتوى المحفوظ
          </TabsTrigger>
          <TabsTrigger
            value="liked"
            className="flex-1 py-3 data-[state=active]:  data-[state=active]:shadow-sm rounded-none"
          >
            <Heart className="h-4 w-4 ml-2" />
            الإعجابات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedContent.map((item) => {
              const ItemIcon = item.contentType.icon

              return (
                <Link href={`/content/${item.slug}`} key={item._id?.toString()}>
                  <Card className="h-full border-vintage-border  backdrop-blur-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative h-40">
                        <Image src={item.coverImage || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div className="p-4 text-white">
                            <div className="flex items-center gap-1 text-xs mb-1">
                              {getIconComponent(ItemIcon)}
                              <span>{item.contentType.name}</span>
                            </div>
                            <h3 className="font-bold">{item.title}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground mb-2">{item.createdAt.toLocaleString("ar-EG")}</div>
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
              const ItemIcon = item.contentType.icon

              return (
                <Link href={`/content/${item.slug}`} key={item._id?.toString()}>
                  <Card className="h-full border-vintage-border  backdrop-blur-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative h-40">
                        <Image src={item.coverImage || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div className="p-4 text-white">
                            <div className="flex items-center gap-1 text-xs mb-1">
                              {getIconComponent(ItemIcon)}
                              <span>{item.contentType.name}</span>
                            </div>
                            <h3 className="font-bold">{item.title}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground mb-2">{item.createdAt.toLocaleString("ar-EG")}</div>
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

      {userData.isAdmin === true && (
        <>
          <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <PenTool className="h-5 w-5 text-vintage-accent" />
                لوحة تحكم الكاتب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col gap-2">
                  <Link href="/admin/create">
                    <Button className="w-full bg-vintage-accent hover:bg-vintage-accent/90 text-white justify-start">
                      <PlusCircle className="h-4 w-4 ml-2" />
                      إنشاء محتوى جديد
                    </Button>
                  </Link>

									{/* <Link href="/admin/dashboard">
                  <Button variant="outline" className="w-full border-vintage-border justify-start">
                    <FileEdit className="h-4 w-4 ml-2" />
                    إدارة المحتوى
                  </Button>
									</Link> */}

                  {/* <Button variant="outline" className="w-full border-vintage-border justify-start">
                    <MessageSquare className="h-4 w-4 ml-2" />
                    إدارة التعليقات
                  </Button> */}
                </div>
                {/* <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full border-vintage-border justify-start">
                    <Users className="h-4 w-4 ml-2" />
                    إدارة المستخدمين
                  </Button>
                  <Button variant="outline" className="w-full border-vintage-border justify-start">
                    <BarChart3 className="h-4 w-4 ml-2" />
                    الإحصائيات
                  </Button>
                  <Button variant="outline" className="w-full border-vintage-border justify-start">
                    <Settings className="h-4 w-4 ml-2" />
                    إعدادات المنصة
                  </Button>
                </div> */}
              </div>

              {/* <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">نظرة عامة على المحتوى</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-vintage-paper-dark/5 p-3 rounded-md">
                      <div className="text-2xl font-bold text-vintage-accent">
                        {publishedContent.filter((item) => item.status === "published").length}
                      </div>
                      <div className="text-xs text-muted-foreground">منشور</div>
                    </div>
                    <div className="bg-vintage-paper-dark/5 p-3 rounded-md">
                      <div className="text-2xl font-bold text-amber-500">
                        {publishedContent.filter((item) => item.status === "draft").length}
                      </div>
                      <div className="text-xs text-muted-foreground">مسودة</div>
                    </div>
                    <div className="bg-vintage-paper-dark/5 p-3 rounded-md">
                      <div className="text-2xl font-bold">
                        {publishedContent.reduce((total, item) => total + item.comments, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">تعليق</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">إحصائيات التفاعل</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        المشاهدات
                      </span>
                      <span className="font-medium">
                        {publishedContent.reduce((total, item) => total + item.views, 0)}
                      </span>
                    </div>
                    <Progress value={75} className="h-2 bg-vintage-paper-dark/10" />

                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        الإعجابات
                      </span>
                      <span className="font-medium">
                        {publishedContent.reduce((total, item) => total + item.likes, 0)}
                      </span>
                    </div>
                    <Progress value={60} className="h-2 bg-vintage-paper-dark/10" />
                  </div>
                </div>
              </div> */}
            </CardContent>
          </Card>

          <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-vintage-accent" />
                المحتوى المنشور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishedContent.length > 0 ? (
                  publishedContent.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <div key={item.id} className="flex gap-4 p-3 border border-vintage-border rounded-md  ">
                        <div className="relative h-16 w-24 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ItemIcon className="h-3 w-3 text-vintage-accent" />
                            <span className="text-xs text-muted-foreground">{item.type}</span>
                            {item.status === "published" ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                منشور
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                مسودة
                              </Badge>
                            )}
                          </div>
                          <Link href={`/content/${item.slug}`}>
                            <h3 className="font-bold truncate hover:text-vintage-accent transition-colors">
                              {item.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{item.date}</span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {item.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {item.likes}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {item.comments}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" className="border-vintage-border h-8 px-2">
                            <FileEdit className="h-3 w-3" />
                            <span className="sr-only">تعديل</span>
                          </Button>
                          <Button variant="outline" size="sm" className="border-vintage-border h-8 px-2">
                            <AlertCircle className="h-3 w-3" />
                            <span className="sr-only">حذف</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 bg-vintage-paper-dark/5 rounded-md">
                    <p className="text-muted-foreground">لم تقم بنشر أي محتوى بعد.</p>
                    <Link href="/admin/create">
                      <Button className="mt-2 bg-vintage-accent hover:bg-vintage-accent/90 text-white">
                        <PlusCircle className="h-4 w-4 ml-2" />
                        إنشاء محتوى جديد
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">إعدادات الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/*<div className="flex justify-between items-center p-4 border border-vintage-border rounded-md">
              <div>
                <h3 className="font-medium">تغيير كلمة المرور</h3>
                <p className="text-sm text-muted-foreground">
                  قم بتحديث كلمة المرور الخاصة بك بشكل دوري للحفاظ على أمان حسابك
                </p>
              </div>
              <Button variant="outline" className="border-vintage-border">
                تغيير
              </Button>
            </div>*/}

            <div className="flex justify-between items-center p-4 border border-vintage-border rounded-md">
              <div>
                <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                <p className="text-sm text-muted-foreground">إدارة إشعارات البريد الإلكتروني التي ترغب في تلقيها</p>
              </div>
              <Button variant="outline" className="border-vintage-border">
                إدارة
              </Button>
            </div>

						{userData.isAdmin === false &&(
            <div className="flex justify-between items-center p-4 border border-red-200 rounded-md bg-red-50">
              <div>
                <h3 className="font-medium text-red-600">حذف الحساب</h3>
                <p className="text-sm text-red-600/80">سيؤدي هذا إلى حذف حسابك وجميع بياناتك بشكل نهائي</p>
              </div>
              <Button onClick={handleDeleteProfile} variant="destructive">حذف الحساب</Button>
            </div>
						 )}

            <Button onClick={handleLogout} variant="outline" className="w-full border-vintage-border mt-4">
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
