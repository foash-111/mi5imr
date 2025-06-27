"use client";
import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

export function useNotificationPolling() {
  const { toast } = useToast()
  const lastCount = useRef<number>(0)
  const polling = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isMounted = true

    async function checkNotifications() {
      try {
        const res = await fetch("/api/notifications/unread-count")
        const data = await res.json()
        const count = data.count || 0
        if (count > lastCount.current) {
          // Fetch the latest notification
          const notifRes = await fetch("/api/notifications?limit=1")
          const notifData = await notifRes.json()
          const latest = notifData.notifications?.[0] || notifData[0]
          if (latest) {
            // Always redirect to the post URL
            let url = "/"
            if (latest.contentId) {
              url = `/content/${latest.contentId}`
            }
            // Show clickable toast
            toast({
              title: latest.type === 'new_post' ? latest.title : latest.message,
              duration: 8000,
              action: {
                label: 'عرض',
                onClick: async () => {
                  // Mark as read
                  await fetch(`/api/notifications/${latest._id}/read`, { method: 'PUT' })
                  // Redirect
                  window.location.href = url
                },
              },
            })
          }
        }
        lastCount.current = count
      } catch (e) {
        // Ignore errors
      }
    }

    polling.current = setInterval(checkNotifications, 15000)
    checkNotifications()

    return () => {
      isMounted = false
      if (polling.current) clearInterval(polling.current)
    }
  }, [toast])
} 