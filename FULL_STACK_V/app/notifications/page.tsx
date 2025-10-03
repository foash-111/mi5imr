"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Bell, Check, ArrowRight, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import type { Notification } from "@/backend/models/types"
import { Loading } from "@/components/ui/loading"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user) return

      try {
        const response = await fetch("/api/notifications")
        if (response.ok) {
          const data = await response.json()
          setNotifications(data)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [session])

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id?.toString() === id ? { ...notification, isRead: true } : notification,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "DELETE",
      })
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n._id?.toString() !== id))
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const deleteAllNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
      })
      if (response.ok) {
        setNotifications([])
        setDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to delete all notifications:", error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification._id!.toString())
    }

    // Navigate to the content if slug or contentId exists
    if (notification.slug) {
      router.push(`/content/${notification.slug}`)
    } else if (notification.contentId) {
      router.push(`/content/${notification.contentId}`)
    }
  }

  const handleBackClick = () => {
    router.back()
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>يرجى تسجيل الدخول لعرض الإشعارات</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الإشعارات
            </CardTitle>
            <div className="flex items-center gap-2">
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 ml-2" /> حذف الكل
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border-vintage-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-right text-vintage-ink">
                      حذف جميع الإشعارات
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-right text-gray-600">
                      هل أنت متأكد أنك تريد حذف جميع الإشعارات؟ هذا الإجراء لا يمكن التراجع عنه.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse">
                    <AlertDialogAction
                      onClick={deleteAllNotifications}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      حذف الكل
                    </AlertDialogAction>
                    <AlertDialogCancel className="border-vintage-border text-vintage-ink hover:text-vintage-accent">
                      إلغاء
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                className="border-vintage-border text-vintage-ink hover:text-vintage-accent"
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                رجوع
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading variant="skeleton" />
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id?.toString()}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    notification.isRead 
                      ? "bg-gray-50 hover:bg-gray-100" 
                      : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="text-xs">
                            جديد
                          </Badge>
                        )}
                        {notification.contentId && (
                          <Badge variant="outline" className="text-xs border-vintage-border">
                            انقر للعرض
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification._id!.toString())
                          }}
                          className="hover:bg-blue-200"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification._id!.toString())
                        }}
                        className="hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {notification.contentId && (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
