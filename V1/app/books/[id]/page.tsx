import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PDFViewer } from "@/components/pdf-viewer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock books data
const books = [
  {
    id: 1,
    title: "رحلة في عالم الخيال",
    author: "مخيمر",
    cover: "/placeholder.svg?height=400&width=250",
    description:
      "مجموعة قصصية تأخذك في رحلة إلى عوالم الخيال والإبداع، حيث تتلاشى الحدود بين الواقع والخيال. تستكشف هذه القصص مفاهيم الواقع والخيال، وتدعو القارئ للتفكير في الحدود بينهما، وكيف يمكن للخيال أن يكون وسيلة للهروب من الواقع أو لفهمه بشكل أفضل.\n\nتتنوع القصص بين الخيال العلمي والفانتازيا والواقعية السحرية، مما يوفر تجربة قراءة متنوعة وغنية. كل قصة تأخذك إلى عالم مختلف، مع شخصيات فريدة وأحداث مثيرة، لكنها جميعاً تشترك في استكشاف العلاقة بين الواقع والخيال.",
    category: "قصص",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    publishDate: "٢٠٢٣",
    pages: 120,
    language: "العربية",
    isbn: "978-3-16-148410-0",
  },
  {
    id: 2,
    title: "تأملات في الحياة",
    author: "مخيمر",
    cover: "/placeholder.svg?height=400&width=250",
    description:
      "كتاب يجمع تأملات وأفكار حول الحياة والوجود، يدعوك للتفكير في معنى الحياة وجوهر الوجود الإنساني. يتناول الكتاب مواضيع فلسفية متنوعة مثل الوعي، الزمن، الهوية، السعادة، والمعنى، ويقدمها بأسلوب بسيط وعميق في آن واحد.\n\nيتكون الكتاب من فصول قصيرة، كل منها يتناول فكرة أو تساؤلاً فلسفياً، مما يجعله مناسباً للقراءة المتقطعة والتأمل المستمر. الهدف من الكتاب ليس تقديم إجابات نهائية، بل إثارة التساؤلات وتحفيز القارئ على التفكير والتأمل في حياته وعالمه.",
    category: "فلسفة",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    publishDate: "٢٠٢٢",
    pages: 180,
    language: "العربية",
    isbn: "978-3-16-148410-1",
  },
  {
    id: 3,
    title: "ديوان الصباح",
    author: "مخيمر",
    cover: "/placeholder.svg?height=400&width=250",
    description:
      "ديوان شعري يحتفي بجمال الصباح وبداية يوم جديد، مع قصائد تتناول الأمل والتفاؤل والبدايات الجديدة. يضم الديوان مجموعة متنوعة من القصائد التي تتراوح بين الكلاسيكية والحديثة، مع التركيز على موضوعات الصباح والتجدد والأمل.\n\nتتميز القصائد بلغة شعرية سلسة وصور بصرية غنية، تنقل للقارئ إحساس الصباح الباكر بكل تفاصيله: من أشعة الشمس الأولى، إلى قطرات الندى على أوراق الشجر، إلى صوت العصافير المغردة. الديوان دعوة للاحتفاء بكل صباح جديد كفرصة للبدء من جديد والاستمتاع بجمال الحياة.",
    category: "شعر",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    publishDate: "٢٠٢١",
    pages: 90,
    language: "العربية",
    isbn: "978-3-16-148410-2",
  },
]

export default function BookPage({ params }: { params: { id: string } }) {
  const bookId = Number.parseInt(params.id)
  const book = books.find((b) => b.id === bookId)

  if (!book) {
    return (
      <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">الكتاب غير موجود</h2>
            <p>عذراً، لم نتمكن من العثور على الكتاب المطلوب.</p>
            <Link href="/books">
              <Button className="mt-4 bg-vintage-accent hover:bg-vintage-accent/90 text-white">
                العودة إلى المكتبة
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto">
          <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                  <div className="relative aspect-[2/3] shadow-md rounded-md overflow-hidden">
                    <Image src={book.cover || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
                  </div>
                </div>

                <div className="md:w-3/4">
                  <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <User className="h-4 w-4" />
                    <span>{book.author}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{book.publishDate}</span>
                  </div>

                  <Badge className="mb-4 bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                    <BookOpen className="h-3 w-3 ml-1" />
                    {book.category}
                  </Badge>

                  <div className="prose max-w-none mb-6">
                    {book.description.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-vintage-paper-dark/5 p-3 rounded-md text-center">
                      <div className="text-sm text-muted-foreground">عدد الصفحات</div>
                      <div className="font-bold">{book.pages}</div>
                    </div>
                    <div className="bg-vintage-paper-dark/5 p-3 rounded-md text-center">
                      <div className="text-sm text-muted-foreground">اللغة</div>
                      <div className="font-bold">{book.language}</div>
                    </div>
                    <div className="bg-vintage-paper-dark/5 p-3 rounded-md text-center">
                      <div className="text-sm text-muted-foreground">تاريخ النشر</div>
                      <div className="font-bold">{book.publishDate}</div>
                    </div>
                    <div className="bg-vintage-paper-dark/5 p-3 rounded-md text-center">
                      <div className="text-sm text-muted-foreground">الرقم المعياري</div>
                      <div className="font-bold">{book.isbn}</div>
                    </div>
                  </div>

                  <Button className="bg-vintage-accent hover:bg-vintage-accent/90 text-white">تحميل الكتاب</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-4">قراءة الكتاب</h2>
            <PDFViewer url={book.pdfUrl} title={book.title} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
