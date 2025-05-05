"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, ExternalLink } from "lucide-react"

interface PDFViewerProps {
  url: string
  title: string
}

export function PDFViewer({ url, title }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    // Simulate loading PDF
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTotalPages(Math.floor(Math.random() * 20) + 5) // Random page count for demo
    }, 1500)

    return () => clearTimeout(timer)
  }, [url])

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(zoom + 25)
    }
  }

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(zoom - 25)
    }
  }

  return (
    <Card className="border-vintage-border  backdrop-blur-sm overflow-hidden">
      <div className="bg-vintage-paper-dark/10 p-4 border-b border-vintage-border flex items-center justify-between">
        <h2 className="font-bold truncate">{title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-vintage-border" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 ml-1" />
              فتح
            </a>
          </Button>
          <Button variant="outline" size="sm" className="border-vintage-border" asChild>
            <a href={url} download>
              <Download className="h-4 w-4 ml-1" />
              تحميل
            </a>
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="relative min-h-[500px] bg-vintage-paper-dark/5 flex items-center justify-center">
          {isLoading ? (
            <div className="w-full max-w-2xl mx-auto p-8">
              <Skeleton className="h-[600px] w-full rounded-md" />
            </div>
          ) : (
            <iframe
              src={`${url}#page=${currentPage}&zoom=${zoom}`}
              className="w-full h-[600px] border-0"
              title={title}
            />
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-vintage-border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="border-vintage-border"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">السابق</span>
            </Button>

            <span className="text-sm">
              صفحة <span className="font-medium">{currentPage}</span> من{" "}
              <span className="font-medium">{totalPages}</span>
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="border-vintage-border"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">التالي</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50 || isLoading}
              className="border-vintage-border"
            >
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">تصغير</span>
            </Button>

            <span className="text-sm font-medium w-16 text-center">{zoom}%</span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200 || isLoading}
              className="border-vintage-border"
            >
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">تكبير</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
