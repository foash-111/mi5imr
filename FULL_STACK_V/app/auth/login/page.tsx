"use client"

import { useState, useEffect, Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { signIn, useSession } from "next-auth/react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("User already authenticated, redirecting to feed");
      router.push("/feed");
    }
  }, [session, status, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
        </Suspense>
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vintage-accent mx-auto mb-4"></div>
            <p>جاري التحقق من حالة تسجيل الدخول...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (status === "authenticated") {
    return null;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      console.log("Starting Google login...");
      
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.warn("Google Client ID not found in environment variables");
      }
      
      // Initiate Google Sign-In with proper error handling
      const result = await signIn("google", { 
        callbackUrl: "/feed",
        redirect: false 
      });
      
      console.log("SignIn result:", result);
      
      if (result?.error) {
        console.error("Google login error:", result.error);
        toast({
          title: "خطأ في تسجيل الدخول",
          description: `حدث خطأ أثناء تسجيل الدخول: ${result.error}`,
          variant: "destructive",
        });
      } else if (result?.ok) {
        console.log("Google login successful");
        toast({
          title: "تم تسجيل الدخول",
          description: "تم تسجيل دخولك بنجاح باستخدام حساب جوجل",
        });
        // Don't redirect here, let the useEffect handle it
      } else if (result?.url) {
        // This means NextAuth is redirecting, which is normal
        console.log("NextAuth redirecting to:", result.url);
        // Don't show error, this is expected behavior
      } else {
        console.log("No result from signIn - this might be normal for existing sessions");
        // Don't show error for this case as it might be a successful login
      }
    } catch (error) {
      console.error("Google login exception:", error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء تسجيل الدخول باستخدام جوجل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGuestAccess = () => {
    setIsGuestLoading(true)
    // Simulate loading
    setTimeout(() => {
      setIsGuestLoading(false)
			localStorage.setItem("isGuest", "true")
      toast({
        title: "تم الدخول كزائر",
        description: "يمكنك الآن تصفح المحتوى، لكن بعض الميزات قد تكون محدودة",
      })
      router.push("/feed")
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-vintage-paper text-vintage-ink">
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
      </Suspense>
      <main className="flex-1 container py-12 flex items-center justify-center">
        <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-vintage-accent/10 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-vintage-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl">مرحباً بك في منصة مخيمر</CardTitle>
            <CardDescription>سجل الدخول للتفاعل مع المحتوى والتعليق ومشاركة أفكارك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <Button
                onClick={handleGoogleLogin}
                className="  border border-gray-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  "جاري التسجيل..."
                ) : (
                  <>
                    <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    تسجيل الدخول بحساب جوجل
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-vintage-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="  px-2 text-muted-foreground">أو</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleGuestAccess}
                className="border-vintage-border hover:bg-vintage-paper-dark/10"
                disabled={isGuestLoading}
              >
                {isGuestLoading ? (
                  "جاري الدخول..."
                ) : (
                  <>
                    <LogIn className="ml-2 h-4 w-4" />
                    الدخول كزائر
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                بتسجيل الدخول، أنت توافق على{" "}
                <Link href="/terms" className="text-vintage-accent hover:underline">
                  شروط الاستخدام
                </Link>{" "}
                و{" "}
                <Link href="/privacy" className="text-vintage-accent hover:underline">
                  سياسة الخصوصية
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
