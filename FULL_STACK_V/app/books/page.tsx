import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, BookText, Coffee } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock books data
const books = [
  {
    id: 1,
    title: "رحلة في عالم الخيال",
    author: "مخيمر",
    cover: "/placeholder.svg?height=400&width=250",
    description: "مجموعة قصصية تأخذك في رحلة إلى عوالم الخيال والإبداع، حيث تتلاشى الحدود بين الواقع والخيال.",
    category: "قصص",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    publishDate: "٢٠٢٣",
  },
  {
    id: 2,
    title: "تأملات في الحياة",
    author: "مخيمر",
    cover: "/placeholder.svg?height=400&width=250",
    description: "كتاب يجمع تأملات وأفكار حول الحياة والوجود، يدعوك للتفكير في معنى الحياة وجوهر الوجود الإنساني.",
    category: "فلسفة",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    publishDate: "٢٠٢٢",
  },
  {
    id: 3,
    title: "ديوان الصباح",
    author: "مخيمر",
    cover: "/placeholder.svg?height=400&width=250",
    description: "ديوان شعري يحتفي بجمال الصباح وبداية يوم جديد، مع قصائد تتناول الأمل والتفاؤل والبدايات الجديدة.",
    category: "شعر",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    publishDate: "٢٠٢١",
  },
]

export default function BooksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
      </Suspense>
      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">مكتبة مخيمر</h1>
            <p className="text-muted-foreground">استكشف مجموعة من الكتب والمؤلفات المتنوعة</p>
          </div>

          <Tabs defaultValue="all" className="w-full mb-8">
            <TabsList className="w-full bg-vintage-paper-dark/10 p-0 h-auto">
              <TabsTrigger
                value="all"
                className="flex-1 py-3 data-[state=active]:  data-[state=active]:shadow-sm rounded-none"
              >
                <BookOpen className="h-4 w-4 ml-2" />
                جميع الكتب
              </TabsTrigger>
              <TabsTrigger
                value="stories"
                className="flex-1 py-3 data-[state=active]:  data-[state=active]:shadow-sm rounded-none"
              >
                <BookText className="h-4 w-4 ml-2" />
                قصص
              </TabsTrigger>
              <TabsTrigger
                value="philosophy"
                className="flex-1 py-3 data-[state=active]:  data-[state=active]:shadow-sm rounded-none"
              >
                <Coffee className="h-4 w-4 ml-2" />
                فلسفة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {books.map((book) => (
                  <Card key={book.id} className="border-vintage-border  backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative h-64 md:h-auto md:w-1/3 bg-vintage-paper-dark/10">
                          <Image
                            src={book.cover || "/placeholder.svg"}
                            alt={book.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4 md:w-2/3">
                          <h3 className="text-xl font-bold mb-1">{book.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {book.author} • {book.publishDate}
                          </p>
                          <p className="text-sm mb-4 line-clamp-3">{book.description}</p>
                          <Link href={`/books/${book.id}`}>
                            <Button className="bg-vintage-accent hover:bg-vintage-accent/90 text-white w-full">
                              قراءة الكتاب
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stories" className="mt-6" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {books
                  .filter((book) => book.category === "قصص")
                  .map((book) => (
                    <Card key={book.id} className="border-vintage-border  backdrop-blur-sm overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative h-64 md:h-auto md:w-1/3 bg-vintage-paper-dark/10">
                            <Image
                              src={book.cover || "/placeholder.svg"}
                              alt={book.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4 md:w-2/3">
                            <h3 className="text-xl font-bold mb-1">{book.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {book.author} • {book.publishDate}
                            </p>
                            <p className="text-sm mb-4 line-clamp-3">{book.description}</p>
                            <Link href={`/books/${book.id}`}>
                              <Button className="bg-vintage-accent hover:bg-vintage-accent/90 text-white w-full">
                                قراءة الكتاب
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="philosophy" className="mt-6" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {books
                  .filter((book) => book.category === "فلسفة")
                  .map((book) => (
                    <Card key={book.id} className="border-vintage-border  backdrop-blur-sm overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative h-64 md:h-auto md:w-1/3 bg-vintage-paper-dark/10">
                            <Image
                              src={book.cover || "/placeholder.svg"}
                              alt={book.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4 md:w-2/3">
                            <h3 className="text-xl font-bold mb-1">{book.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {book.author} • {book.publishDate}
                            </p>
                            <p className="text-sm mb-4 line-clamp-3">{book.description}</p>
                            <Link href={`/books/${book.id}`}>
                              <Button className="bg-vintage-accent hover:bg-vintage-accent/90 text-white w-full">
                                قراءة الكتاب
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
