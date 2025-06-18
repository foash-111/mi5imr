import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

// Mock feedback data
const feedbacks = [
  {
    id: 1,
    name: "أحمد محمود",
    role: "قارئ",
    avatar: "/placeholder.svg?height=100&width=100",
    feedback: "استمتعت كثيراً بقراءة قصصك، أسلوبك في السرد يجعلني أشعر وكأنني جزء من الأحداث.",
  },
  {
    id: 2,
    name: "سارة علي",
    role: "كاتبة",
    avatar: "/placeholder.svg?height=100&width=100",
    feedback: "مقالاتك عن الكتابة الإبداعية ألهمتني كثيراً وساعدتني على تطوير أسلوبي الخاص.",
  },
  {
    id: 3,
    name: "محمد خالد",
    role: "طالب",
    avatar: "/placeholder.svg?height=100&width=100",
    feedback: "أحب الاستماع إلى البودكاست الخاص بك، يساعدني على فهم الأدب بطريقة مبسطة وممتعة.",
  },
  {
    id: 4,
    name: "نور حسن",
    role: "قارئة",
    avatar: "/placeholder.svg?height=100&width=100",
    feedback: "قصائدك تلامس القلب وتعبر عن مشاعر حقيقية، أشكرك على مشاركة إبداعك معنا.",
  },
]

export function FeedbackWall() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {feedbacks.map((feedback) => (
        <Card key={feedback.id} className="border-vintage-border  backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6 relative">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-vintage-accent/20" />
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-12 w-12 border-2 border-vintage-border">
                <AvatarImage src={feedback.avatar || "/placeholder.svg"} alt={feedback.name} />
                <AvatarFallback className="bg-vintage-paper-dark text-white">
                  {feedback.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold">{feedback.name}</h4>
                <p className="text-sm text-muted-foreground">{feedback.role}</p>
              </div>
            </div>
            <p className="text-vintage-ink leading-relaxed pr-6">{feedback.feedback}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
