"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)

      toast({
        title: "تم إرسال رسالتك",
        description: "سنقوم بالرد عليك في أقرب وقت ممكن. شكراً لتواصلك معنا.",
      })

      // Reset form
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    }, 1500)
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">اتصل بنا</h1>
            <p className="text-muted-foreground">نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Info Cards */}
            <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-vintage-accent/10 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-vintage-accent" />
                </div>
                <h3 className="font-bold mb-2">البريد الإلكتروني</h3>
                <p className="text-muted-foreground mb-2">راسلنا عبر البريد الإلكتروني</p>
                <a href="mailto:info@mukhaimer.com" className="text-vintage-accent hover:underline">
                  info@mukhaimer.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-vintage-accent/10 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-vintage-accent" />
                </div>
                <h3 className="font-bold mb-2">الهاتف</h3>
                <p className="text-muted-foreground mb-2">اتصل بنا مباشرة</p>
                <a href="tel:+201234567890" className="text-vintage-accent hover:underline">
                  +20 123 456 7890
                </a>
              </CardContent>
            </Card>

            <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-vintage-accent/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-vintage-accent" />
                </div>
                <h3 className="font-bold mb-2">العنوان</h3>
                <p className="text-muted-foreground mb-2">مقرنا الرئيسي</p>
                <address className="not-italic">القاهرة، مصر</address>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mt-8">
            <CardHeader>
              <CardTitle className="text-xl">أرسل لنا رسالة</CardTitle>
              <CardDescription>يمكنك التواصل معنا مباشرة من خلال هذا النموذج</CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">تم إرسال رسالتك بنجاح!</h3>
                  <p className="text-green-700 mb-4">
                    شكراً لتواصلك معنا. سيقوم فريقنا بمراجعة رسالتك والرد عليك في أقرب وقت ممكن.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                  >
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="أدخل اسمك"
                        className="border-vintage-border"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="أدخل بريدك الإلكتروني"
                        className="border-vintage-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">الموضوع</Label>
                    <Select value={subject} onValueChange={setSubject} required>
                      <SelectTrigger className="border-vintage-border">
                        <SelectValue placeholder="اختر موضوع الرسالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="استفسار عام">استفسار عام</SelectItem>
                        <SelectItem value="اقتراح">اقتراح</SelectItem>
                        <SelectItem value="الإبلاغ عن مشكلة">الإبلاغ عن مشكلة</SelectItem>
                        <SelectItem value="التعاون والشراكات">التعاون والشراكات</SelectItem>
                        <SelectItem value="حقوق النشر">حقوق النشر</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">الرسالة</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اكتب رسالتك هنا..."
                      className="min-h-[150px] border-vintage-border"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "جاري الإرسال..."
                    ) : (
                      <>
                        <Send className="ml-2 h-4 w-4" />
                        إرسال الرسالة
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mt-8">
            <CardContent className="p-0">
              <div className="relative h-80 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55251.37809421403!2d31.209651899999998!3d30.059488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296e8423bba!2z2KfZhNmC2KfZh9ix2KnYjCDZhdit2KfZgdi42Kkg2KfZhNmC2KfZh9ix2KnigKw!5e0!3m2!1sar!2seg!4v1651234567890!5m2!1sar!2seg"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="خريطة موقعنا"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
