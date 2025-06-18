"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setEmail("")
        toast({
          title: "تم الاشتراك بنجاح!",
          description: "سنرسل لك أحدث المحتويات في بريدك الإلكتروني",
        })
      } else {
        toast({
          title: "خطأ في الاشتراك",
          description: data.error || "حدث خطأ أثناء الاشتراك",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex justify-center mb-4">
          <div className="bg-vintage-accent/10 p-3 rounded-full">
            <Mail className="h-6 w-6 text-vintage-accent" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-center mb-2">اشترك في النشرة البريدية</h3>
        <p className="text-center text-muted-foreground mb-6">
          احصل على أحدث المقالات والقصص مباشرة في بريدك الإلكتروني
        </p>

        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center text-green-800">
            شكراً لاشتراكك! سنرسل لك أحدث المحتويات قريباً.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="flex-1 border-vintage-border focus-visible:ring-vintage-accent"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الاشتراك...
                </>
              ) : (
                "اشتراك"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
