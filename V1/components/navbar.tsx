"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Menu, X, Moon, Sun, Facebook, Youtube, Twitter } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // or return a skeleton/icon placeholder

  return (
    <header className="sticky top-0 z-50 w-full border-b border-vintage-border bg-vintage-paper/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">القائمة</span>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-vintage-accent" />
            <span className="text-xl font-bold">مخيمر</span>
          </Link>
        </div>

        <nav
          className={`${isOpen ? "flex" : "hidden"} md:flex absolute md:static top-16 right-0 left-0 flex-col md:flex-row items-start md:items-center gap-4 p-4 md:p-0 bg-vintage-paper md:bg-transparent border-b md:border-0 border-vintage-border`}
        >
          <Link href="/feed" className="text-sm font-medium hover:text-vintage-accent transition-colors">
            المحتويات
          </Link>
          <Link href="/articles" className="text-sm font-medium hover:text-vintage-accent transition-colors">
            مقالات
          </Link>
          <Link href="/stories" className="text-sm font-medium hover:text-vintage-accent transition-colors">
            حواديت
          </Link>
          <Link href="/poetry" className="text-sm font-medium hover:text-vintage-accent transition-colors">
            شعر
          </Link>
          <Link href="/reflections" className="text-sm font-medium hover:text-vintage-accent transition-colors">
            تأملات
          </Link>
          <Link href="/#about" className="text-sm font-medium hover:text-vintage-accent transition-colors">
            عن الكاتب
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-vintage-ink hover:text-vintage-accent"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">تبديل المظهر</span>
          </Button>
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
              <Facebook className="h-4 w-4" />
              <span className="sr-only">فيسبوك</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">تويتر</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-vintage-ink hover:text-vintage-accent">
              <Youtube className="h-4 w-4" />
              <span className="sr-only">يوتيوب</span>
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex border-vintage-accent text-vintage-accent hover:bg-vintage-accent/10"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    </header>
  )
}
