"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bug, Database, Server, User, RefreshCw } from "lucide-react"

interface DebugInfo {
  database: {
    connected: boolean
    collections: string[]
    contentCount: number
    userCount: number
  }
  session: {
    authenticated: boolean
    user?: {
      name: string
      email: string
      isAdmin: boolean
    }
  }
  environment: {
    nodeEnv: string
    mongoUri: string
    nextAuthUrl: string
  }
}

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const fetchDebugInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/debug")
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
      }
    } catch (error) {
      console.error("Failed to fetch debug info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isVisible) {
      fetchDebugInfo()
    }
  }, [isVisible])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
          size="sm"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="border-red-200 bg-red-50/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-red-800">
              <Bug className="h-5 w-5" />
              Debug Panel
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDebugInfo}
                disabled={isLoading}
                className="border-red-300"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsVisible(false)} className="border-red-300">
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {debugInfo ? (
            <>
              {/* Database Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">Database</span>
                  <Badge
                    className={debugInfo.database.connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {debugInfo.database.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="text-sm space-y-1 ml-6">
                  <div>Content: {debugInfo.database.contentCount}</div>
                  <div>Users: {debugInfo.database.userCount}</div>
                  <div>Collections: {debugInfo.database.collections.length}</div>
                </div>
              </div>

              {/* Session Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Session</span>
                  <Badge
                    className={
                      debugInfo.session.authenticated ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }
                  >
                    {debugInfo.session.authenticated ? "Authenticated" : "Not Authenticated"}
                  </Badge>
                </div>
                {debugInfo.session.user && (
                  <div className="text-sm space-y-1 ml-6">
                    <div>Name: {debugInfo.session.user.name}</div>
                    <div>Email: {debugInfo.session.user.email}</div>
                    <div>Admin: {debugInfo.session.user.isAdmin ? "Yes" : "No"}</div>
                  </div>
                )}
              </div>

              {/* Environment */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4" />
                  <span className="font-medium">Environment</span>
                </div>
                <div className="text-sm space-y-1 ml-6">
                  <div>NODE_ENV: {debugInfo.environment.nodeEnv}</div>
                  <div>MongoDB: {debugInfo.environment.mongoUri ? "Configured" : "Missing"}</div>
                  <div>NextAuth: {debugInfo.environment.nextAuthUrl ? "Configured" : "Missing"}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-gray-600">
                {isLoading ? "Loading debug info..." : "Click refresh to load debug info"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
