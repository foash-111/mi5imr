"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AuthDebug() {
  const { data: session, status } = useSession()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-white/90 backdrop-blur-sm border-2 border-dashed border-gray-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🔍 Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <Badge variant={status === "authenticated" ? "default" : status === "loading" ? "secondary" : "destructive"}>
            {status}
          </Badge>
        </div>
        
        {session?.user && (
          <div className="space-y-1">
            <div><strong>User:</strong> {session.user.name}</div>
            <div><strong>Email:</strong> {session.user.email}</div>
            <div><strong>Admin:</strong> {session.user.isAdmin ? "Yes" : "No"}</div>
            <div><strong>ID:</strong> {session.user.id?.slice(0, 8)}...</div>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
} 