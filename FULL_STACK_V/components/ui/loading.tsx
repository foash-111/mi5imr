import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  variant?: "page" | "content" | "inline" | "skeleton"
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function Loading({ 
  variant = "page", 
  size = "md", 
  text = "جاري التحميل...",
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-32 w-32"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  if (variant === "page") {
    return (
      <div className={cn("flex items-center justify-center min-h-screen", className)}>
        <div className="text-center">
          <Loader2 className={cn("animate-spin border-b-2 border-vintage-accent mx-auto mb-4", sizeClasses[size])} />
          <p className={cn("text-muted-foreground", textSizes[size])}>{text}</p>
        </div>
      </div>
    )
  }

  if (variant === "content") {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center">
          <Loader2 className={cn("animate-spin border-b-2 border-vintage-accent mx-auto mb-2", sizeClasses[size])} />
          <p className={cn("text-muted-foreground", textSizes[size])}>{text}</p>
        </div>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
        <span className={cn("text-muted-foreground", textSizes[size])}>{text}</span>
      </div>
    )
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return null
}

// Skeleton components for different content types
export function ContentSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-vintage-border rounded-lg p-6 animate-pulse">
          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="border border-vintage-border rounded-lg p-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 space-x-reverse animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        </div>
      ))}
    </div>
  )
} 