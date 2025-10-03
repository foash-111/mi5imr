"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Youtube, Mail, Phone } from "lucide-react"
import { FaXTwitter } from 'react-icons/fa6';
import { FaReddit } from 'react-icons/fa';
import { DynamicFooter } from "./DynamicFooter"

interface SocialLinks {
  facebook?: string
  twitter?: string
  youtube?: string
  reddit?: string
}

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({})

  // Fetch social links from settings
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setSocialLinks(data.socialLinks || {})
        }
      } catch (error) {
        console.error("Failed to fetch social links:", error)
      }
    }

    fetchSocialLinks()
  }, [])

  return (
    <footer className="bg-vintage-paper-dark/10 border-t border-vintage-border">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8 items-start">
          <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-4">مخيمر</h3>
            <p className="text-sm text-muted-foreground mb-4">
              منصة للقصص والحكايات والتأملات، حيث تجتمع الكلمات لتنسج عالماً من الخيال والمعرفة
            </p>
            <div className="flex items-center gap-2">
              <a
                href={socialLinks.facebook || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-vintage-ink hover:text-vintage-accent"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">فيسبوك</span>
              </a>
              <a
                href={socialLinks.twitter || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-vintage-ink hover:text-vintage-accent"
              >
                <FaXTwitter className="h-5 w-5" />
                <span className="sr-only">تويتر</span>
              </a>
              <a
                href={socialLinks.youtube || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-vintage-ink hover:text-vintage-accent"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">يوتيوب</span>
              </a>
              <a
                href={socialLinks.reddit || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-vintage-ink hover:text-vintage-accent"
              >
                <FaReddit className="h-5 w-5" />
                <span className="sr-only">ريديت</span>
              </a>
            </div>
          </div>
          
          <div className="md:col-span-2 lg:col-span-2 flex flex-col items-center md:items-start">
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
            </ul>
          </div>

          {/* Policies Section */}
          <div className="md:col-span-2 lg:col-span-1 flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-4">السياسات</h3>
            <ul className="space-y-2 text-sm">
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
          
        </div>
    {/* Footer */}
    <DynamicFooter />
    </div>
    </footer>
  )
}
