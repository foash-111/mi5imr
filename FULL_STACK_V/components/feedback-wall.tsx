"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

interface Feedback {
  _id: string
  name: string
  role: string
  message: string
  status: "pending" | "approved" | "rejected"
  isPublic: boolean
  createdAt: string
}

export function FeedbackWall() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const response = await fetch("/api/feedback")
        if (!response.ok) {
          throw new Error("فشل في جلب البيانات")
        }
        const data = await response.json()
        // Filter only approved and public feedback
        const publicFeedback = data.filter((feedback: Feedback) => 
          feedback.status === "approved" && feedback.isPublic
        )
        setFeedbacks(publicFeedback.slice(0, 4)) // Show only 4 feedback items
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ ما")
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-vintage-border backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لا يمكن تحميل آراء القراء حالياً</p>
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8">
        <Quote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">لا توجد آراء متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {feedbacks.map((feedback) => (
        <Card key={feedback._id} className="border-vintage-border backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6 relative">
            {/* <Quote className="absolute top-4 right-4 h-8 w-8 text-vintage-accent/20" /> */}
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-12 w-12 border-2 border-vintage-border">
                <AvatarImage  alt={feedback.name} />
                <AvatarFallback className="bg-vintage-paper-dark text-white">
                  {feedback.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold">{feedback.name}</h4>
                <p className="text-sm text-muted-foreground">{feedback.role}</p>
              </div>
            </div>
            <p className="text-vintage-ink leading-relaxed pr-6">{feedback.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
