import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MediaPlayer } from "@/components/media-player"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mic, Calendar, Clock, Download, Share2 } from "lucide-react"
import Image from "next/image"

// Mock podcasts data
const podcasts = [
  {
    id: 1,
    title: "الإبداع والإلهام",
    description:
      "في هذه الحلقة نتحدث عن مصادر الإلهام وكيفية تنمية القدرات الإبداعية. نستضيف كاتباً وفناناً للحديث عن تجاربهم الشخصية مع الإبداع والتحديات التي واجهوها في مسيرتهم الفنية.",
    image: "/placeholder.svg?height=400&width=600",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    date: "١ أبريل ٢٠٢٣",
    duration: "45:30",
    category: "فن وإبداع",
  },
  {
    id: 2,
    title: "الوعي والحضور",
    description:
      "حلقة تناقش أهمية الوعي والحضور في اللحظة الراهنة، وكيف يمكن أن يساعدنا ذلك على تحسين جودة حياتنا والتعامل مع التحديات اليومية بشكل أفضل.",
    image: "/placeholder.svg?height=400&width=600",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    date: "١٥ مارس ٢٠٢٣",
    duration: "38:45",
    category: "تطوير ذات",
  },
  {
    id: 3,
    title: "القراءة والمعرفة",
    description:
      "نناقش في هذه الحلقة أهمية القراءة ودورها في توسيع آفاق المعرفة، مع نصائح عملية لتطوير عادة القراءة وكيفية اختيار الكتب المناسبة.",
    image: "/placeholder.svg?height=400&width=600",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    date: "١ مارس ٢٠٢٣",
    duration: "42:15",
    category: "ثقافة",
  },
]

export default function PodcastsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
      </Suspense>
      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">بودكاست مخيمر</h1>
            <p className="text-muted-foreground">استمع إلى أحدث حلقات البودكاست حول الأدب والفن والحياة</p>
          </div>

          <div className="space-y-8">
            {podcasts.map((podcast) => (
              <Card key={podcast.id} className="border-vintage-border  backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-vintage-border">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <div className="relative aspect-video rounded-md overflow-hidden">
                          <Image
                            src={podcast.image || "/placeholder.svg"}
                            alt={podcast.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div className="md:w-2/3">
                        <Badge className="mb-2 bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                          <Mic className="h-3 w-3 ml-1" />
                          {podcast.category}
                        </Badge>

                        <h2 className="text-2xl font-bold mb-2">{podcast.title}</h2>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{podcast.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{podcast.duration}</span>
                          </div>
                        </div>

                        <p className="mb-4">{podcast.description}</p>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="border-vintage-border">
                            <Download className="h-4 w-4 ml-1" />
                            تحميل
                          </Button>
                          <Button variant="outline" size="sm" className="border-vintage-border">
                            <Share2 className="h-4 w-4 ml-1" />
                            مشاركة
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <MediaPlayer type="audio" src={podcast.audioSrc} title={podcast.title} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
