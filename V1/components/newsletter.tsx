"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your API
    console.log("Subscribing email:", email)
    setIsSubmitted(true)
    setEmail("")
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
              className="flex-1 border-vintage-border focus-visible:ring-vintage-accent"
            />
            <Button type="submit" className="bg-vintage-accent hover:bg-vintage-accent/90 text-white">
              اشتراك
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
