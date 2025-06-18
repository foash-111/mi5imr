"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

// FAQ data
const faqItems = [
  {
    id: "general-1",
    category: "عام",
    question: "ما هي منصة مخيمر؟",
    answer:
      "منصة مخيمر هي منصة أدبية وثقافية تهدف إلى نشر المحتوى الإبداعي باللغة العربية، بما في ذلك القصص والمقالات والشعر والتأملات. تسعى المنصة لتكون جسراً للتواصل بين الكتّاب والقراء وتوفير مساحة للإبداع والتعبير.",
  },
  {
    id: "general-2",
    category: "عام",
    question: "هل المحتوى على المنصة مجاني؟",
    answer:
      "نعم، جميع المحتويات المنشورة على منصة مخيمر متاحة للقراءة مجاناً. نؤمن بأهمية إتاحة المحتوى الثقافي والأدبي للجميع دون قيود مالية.",
  },
  {
    id: "account-1",
    category: "الحسابات",
    question: "كيف يمكنني إنشاء حساب على المنصة؟",
    answer:
      "يمكنك إنشاء حساب على منصة مخيمر بسهولة من خلال النقر على زر 'تسجيل الدخول' في الشريط العلوي، ثم اختيار 'تسجيل الدخول بحساب جوجل'. يمكنك أيضاً تصفح المنصة كزائر دون الحاجة لإنشاء حساب، لكن بعض الميزات مثل التعليق وحفظ المحتوى ستكون محدودة.",
  },
  {
    id: "account-2",
    category: "الحسابات",
    question: "كيف يمكنني تغيير معلومات حسابي؟",
    answer:
      "يمكنك تعديل معلومات حسابك من خلال الانتقال إلى صفحة الملف الشخصي، ثم النقر على زر 'تعديل الملف الشخصي'. هناك يمكنك تغيير صورتك الشخصية، والنبذة التعريفية، وغيرها من المعلومات.",
  },
  {
    id: "content-1",
    category: "المحتوى",
    question: "ما هي أنواع المحتوى المتوفرة على المنصة؟",
    answer:
      "تتضمن منصة مخيمر مجموعة متنوعة من المحتويات، بما في ذلك: المقالات، القصص والحواديت، الشعر، التأملات الفلسفية، مراجعات الكتب والأفلام، وحلقات البودكاست. نسعى دائماً لإثراء المنصة بمحتوى متنوع يناسب مختلف الاهتمامات.",
  },
  {
    id: "content-2",
    category: "المحتوى",
    question: "هل يمكنني المساهمة بمحتوى على المنصة؟",
    answer:
      "نرحب بمساهمات القراء والكتّاب! للمساهمة بمحتوى، يرجى التواصل معنا عبر صفحة 'اتصل بنا' مع إرفاق نموذج من كتاباتك. سيقوم فريق التحرير بمراجعة المحتوى والرد عليك في أقرب وقت ممكن.",
  },
  {
    id: "technical-1",
    category: "تقني",
    question: "هل يمكنني استخدام المنصة على الهاتف المحمول؟",
    answer:
      "نعم، منصة مخيمر مصممة بشكل متجاوب (Responsive) لتعمل بشكل مثالي على جميع الأجهزة، بما في ذلك الهواتف الذكية والأجهزة اللوحية. يمكنك الاستمتاع بتجربة قراءة سلسة على أي جهاز تستخدمه.",
  },
  {
    id: "technical-2",
    category: "تقني",
    question: "ماذا أفعل إذا واجهت مشكلة تقنية على المنصة؟",
    answer:
      "إذا واجهت أي مشكلة تقنية، يرجى إبلاغنا عبر صفحة 'اتصل بنا' مع وصف تفصيلي للمشكلة، ونوع الجهاز والمتصفح الذي تستخدمه. سيقوم فريق الدعم الفني لدينا بالتواصل معك ومساعدتك في حل المشكلة في أقرب وقت ممكن.",
  },
  {
    id: "rights-1",
    category: "حقوق النشر",
    question: "هل يمكنني نقل محتوى من المنصة إلى موقعي الخاص؟",
    answer:
      "جميع المحتويات على منصة مخيمر محمية بحقوق النشر. يُسمح باقتباس مقاطع قصيرة مع الإشارة الواضحة إلى المصدر، لكن إعادة نشر المحتوى بالكامل تتطلب إذناً كتابياً مسبقاً. للحصول على إذن، يرجى التواصل معنا عبر صفحة 'اتصل بنا'.",
  },
  {
    id: "rights-2",
    category: "حقوق النشر",
    question: "كيف يمكنني الإبلاغ عن انتهاك لحقوق النشر؟",
    answer:
      "إذا اعتقدت أن محتوى منشور على منصتنا ينتهك حقوق النشر الخاصة بك، يرجى إبلاغنا عبر صفحة 'اتصل بنا' مع تقديم تفاصيل المحتوى المخالف وإثبات ملكيتك للحقوق. سنقوم بمراجعة البلاغ واتخاذ الإجراء المناسب في أقرب وقت ممكن.",
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Get unique categories
  const categories = Array.from(new Set(faqItems.map((item) => item.category)))

  // Filter FAQ items based on search query and active category
  const filteredFAQs = faqItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = activeCategory === null || item.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden max-w-4xl mx-auto">
          <CardHeader className="bg-vintage-paper-dark/10 border-b border-vintage-border">
            <CardTitle className="text-2xl md:text-3xl text-center">الأسئلة الشائعة</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في الأسئلة الشائعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 border-vintage-border focus-visible:ring-vintage-accent"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={activeCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(null)}
                className={
                  activeCategory === null
                    ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                    : "border-vintage-border"
                }
              >
                الكل
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className={
                    activeCategory === category
                      ? "bg-vintage-accent hover:bg-vintage-accent/90 text-white"
                      : "border-vintage-border"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* FAQ Accordion */}
            {filteredFAQs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border-vintage-border">
                    <AccordionTrigger className="text-right hover:text-vintage-accent">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 bg-vintage-paper-dark/5 rounded-md">
                <p className="text-muted-foreground">لم يتم العثور على نتائج مطابقة لبحثك.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory(null)
                  }}
                  className="text-vintage-accent mt-2"
                >
                  مسح البحث
                </Button>
              </div>
            )}

            {/* Contact section */}
            <div className="mt-8 p-4 bg-vintage-paper-dark/5 rounded-md text-center">
              <p className="mb-2">لم تجد إجابة لسؤالك؟</p>
              <Button asChild className="bg-vintage-accent hover:bg-vintage-accent/90 text-white">
                <a href="/contact">تواصل معنا</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
