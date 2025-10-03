"use client"

import type React from "react"
import { Suspense } from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loading } from "@/components/ui/loading"
import { MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function FeedbackPage() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, role, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل في إرسال الرأي")
      }

      toast({
        title: "تم إرسال رأيك بنجاح",
        description: "نقدر مشاركتك ونعدك بالاطلاع على اقتراحاتك.",
      })
      
      setIsSubmitted(true)
      setName("")
      setEmail("")
      setRole("")
      setMessage("")
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      toast({
        title: "خطأ في الإرسال",
        description: error instanceof Error ? error.message : "فشل في إرسال الرأي",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Suspense fallback={<Loading variant="page" text="جاري التحميل..." />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-vintage-accent/10 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-vintage-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl">أرسل رأيك</CardTitle>
              <CardDescription>
                نحن نقدر آراءك واقتراحاتك. ساعدنا في تحسين المنصة من خلال مشاركة أفكارك معنا.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center text-green-800">
                  <h3 className="text-xl font-bold mb-2">شكراً لك!</h3>
                  <p>تم استلام رأيك بنجاح. نقدر مشاركتك ونعدك بالاطلاع على اقتراحاتك.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">الاسم</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أدخل اسمك"
                      className="border-vintage-border"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="أدخل بريدك الإلكتروني"
                      className="border-vintage-border"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="role" >المهنة</Label>
                    <Input
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder=" ما هي مهنتك"
                      className="border-vintage-border"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="message">رسالتك</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اكتب رأيك أو اقتراحك هنا..."
                      className="min-h-[150px] border-vintage-border"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loading variant="inline" size="sm" text="جاري الإرسال..." />
                    ) : (
                      "إرسال"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
