"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
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

interface ContactLocation {
  address: string
  mapUrl?: string  // For footer link (normal Google Maps URL)
  embedUrl?: string // For iframe (embed URL)
}

export default function ContactPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const isAdmin = !!session?.user?.isAdmin

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactLocation, setContactLocation] = useState<ContactLocation>({
    address: "القاهرة، مصر",
    mapUrl: "",
    embedUrl: ""
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true)
      try {
        const res = await fetch("/api/settings")
        const data = await res.json()
        if (data) {
          setContactEmail(data.contactEmail || "")
          setContactPhone(data.contactPhone || "")
          setContactLocation(data.contactLocation || contactLocation)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
    // eslint-disable-next-line
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, subject, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل في إرسال الرسالة")
      }

      toast({
        title: "تم إرسال رسالتك",
        description: "سنقوم بالرد عليك في أقرب وقت ممكن. شكراً لتواصلك معنا.",
      })

      setIsSubmitted(true)
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } catch (error) {
      console.error("Failed to submit contact message:", error)
      toast({
        title: "خطأ في الإرسال",
        description: error instanceof Error ? error.message : "فشل في إرسال الرسالة",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSave() {
    // Always extract the embedUrl from the input before saving
    const cleanEmbedUrl = extractEmbedUrl(contactLocation.embedInput || contactLocation.embedUrl || "");
    const contactLocationToSave = {
      ...contactLocation,
      embedUrl: cleanEmbedUrl,
    };
    console.log('Saving contact info:', JSON.stringify({
      contactEmail,
      contactPhone,
      contactLocation: contactLocationToSave
    }, null, 2));
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactEmail,
        contactPhone,
        contactLocation: contactLocationToSave,
      }),
    });
    if (res.ok) setIsEditing(false);
  }

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>

  // Helper to extract the `src` from an iframe string, or return the input as-is if it's a URL.
 function extractEmbedUrl(input: string): string {
   // Decode HTML entities (like &quot;)
   const decoded = input.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
 
   // Try to extract the src from iframe tag
   const match = decoded.match(/<iframe[^>]+src=["']([^"']+)["']/i);
   if (match) return match[1];
 
   // If input is already a URL, return as is
   if (/^https?:\/\//i.test(input.trim())) return input.trim();
 
   // Fallback: return original input
   return input;
 }
 

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">تواصل معنا</h1>
            <p className="text-xl text-muted-foreground">
              نحن هنا للإجابة على استفساراتك والاستماع إلى اقتراحاتك
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-vintage-border backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">معلومات التواصل</CardTitle>
                  <CardDescription>يمكنك التواصل معنا من خلال الطرق التالية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-vintage-accent/10 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-vintage-accent" />
                    </div>
                    <div>
                      <p className="font-medium">البريد الإلكتروني</p>
                      {isAdmin && isEditing ? (
                        <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                      ) : (
                        <p className="text-sm text-muted-foreground">{contactEmail}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-vintage-accent/10 p-2 rounded-full">
                      <Phone className="h-5 w-5 text-vintage-accent" />
                    </div>
                    <div>
                      <p className="font-medium">الهاتف</p>
                      {isAdmin && isEditing ? (
                        <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                      ) : (
                        <p className="text-sm text-muted-foreground">{contactPhone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-vintage-accent/10 p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-vintage-accent" />
                    </div>
                    <div className="w-full">
                      <p className="font-medium">العنوان</p>
                      {isAdmin && isEditing ? (
                        <>
                          <Input value={contactLocation.address} onChange={e => setContactLocation({ ...contactLocation, address: e.target.value })} className="mb-2" />
                          <Input
                            type="text"
                            placeholder="رابط خريطة جوجل (لرابط في التذييل)"
                            value={contactLocation.mapUrl || ""}
                            onChange={e => setContactLocation({ ...contactLocation, mapUrl: e.target.value })}
                            className="mb-2"
                          />
                         <Input
  type="text"
  placeholder="رابط إعادة إنتاج الخريطة (لنافذة الخريطة)"
  value={contactLocation.embedInput || ""}
  onChange={e => setContactLocation({ ...contactLocation, embedInput: e.target.value })}
  onBlur={e =>
    setContactLocation({
      ...contactLocation,
      embedInput: e.target.value,
      embedUrl: extractEmbedUrl(e.target.value),
    })
  }
  className="mb-2"
/>

                          <div className="text-xs text-muted-foreground mb-2">
                            <p>• رابط الخريطة: أي رابط من خرائط جوجل (مثل رابط المشاركة)</p>
                            <p>• رابط الإعادة: من "مشاركة" → "إعادة إنتاج خريطة" في خرائط جوجل</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">{contactLocation.address}</p>
                      )}
                </div>
                </div>
                  {isAdmin && (
                    <div className="flex gap-2 mt-4">
                      {isEditing ? (
                        <>
                          <Button onClick={handleSave} className="bg-vintage-accent text-white">حفظ</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>إلغاء</Button>
                        </>
                      ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>تعديل</Button>
                      )}
                </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
            <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
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
                    <div className="space-y-2">
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
                        disabled={isSubmitting}
                      />
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
                        disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                      className="w-full bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          جاري الإرسال...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                        إرسال الرسالة
                        </div>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          </div>

          {/* Google Maps Embed */}
          <div className="mt-12 rounded-lg overflow-hidden border border-vintage-border">
                {contactLocation.embedUrl && (
                  <div className="my-4">
                    <a
                      href={contactLocation.mapUrl || contactLocation.embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vintage-accent underline block mb-2"
                    >
                      عرض الموقع على الخريطة
                    </a>
                    <iframe
                      src={contactLocation.embedUrl}
                      width="100%"
                      height="350"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                )}
              </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
