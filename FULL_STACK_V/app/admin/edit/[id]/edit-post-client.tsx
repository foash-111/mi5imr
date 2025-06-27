"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { PostForm } from "@/components/post-form"

interface EditPostClientProps {
  initialData: any
}

export function EditPostClient({ initialData }: EditPostClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Check if user is authenticated and admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated" && !session?.user?.isAdmin) {
      router.push("/")
      toast({
        title: "غير مصرح",
        description: "يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة",
        variant: "destructive",
      })
    }
  }, [status, session, router, toast])

  // If user not authorized, don't render the form
  if (status !== "authenticated" || !session?.user?.isAdmin) {
    return null
  }

  return <PostForm mode="edit" initialData={initialData} />
} 