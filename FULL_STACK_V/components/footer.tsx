import Link from "next/link"
import { Facebook, Twitter, Youtube, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-vintage-paper-dark/10 border-t border-vintage-border">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">مخيمر</h3>
            <p className="text-sm text-muted-foreground mb-4">
              منصة للقصص والحكايات والتأملات، حيث تجتمع الكلمات لتنسج عالماً من الخيال والمعرفة
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-vintage-ink hover:text-vintage-accent"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">فيسبوك</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-vintage-ink hover:text-vintage-accent"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">تويتر</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-vintage-ink hover:text-vintage-accent"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">يوتيوب</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">روابط مفيدة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-vintage-accent">
                  عن الكاتب
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-vintage-accent">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-vintage-accent">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-vintage-accent">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-vintage-accent">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="text-muted-foreground hover:text-vintage-accent">
                  حقوق النشر
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">اتصل بنا</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@mukhaimer.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1234567890</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-vintage-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} مخيمر. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
