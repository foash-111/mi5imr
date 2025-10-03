"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { FaFacebook, FaYoutube, FaReddit } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6';
import { BookOpen, Menu, X, Moon, Sun, Bell, Plus, ChevronDown } from 'lucide-react'
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { deactivateUserStatus } from "@/lib/api-client"
import { useSearchParams } from "next/navigation";
import { getContentTypes } from "@/lib/api-client"
import type { ContentType } from "@/backend/models/types"
import {
  FileText,
  BookOpen as BookOpenIcon,
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
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import type { Notification } from "@/backend/models/types"

// Icon mapping for content types
const ICON_COMPONENTS = {
  FileText,
  BookOpen: BookOpenIcon,
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

interface SocialLinks {
  facebook?: string
  twitter?: string
  youtube?: string
  reddit?: string
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
	const [contentTypes, setContentTypes] = useState<ContentType[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
	const searchParams = useSearchParams(); // Add useSearchParams
	// authentication vars
	const { data: session, status } = useSession()
	const [isGuest, setIsGuest] = useState(false)
	//ign out user
	const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({})

  // Helper function to get the icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = ICON_COMPONENTS[iconName as keyof typeof ICON_COMPONENTS] || FileText
    return <IconComponent className="h-4 w-4" />
  }

  // Fetch social links from settings
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setSocialLinks(data.socialLinks || {})
        }
      } catch (error) {
        console.error("Failed to fetch social links:", error)
      }
    }

    fetchSocialLinks()
  }, [])

