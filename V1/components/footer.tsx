import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Facebook, Youtube, Twitter, Instagram, BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-vintage-border bg-vintage-paper-dark/5 py-8 md:py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="md:w-1/3">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-vintage-accent" />
              <span className="text-xl font-bold">مخيمر</span>
            </Link>
            <p className="text-muted-foreground mb-6">
              منصة للقصص والحكايات والتأملات، حيث تجتمع الكلمات لتنسج عالماً من الخيال والمعرفة
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-vintage-border hover:bg-vintage-paper-dark/10"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">فيسبوك</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-vintage-border hover:bg-vintage-paper-dark/10"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">تويتر</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-vintage-border hover:bg-vintage-paper-dark/10"
              >
                <Youtube className="h-4 w-4" />
                <span className="sr-only">يوتيوب</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-vintage-border hover:bg-vintage-paper-dark/10"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">انستغرام</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-4">المحتوى</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/articles" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    مقالات
                  </Link>
                </li>
                <li>
                  <Link href="/stories" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    حواديت
                  </Link>
                </li>
                <li>
                  <Link href="/poetry" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    شعر
                  </Link>
                </li>
                <li>
                  <Link href="/cinema" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    سينما
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reflections"
                    className="text-muted-foreground hover:text-vintage-accent transition-colors"
                  >
                    تأملات
                  </Link>
                </li>
                <li>
                  <Link href="/podcasts" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    بودكاست
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">روابط</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    عن الكاتب
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    اتصل بنا
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    أرسل رأيك
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    الأسئلة الشائعة
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">قانوني</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    شروط الاستخدام
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link href="/copyright" className="text-muted-foreground hover:text-vintage-accent transition-colors">
                    حقوق النشر
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-vintage-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} مخيمر. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
