"use client"

import type React from "react"
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, FileText, Heart, Bookmark, Settings, Upload, LogOut, Coffee, Video, Mic, Pencil, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { updateUser, deleteUser, updateAvatar, getUserBookmarks, getUserLikes, getContent, getUserById, updateEmailNotifications } from "@/lib/api-client"
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
  Bell,
  Mail,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Content as OriginalContent } from "@/backend/models/types"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Extend Content type to include 'views', 'likes', and 'comments' if not already present
type Content = OriginalContent & {
  views?: number
  likes?: number
  comments?: number
  status?: string // Add status property to fix the error
  image?: string // Add image property to fix the error
  icon?: React.ElementType // Add icon property to fix the error
}

// Helper function to format date to dd-mm-yyyy
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

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

// Social links keys for the global settings
const SOCIAL_KEYS = ["twitter", "facebook", "youtube", "instagram", "reddit"];


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
    emailNotifications: {
      newsletter: true,
    }
  });
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
	const [avatar, setAvatar] = useState(session?.user?.avatar || '');
  const [isEditing, setIsEditing] = useState(false)
  const [likedContent, setLikedContent] = useState<Content[]>([])
  const [savedContent, setSavedContent] = useState<Content[]>([])
	const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState({
    newsletter: true,
  })

	const [publishedContent, setPublishedContent] = useState<Content[]>([])
	const [draftContent, setDraftContent] = useState<Content[]>([])

	const [savedOpen, setSavedOpen] = useState(false)
	const [likedOpen, setLikedOpen] = useState(false)
	const [draftsOpen, setDraftsOpen] = useState(false)

	// Fetch user data when session is authenticated

  console.log("status", status)
	useEffect(() => {
  if (status === "unauthenticated") {
    router.push('/auth/login');
  }
}, [status, router]);

	useEffect(() => {
    async function fetchAndSetUser() {
      if (status === "authenticated" && session?.user) {
        try {
          // Always fetch the latest user data from backend
          if (session.user.id) {
            const latestUser = await getUserById(String(session.user.id));
            setUserData(latestUser);
            setName(latestUser.name || "");
            setBio(latestUser.bio || "");
            setEmail(latestUser.email || "");
            setAvatar(latestUser.avatar || "");
            setEmailNotifications(latestUser.emailNotifications || {
              newsletter: true,
            });
            
            // Check real newsletter subscription status
            if (latestUser.email) {
              const isSubscribed = await checkNewsletterStatus(latestUser.email);
              setEmailNotifications(prev => ({ ...prev, newsletter: isSubscribed }));
            }
            // Fetch content as before
            async function fetchContent() {
              setIsLoading(true)
              try {
                const userBookmarks = await getUserBookmarks()
                setLikedContent(await getUserLikes());
                setSavedContent(userBookmarks);
                // Fetch draft content for admins
                if (latestUser.isAdmin) {
                  const { content: drafts } = await getContent({ published: false, limit: 20 });
                  setDraftContent(drafts);
                }
              } catch (err) {
                console.error("Error fetching content:", err)
              } finally {
                setIsLoading(false)
              }
            }
            fetchContent();
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    }
    fetchAndSetUser();
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

    setIsUpdatingProfile(true);
    
    // Show loading toast
    toast({
      title: 'جاري التعديل',
      description: 'يرجى الانتظار...',
      variant: 'default',
    });

    const { createdAt, ...updatedDataWithoutCreatedAt } = { ...userData, name, bio, email, avatar };
    
    try {
      await updateUser(session.user.id, updatedDataWithoutCreatedAt);
      
      // Fetch latest user data from backend
      if (session.user.id) {
        const latestUser = await getUserById(String(session.user.id));
        setUserData(latestUser);
        setBio(latestUser.bio || "");
        setName(latestUser.name || "");
        setEmail(latestUser.email || "");
        setAvatar(latestUser.avatar || "");
        setEmailNotifications(latestUser.emailNotifications || {
          newsletter: true,
        });
        
        // Check real newsletter subscription status
        if (latestUser.email) {
          const isSubscribed = await checkNewsletterStatus(latestUser.email);
          setEmailNotifications(prev => ({ ...prev, newsletter: isSubscribed }));
        }
      }
      
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تحديث الملف الشخصي بنجاح',
        variant: 'default',
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'تعذر تحديث الملف الشخصي',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
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
			// Try to deactivate user status, but don't let it block logout
			try {
				await deactivateUserStatus(false);
			} catch (statusError) {
				console.warn('Failed to deactivate user status:', statusError);
				// Continue with logout even if status update fails
			}
			
			// Sign out the user without automatic redirect
			await signOut({ redirect: false });
			
			// Redirect to login page
			router.push('/auth/login');
		} catch (error) {
			console.error('Logout failed:', error);
			// Even if there's an error, try to force logout
			try {
				await signOut({ redirect: false });
				router.push('/auth/login');
			} catch (fallbackError) {
				console.error('Fallback logout also failed:', fallbackError);
				// Last resort: reload the page
				window.location.href = '/auth/login';
			}
		}
	};

  const handleSaveEmailNotifications = async () => {
    if (!session?.user?.id) {
      toast({
        title: 'خطأ',
        description: 'بيانات المستخدم غير متوفرة',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateEmailNotifications(session.user.id, emailNotifications);
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ تفضيلات الإشعارات بنجاح',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'تعذر حفظ تفضيلات الإشعارات',
        variant: 'destructive',
      });
    }
  };

  // Check newsletter subscription status
  const checkNewsletterStatus = async (email: string) => {
    try {
      const response = await fetch("/api/newsletter/subscribe/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data.subscribed || false;
    } catch (error) {
      console.error("Error checking newsletter status:", error);
      return false;
    }
  };

  // Handle newsletter toggle
  const handleNewsletterToggle = async () => {
    if (!session?.user?.email) {
      toast({
        title: 'خطأ',
        description: 'بيانات المستخدم غير متوفرة',
        variant: 'destructive',
      });
      return;
    }

    const newStatus = !emailNotifications.newsletter;
    setEmailNotifications(prev => ({ ...prev, newsletter: newStatus }));

    try {
      if (newStatus) {
        // Subscribe to newsletter
        const response = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });

        if (response.ok) {
          toast({
            title: 'تم الاشتراك',
            description: 'تم الاشتراك في النشرة الإخبارية بنجاح',
            variant: 'default',
          });
        } else {
          const data = await response.json();
          if (data.error === "Email already subscribed") {
            toast({
              title: 'مشترك بالفعل',
              description: 'أنت مشترك بالفعل في النشرة الإخبارية',
              variant: 'default',
            });
          } else {
            throw new Error(data.error || 'فشل في الاشتراك');
          }
        }
      } else {
        // Unsubscribe from newsletter
        const response = await fetch("/api/newsletter/unsubscribe/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          toast({
            title: 'تم إلغاء الاشتراك',
            description: 'تم إلغاء الاشتراك في النشرة الإخبارية',
            variant: 'default',
          });
        } else {
          const data = await response.json();
          if (data.error === "Not subscribed to newsletter") {
            toast({
              title: 'غير مشترك',
              description: 'أنت غير مشترك في النشرة الإخبارية',
              variant: 'default',
            });
          } else {
            throw new Error(data.error || 'فشل في إلغاء الاشتراك');
          }
        }
      }

      // Update user preferences in database
      if (session.user.id) {
        await updateEmailNotifications(session.user.id, { newsletter: newStatus });
      }
    } catch (error: any) {
      // Revert the state on error
      setEmailNotifications(prev => ({ ...prev, newsletter: !newStatus }));
      toast({
        title: 'حدث خطأ',
        description: error.message || 'تعذر تحديث حالة الاشتراك',
        variant: 'destructive',
      });
    }
  };

  // Global settings state for admin
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalEdit, setGlobalEdit] = useState(false);
  const [globalSocialLinks, setGlobalSocialLinks] = useState<any>({});
  const [globalAbout, setGlobalAbout] = useState<any>({ bio: "", image: "" });

  // Fetch global settings for admin
  useEffect(() => {
    if (session?.user?.isAdmin) {
      setGlobalLoading(true);
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => {
          setGlobalSettings(data);
          setGlobalSocialLinks(data.socialLinks || {});
          setGlobalAbout(data.about || { bio: "", image: "" });
        })
        .finally(() => setGlobalLoading(false));
    }
  }, [session?.user?.isAdmin]);

  // Save global settings (admin only)
  async function handleSaveGlobalSettings() {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialLinks: globalSocialLinks,
          about: globalAbout,
        }),
      });
      if (res.ok) {
        toast({ title: "تم حفظ إعدادات الموقع بنجاح" });
        setGlobalEdit(false);
      } else {
        toast({ title: "فشل في حفظ الإعدادات", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "خطأ في الحفظ", description: String(e), variant: "destructive" });
    }
  }

  const [globalDialogOpen, setGlobalDialogOpen] = useState(false);

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
                <p className="text-sm text-muted-foreground mt-1">عضو منذ {formatDate(userData.createdAt)}</p>
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
                    disabled={isUpdatingProfile}
                    className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                  >
                    {isUpdatingProfile ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-vintage-border" 
                    onClick={() => setIsEditing(false)}
                    disabled={isUpdatingProfile}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <p className="leading-relaxed text-muted-foreground">
                  {userData.bio || "لا توجد سيرة ذاتية"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center md:justify-start mt-4">
        <Button variant="outline" className="border-vintage-border" onClick={() => setSavedOpen(true)}>
          <Bookmark className="h-4 w-4 ml-2" />
          المحتوى المحفوظ
        </Button>
        <Button variant="outline" className="border-vintage-border" onClick={() => setLikedOpen(true)}>
          <Heart className="h-4 w-4 ml-2" />
          الإعجابات
        </Button>
        {userData.isAdmin && (
          <Button variant="outline" className="border-vintage-border" onClick={() => setDraftsOpen(true)}>
            <FileText className="h-4 w-4 ml-2" />
            المسودات
          </Button>
        )}
      </div>

      {/* Saved Content Modal */}
      <Dialog open={savedOpen} onOpenChange={setSavedOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>
              <Bookmark className="h-5 w-5 ml-2 inline-block" /> المحتوى المحفوظ
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[420px] md:max-h-[520px] overflow-y-auto rounded-lg border border-vintage-border bg-vintage-paper-dark/5 mt-4">
            <div className="grid grid-cols-2 grid-rows-1 md:grid-rows-2 gap-6 p-4">
              {savedContent.map((item) => {
                const ItemIcon = item.contentType?.icon || "FileText"
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
                                <span>{item.contentType?.name || "غير محدد"}</span>
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Liked Content Modal */}
      <Dialog open={likedOpen} onOpenChange={setLikedOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>
              <Heart className="h-5 w-5 ml-2 inline-block" /> الإعجابات
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[420px] md:max-h-[520px] overflow-y-auto rounded-lg border border-vintage-border bg-vintage-paper-dark/5 mt-4">
            <div className="grid grid-cols-2 grid-rows-1 md:grid-rows-2 gap-6 p-4">
              {likedContent.map((item) => {
                const ItemIcon = item.contentType?.icon || "FileText"
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
                                <span>{item.contentType?.name || "غير محدد"}</span>
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Drafts Content Modal (Admins only) */}
      {userData.isAdmin && (
        <Dialog open={draftsOpen} onOpenChange={setDraftsOpen}>
          <DialogContent className="max-w-2xl w-full">
            <DialogHeader>
              <DialogTitle>
                <FileText className="h-5 w-5 ml-2 inline-block" /> المسودات
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[420px] md:max-h-[520px] overflow-y-auto rounded-lg border border-vintage-border bg-vintage-paper-dark/5 mt-4">
              <div className="grid grid-cols-2 grid-rows-1 md:grid-rows-2 gap-6 p-4">
                {draftContent.map((item) => {
                  const ItemIcon = getIconComponent(item.contentType?.icon || "FileText")
                  return (
                    <Link href={`/content/${item.slug}`} key={item._id?.toString() || item.slug}>
                      <Card className="h-full border-vintage-border  backdrop-blur-sm overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="relative h-40">
                            <Image src={item.coverImage || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                              <div className="p-4 text-white">
                                <div className="flex items-center gap-1 text-xs mb-1">
                                  {ItemIcon}
                                  <span>{item.contentType?.name || "غير محدد"}</span>
                                </div>
                                <h3 className="font-bold">{item.title}</h3>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="text-xs text-muted-foreground mb-2">{item.createdAt ? new Date(item.createdAt).toLocaleString("ar-EG") : ""}</div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
                {draftContent.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-vintage-paper-dark/5 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-1">لا توجد مسودات</h3>
                    <p className="text-muted-foreground">لم تقم بإنشاء أي مسودة بعد.</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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

									 <Link href="/admin/dashboard">
                  <Button variant="outline" className="w-full border-vintage-border justify-start">
                    <FileEdit className="h-4 w-4 ml-2" />
                    إدارة المحتوى
                  </Button>
									</Link> 

                  <Button variant="outline" className="w-full border-vintage-border justify-start" onClick={() => setGlobalDialogOpen(true)}>
                  <Settings className="h-4 w-4 ml-2" />
                      إعدادات الموقع العامة
                  </Button>
                </div>
                
              </div>

            </CardContent>
          </Card>

          {/* Remove the inline drafts card for admins */}
        </>
      )}

      {/* Admin-only: Global Social Links & About Editor in Dialog */}
      {session?.user?.isAdmin && (
        <>
          {/* <Button className="mt-8 mb-4 bg-vintage-accent text-white" onClick={() => setGlobalDialogOpen(true)}>
            إعدادات الموقع العامة
          </Button> */}
          <Dialog open={globalDialogOpen} onOpenChange={setGlobalDialogOpen}>
            <DialogContent className="max-w-2xl w-full">
              <DialogHeader>
                <DialogTitle>إعدادات الموقع العامة (روابط التواصل والمعلومات)</DialogTitle>
              </DialogHeader>
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  {globalLoading ? (
                    <div className="text-center py-4">جاري التحميل...</div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">روابط التواصل الاجتماعي</h3>
                        {SOCIAL_KEYS.map(key => (
                          <div key={key} className="mb-2 flex items-center gap-2">
                            <Label className="w-24 capitalize">{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                            <Input
                              type="text"
                              value={globalSocialLinks[key] || ""}
                              onChange={e => setGlobalSocialLinks({ ...globalSocialLinks, [key]: e.target.value })}
                              placeholder={`رابط ${key}`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">معلومات عن الموقع/الكاتب</h3>
                        <Label>نبذة تعريفية</Label>
                        <Textarea
                          value={globalAbout.bio || ""}
                          onChange={e => setGlobalAbout({ ...globalAbout, bio: e.target.value })}
                          placeholder="اكتب نبذة عن الموقع أو الكاتب..."
                          className="mb-2"
                        />
                        
                      </div>
                      <div className="flex gap-2 mt-4">
                        {globalEdit ? (
                          <>
                            <Button onClick={handleSaveGlobalSettings} className="bg-vintage-accent text-white">حفظ</Button>
                            <Button variant="outline" onClick={() => setGlobalEdit(false)}>إلغاء</Button>
                          </>
                        ) : (
                          <Button variant="outline" onClick={() => setGlobalEdit(true)}>تعديل</Button>
                        )}
                      </div>
                      {!globalEdit && (
                        <div className="text-xs text-muted-foreground mt-2">هذه الإعدادات تظهر في التذييل، الشريط العلوي، وصف الموقع وصفحة "عن الكاتب".</div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">إعدادات الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">

            {userData.isAdmin === false && (
              <div className="p-4 border border-vintage-border rounded-md">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-vintage-accent" />
                  <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">إدارة إشعارات البريد الإلكتروني التي ترغب في تلقيها</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-vintage-accent" />
                      <span className="text-sm">النشرة الإخبارية</span>
                    </div>
                    <Button
                      variant={emailNotifications.newsletter ? "default" : "outline"}
                      size="sm"
                      onClick={handleNewsletterToggle}
                      className={emailNotifications.newsletter 
                        ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white" 
                        : "border-vintage-border"
                      }
                    >
                      {emailNotifications.newsletter ? "مشترك" : "غير مشترك"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
