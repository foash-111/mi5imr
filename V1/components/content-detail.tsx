"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, FileText, Heart, Bookmark, Share2, Calendar } from "lucide-react"
import Image from "next/image"

// Mock content data - in a real app, this would come from a database
const contentData = {
  "journey-to-imagination": {
    id: 1,
    title: "رحلة إلى عالم الخيال",
    content: `في هذه القصة نتناول رحلة خيالية إلى عوالم لم يسبق لأحد أن زارها من قبل. نستكشف معاً الحدود بين الواقع والخيال، ونتأمل في معنى الوجود والإبداع.

كان ياما كان، في قديم الزمان، كان هناك فتى يدعى سليم، يعيش في قرية صغيرة محاطة بالجبال. كان سليم يحب القراءة كثيراً، ويقضي معظم وقته بين الكتب، يستكشف عوالم جديدة من خلال الكلمات والقصص.

في أحد الأيام، وبينما كان سليم يقرأ كتاباً قديماً وجده في مكتبة جده، لاحظ أن الكلمات بدأت تتحرك على الصفحة، وكأنها تنبض بالحياة. وفجأة، وجد نفسه ينجذب إلى داخل الكتاب، ليجد نفسه في عالم غريب، مليء بالألوان والأشكال الغريبة.

في هذا العالم، كانت الأفكار تتجسد وتتحول إلى حقيقة، والكلمات تتحول إلى كائنات حية تتفاعل مع بعضها البعض. التقى سليم بشخصيات من قصص مختلفة، وتعلم منهم أن الخيال هو القوة التي تحرك العالم، وأن الإبداع هو الجسر الذي يربط بين العوالم المختلفة.

خلال رحلته، واجه سليم تحديات كثيرة، وتعلم دروساً قيمة عن الشجاعة والصداقة والإيمان بالنفس. وفي نهاية المطاف، أدرك أن العودة إلى عالمه الحقيقي لا تعني نهاية المغامرة، بل بداية لمغامرات جديدة، حيث يمكنه استخدام ما تعلمه لإثراء حياته وحياة من حوله.

هذه القصة هي دعوة للتفكير خارج الصندوق والتحليق بعيداً في سماء الإبداع، لاكتشاف العوالم الخفية داخل أنفسنا وفي العالم من حولنا.`,
    type: "حواديت",
    icon: BookOpen,
    image: "/novel.png?height=600&width=1200",
    date: "٢٠ أبريل ٢٠٢٣",
    likes: 42,
    comments: 7,
    author: {
      name: "مخيمر",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    tags: ["خيال", "إبداع", "قصص"],
  },
  "daily-reflections": {
    id: 2,
    title: "تأملات في الحياة اليومية",
    content: `مجموعة من التأملات والأفكار حول الحياة اليومية والتحديات التي نواجهها. كيف يمكننا أن نجد المعنى في التفاصيل الصغيرة؟ وكيف نتعامل مع ضغوط الحياة المعاصرة؟

في خضم الحياة السريعة التي نعيشها اليوم، غالباً ما ننسى أن نتوقف للحظة ونتأمل في الأشياء البسيطة من حولنا. نركض من مهمة إلى أخرى، من التزام إلى آخر، دون أن نمنح أنفسنا الوقت للتفكير والتأمل.

لكن في هذه اللحظات البسيطة، في تلك التفاصيل الصغيرة التي نمر عليها مرور الكرام، تكمن أحياناً أعمق الدروس وأجمل اللحظات. في ابتسامة طفل، في غروب الشمس، في فنجان قهوة صباحي، في محادثة عابرة مع صديق أو غريب.

التأمل ليس ترفاً، بل هو ضرورة للحفاظ على توازننا النفسي والروحي في عالم يتسارع باستمرار. إنه الفرصة التي نمنحها لأنفسنا للتوقف والتنفس والتفكير في معنى ما نفعله وما نعيشه.

كيف يمكننا إذن أن ندمج التأمل في حياتنا اليومية المزدحمة؟

1. **خصص وقتاً للصمت**: حتى لو كان خمس دقائق في اليوم، امنح نفسك فرصة للجلوس في صمت، بعيداً عن الضوضاء والتكنولوجيا.

2. **لاحظ التفاصيل**: حاول أن تلاحظ الأشياء الصغيرة من حولك، الألوان، الأصوات، الروائح. كن حاضراً في اللحظة.

3. **اكتب أفكارك**: الكتابة هي وسيلة رائعة للتأمل والتفكير. خصص دفتراً لتدوين أفكارك وتأملاتك اليومية.

4. **تعلم من التحديات**: بدلاً من النظر إلى التحديات كعقبات، انظر إليها كفرص للتعلم والنمو.

5. **امتن للأشياء البسيطة**: الامتنان هو مفتاح السعادة. حاول أن تجد شيئاً واحداً على الأقل كل يوم تشعر بالامتنان له.

في النهاية، التأمل هو رحلة شخصية، تختلف من شخص لآخر. المهم هو أن نجد الطريقة التي تناسبنا للتوقف والتأمل والاستمتاع بالحياة بكل تفاصيلها الصغيرة والكبيرة.`,
    type: "تأملات",
    icon: FileText,
    image: "/people-leave.png?height=600&width=1200",
    date: "١٥ أبريل ٢٠٢٣",
    likes: 35,
    comments: 12,
    author: {
      name: "مخيمر",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    tags: ["تأملات", "حياة", "فلسفة"],
  },
}

export function ContentDetail({ slug }: { slug: string }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Get content data based on slug
  const content = contentData[slug as keyof typeof contentData]

  // If content not found
  if (!content) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">المحتوى غير موجود</h2>
        <p>عذراً، لم نتمكن من العثور على المحتوى المطلوب.</p>
      </div>
    )
  }

  const IconComponent = content.icon

  return (
    <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8">
      <CardContent className="p-0">
        <div className="relative h-64 md:h-96 w-full">
          <Image src={content.image || "/placeholder.svg"} alt={content.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
              <Badge className="mb-4 bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                <IconComponent className="h-3 w-3 mr-1" />
                {content.type}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{content.title}</h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-vintage-border">
                <AvatarImage src={content.author.avatar || "/placeholder.svg"} alt={content.author.name} />
                <AvatarFallback className="bg-vintage-paper-dark text-white">
                  {content.author.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{content.author.name}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {content.date}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={isLiked ? "text-red-500" : ""}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className="h-4 w-4 mr-1" fill={isLiked ? "currentColor" : "none"} />
                <span>{isLiked ? content.likes + 1 : content.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={isSaved ? "text-vintage-accent" : ""}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Bookmark className="h-4 w-4 mr-1" fill={isSaved ? "currentColor" : "none"} />
                <span>حفظ</span>
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                <span>مشاركة</span>
              </Button>
            </div>
          </div>

          <div className="prose prose-lg max-w-none rtl:text-right">
            {content.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-vintage-border">
            {content.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-vintage-border bg-vintage-paper-dark/5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
