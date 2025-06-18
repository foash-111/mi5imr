"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { FaFacebook, FaYoutube, FaTwitter, FaReddit } from 'react-icons/fa'
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

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
	const [contentTypes, setContentTypes] = useState<ContentType[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
	const searchParams = useSearchParams(); // Add useSearchParams
	// authentication vars
	const { data: session } = useSession()
	const [isGuest, setIsGuest] = useState(false)
	//ign out user
	const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()


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


// notfictions section
/*
 // Fetch unread notifications count for authenticated users
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/notifications/unread-count")
          if (response.ok) {
            const data = await response.json()
            setUnreadCount(data.count)
          }
        } catch (error) {
          console.error("Failed to fetch unread count:", error)
        }
      }
    }

    fetchUnreadCount()
  }, [session])

*/


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

  const isAdmin = session?.user?.isAdmin || false
	
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
							المحتويات
						</Link>

						
							{/* Dynamic Content Types Dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="text-sm font-medium hover:text-vintage-accent p-0 h-auto">
										أنواع المحتوى
										<ChevronDown className="mr-1 h-3 w-3" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48">
									{contentTypes.map((type) => (
										<DropdownMenuItem key={type._id?.toString()} asChild>
											<Link href={`/feed?type=${type.name}`} className="w-full" onClick={() => setIsOpen(false)}>
												{type.label}
											</Link>
										</DropdownMenuItem>
									))}
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
							{/* Notification Bell */}
					{session?.user && (
						<Link href="/notifications">
							<Button variant="ghost" size="icon" className="relative text-vintage-ink hover:text-vintage-accent">
								<Bell className="h-5 w-5" />
								{unreadCount > 0 && (
									<Badge
										variant="destructive"
										className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
									>
										{unreadCount > 9 ? "9+" : unreadCount}
									</Badge>
								)}
								<span className="sr-only">الإشعارات</span>
							</Button>
						</Link>
					)}

					<div className="flex items-center gap-2">
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
							<a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
									<FaFacebook className="h-4 w-4" />
									<span className="sr-only">فيسبوك</span>
								</Button>
							</a>
							<a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
									<FaXTwitter className="h-4 w-4" />
									<span className="sr-only">تويتر</span>
								</Button>
							</a>
							<a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
									<FaYoutube className="h-4 w-4" />
									<span className="sr-only">يوتيوب</span>
								</Button>
							</a>
							<a href="https://reddit.com" target="_blank" rel="noopener noreferrer">
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
											<div className="absolute left-0 mt-2 w-40   border rounded shadow-lg z-50 bg-gray-200 md:bg-white dark:bg-black md:dark:bg-black">
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