const isActive = (path: string) => {
    if (path === "/feed") {
      // Check if on /feed with no type query parameter
      return pathname === "/feed" && !searchParams.get("type");
    }
    if (path.startsWith("/feed?type=")) {
      const type = path.split("=")[1];
      return pathname === "/feed" && searchParams.get("type") === type;
    }
    return pathname === path;
  };

	useEffect(() => {
  setIsGuest(localStorage.getItem("isGuest") === "true")
	const fetchContentTypes = async () => {
      try {
        const types = await getContentTypes()
        setContentTypes(types)
      } catch (error) {
        console.error("Failed to fetch content types:", error)
      }
    }

    fetchContentTypes()
}, [])

  // Fetch unread notification count
  useEffect(() => {
    if (session?.user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch("/api/notifications/unread-count")
          if (response.ok) {
            const data = await response.json()
            setUnreadCount(data.count || 0)
          }
        } catch (error) {
          console.error("Failed to fetch unread count:", error)
        }
      }

      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [session])

  // Fetch recent notifications
  useEffect(() => {
    if (session?.user && showNotifications) {
      const fetchRecentNotifications = async () => {
        try {
          const response = await fetch("/api/notifications?limit=5")
          if (response.ok) {
            const data = await response.json()
            setRecentNotifications(data)
          }
        } catch (error) {
          console.error("Failed to fetch recent notifications:", error)
        }
      }

      fetchRecentNotifications()
    }
  }, [session, showNotifications])

  const markNotificationAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" })
      setUnreadCount(prev => Math.max(0, prev - 1))
      setRecentNotifications(prev => 
        prev.map(notif => 
          notif._id?.toString() === id ? { ...notif, isRead: true } : notif
        )
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

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

  const isAdmin = session?.user?.isAdmin || false
	
  // Handle content type selection with smart navigation
  const handleContentTypeSelect = (contentType: ContentType) => {
    setIsOpen(false) // Close mobile menu
    
    if (pathname === "/feed") {
      // Already on feed page - update URL without redirect
      const currentParams = new URLSearchParams(searchParams.toString())
      currentParams.set("type", contentType.label) // Use label for consistency with feed page
      router.push(`/feed?${currentParams.toString()}`)
    } else {
      // Not on feed page - redirect with content type filter
      router.push(`/feed?type=${contentType.label}`)
    }
  }

  // Check if a content type is currently selected
  const getSelectedContentType = () => {
    const selectedType = searchParams.get("type");
    if (selectedType && pathname === "/feed") {
      return contentTypes.find(type => type.label === selectedType);
    }
    return null;
  }

  const selectedContentType = getSelectedContentType();

  return (
	<>
			<header className="sticky top-0 z-50 w-full border-b border-vintage-border bg-vintage-paper/80 backdrop-blur-sm">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
							{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
							<span className="sr-only">القائمة</span>
						</Button>
						<Link href="/" className="flex items-center gap-2">
							<BookOpen className="h-6 w-6 text-vintage-accent" />
							<span className="text-xl font-bold">مخيمر</span>
						</Link>
					</div>

					<nav
						className={`${isOpen ? "flex" : "hidden"} md:flex absolute md:static top-16 right-0 left-0 flex-col md:flex-row items-start md:items-center gap-4 p-4 md:p-0 bg-vintage-paper md:bg-transparent border-b md:border-0 border-vintage-border`}
					>
						<Link
							href="/feed"
							className={`text-sm font-medium transition-colors ${isActive("/feed") ? "text-vintage-accent" : "hover:text-vintage-accent"}`}
							onClick={() => setIsOpen(false)}
						>
							الصفحة الرئيسية
						</Link>

						
							{/* Dynamic Content Types Dropdown */}
                            <DropdownMenu>
								<DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="text-sm font-medium hover:text-vintage-accent p-0 h-auto flex items-center">
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                        {selectedContentType ? (
                                            <>
                                                <span>{selectedContentType.label}</span>
                                                {getIconComponent(selectedContentType.icon)}
                                            </>
                                        ) : (
                                            <span>المحتويات</span>
                                        )}
									</Button>
								</DropdownMenuTrigger>
                              <DropdownMenuContent align="center" className="w-48">
									{contentTypes.map((type) => {
										const isSelected = selectedContentType?._id === type._id;
										return (
											<DropdownMenuItem key={type._id?.toString()} asChild>
												<Button 
													variant="ghost" 
													className={`w-full flex items-center gap-2 justify-start h-auto p-2 ${
														isSelected ? "bg-vintage-accent/10 text-vintage-accent" : ""
													}`}
													onClick={() => handleContentTypeSelect(type)}
												>
													{getIconComponent(type.icon)}
													<span>{type.label}</span>
													{isSelected && (
														<span className="mr-auto text-xs">✓</span>
													)}
												</Button>
											</DropdownMenuItem>
										);
									})}
								</DropdownMenuContent>
							</DropdownMenu>
						<Link
							href="/about"
							className={`text-sm font-medium transition-colors ${isActive("/about") ? "text-vintage-accent" : "hover:text-vintage-accent"}`}
							onClick={() => setIsOpen(false)}
						>
							عن مخيمر
						</Link>
					</nav>

					<div className="flex items-center gap-2">
							{/* Notification Bell with Dropdown */}
					{session?.user && (
						<DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="relative text-vintage-ink hover:text-vintage-accent h-8 w-8">
									<Bell className="h-4 w-4" />
									{unreadCount > 0 && (
										<Badge
											variant="destructive"
											className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] font-medium"
										>
											{unreadCount > 9 ? "9+" : unreadCount}
										</Badge>
									)}
									<span className="sr-only">الإشعارات</span>
								</Button>
							</DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
								<div className="p-2 border-b border-vintage-border">
									<h3 className="font-medium text-sm">الإشعارات الحديثة</h3>
								</div>
								{recentNotifications.length === 0 ? (
									<div className="p-4 text-center text-sm text-muted-foreground">
										لا توجد إشعارات جديدة
									</div>
								) : (
									<div className="space-y-1">
										{recentNotifications.map((notification) => (
											<DropdownMenuItem key={notification._id?.toString()} className="p-2 cursor-pointer">
												<div 
													className={`w-full text-right ${!notification.isRead ? 'bg-blue-50' : ''} p-2 rounded-md`}
													onClick={() => {
														markNotificationAsRead(notification._id!.toString())
														if (notification.slug) {
															router.push(`/content/${notification.slug}`)
														} else if (notification.contentId) {
															router.push(`/content/${notification.contentId}`)
														}
													}}
												>
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-1">
																<h4 className="font-medium text-sm">{notification.title}</h4>
																{!notification.isRead && (
																	<Badge variant="secondary" className="text-xs">
																		جديد
																	</Badge>
																)}
															</div>
															<p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
															<p className="text-xs text-muted-foreground">
																{formatDistanceToNow(new Date(notification.createdAt), {
																	addSuffix: true,
																	locale: ar,
																})}
															</p>
														</div>
													</div>
												</div>
											</DropdownMenuItem>
										))}
									</div>
								)}
								<div className="p-2 border-t border-vintage-border">
									<Link href="/notifications">
										<Button variant="ghost" size="sm" className="w-full text-sm">
											عرض جميع الإشعارات
										</Button>
									</Link>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					)}

						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							className="text-vintage-ink hover:text-vintage-accent"
						>
							{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
							<span className="sr-only">تبديل المظهر</span>
						</Button>
						<div className="hidden md:flex items-center gap-1">
							<a href={socialLinks.facebook || "#"} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
									<FaFacebook className="h-4 w-4" />
									<span className="sr-only">فيسبوك</span>
								</Button>
							</a>
							<a href={socialLinks.twitter || "#"} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
									<FaXTwitter className="h-4 w-4" />
									<span className="sr-only">تويتر</span>
								</Button>
							</a>
							<a href={socialLinks.youtube || "#"} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
									<FaYoutube className="h-4 w-4" />
									<span className="sr-only">يوتيوب</span>
								</Button>
							</a>
							<a href={socialLinks.reddit || "#"} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
									<FaReddit className="h-4 w-4" />
									<span className="sr-only">ريديت</span>
								</Button>
							</a>
						</div>
						{session?.user ? (
								<div className="relative">
									<Button
										variant="outline"
										size="sm"
										className="hidden md:flex border-vintage-accent text-vintage-accent hover:bg-vintage-accent/10"
										onClick={() => setProfileOpen((open) => !open)}
									>
										{session.user.avatar && (
											<img
												src={session.user.avatar}
												alt={session.user.name || "User"}
												className="w-6 h-6 rounded-full ml-2"
											/>
										)}
										{session.user.name || "المستخدم"}
										</Button>
										{profileOpen && (
											<div className="absolute left-0 mt-2 w-40   border rounded shadow-lg z-50 bg-gray-200  dark:bg-black md:dark:bg-black">
												<Link
													href="/profile"
													className="block px-4 py-2 text-sm hover:bg-vintage-accent/10"
													onClick={() => setProfileOpen(false)}
												>
													الملف الشخصي
												</Link>
												<button
													className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-vintage-accent/10"
													onClick={() => {
														handleLogout()
														setProfileOpen(false)
													}}
												>
													تسجيل الخروج
												</button>
											</div>
										)}
									</div>
							) : isGuest ? (
								// Guest user
								<Button
									variant="outline"
									size="sm"
									className="hidden md:flex border-vintage-accent text-vintage-accent hover:bg-vintage-accent/10"
									onClick={() => {
										localStorage.removeItem("isGuest")
										window.location.reload()
									}}
								>
									ضيف (تسجيل الخروج)
								</Button>
							) : (
								// Not logged in
								<Link href="/auth/login">
									<Button
										variant="outline"
										size="sm"
										className="hidden md:flex border-vintage-accent text-vintage-accent hover:bg-vintage-accent/10"
									>
										تسجيل الدخول
									</Button>
								</Link>
						)}
					</div>
				</div>
			</header>

			{/* Admin-Only Floating Create Button */}
				{isAdmin && (
					<div className="fixed bottom-6 left-6 z-40">
						<Link href="/admin/create">
							<Button
								size="lg"
								className="rounded-full shadow-lg bg-vintage-accent hover:bg-vintage-accent/90 text-white"
							>
								<Plus className="h-5 w-5 mr-2" />
								إنشاء محتوى
							</Button>
						</Link>
					</div>
				)}
  </>
  )	
}
