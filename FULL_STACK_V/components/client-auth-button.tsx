'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function ClientAuthButton() {
  const { data: session, status } = useSession()
  const user = session?.user

  if (status === "loading") {
    return <div className="h-12 w-48 bg-vintage-paper-dark/10 animate-pulse rounded-md" />
  }

  if (!user || !user.email) {
    return (
      <Link href="/auth/login">
        <Button size="lg" className="bg-vintage-accent hover:bg-vintage-accent/90 text-white w-full sm:w-auto">
          تسجيل الدخول بحساب جوجل
        </Button>
      </Link>
    )
  }

  return null
}