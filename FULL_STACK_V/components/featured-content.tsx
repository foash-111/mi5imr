"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft, BookOpen, Music, Video, Coffee, Loader2, FileText, Mic } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getContent } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Content }from "@/backend/models/types"


// Map content types to icons
const contentTypeIcons = {
  articles: FileText,
  stories: BookOpen,
  poetry: Music,
  cinema: Video,
  reflections: Coffee,
  podcasts: Mic,
};

export function FeaturedContent() {
	const [featuredContent, setFeaturedContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0)
  const maxVisibleItems = 3
  const containerRef = useRef<HTMLDivElement>(null)

		// Helper function to get the icon component
		const getIconComponent = (iconName: string) => {
			switch (iconName) {
				case "FileText":
					return <FileText className="h-4 w-4" />
				case "BookOpen":
					return <BookOpen className="h-4 w-4" />
				case "Music":
					return <Music className="h-4 w-4" />
				case "Video":
					return <Video className="h-4 w-4" />
				case "Coffee":
					return <Coffee className="h-4 w-4" />
				case "Mic":
					return <Mic className="h-4 w-4" />
				case "Drama":
					return <div className="h-4 w-4 flex items-center justify-center">د</div>
				case "Smile":
					return <div className="h-4 w-4 flex items-center justify-center">ك</div>
				case "Brain":
					return <div className="h-4 w-4 flex items-center justify-center">ت</div>
				default:
					return <FileText className="h-4 w-4" />
			}
		}

	// Fetch featured content from the database
  useEffect(() => {
    async function fetchFeaturedContent() {
      try {
        setIsLoading(true);
        setError(null);
        const options = {
          featured: true,
          published: true,
          limit: 10, // Fetch enough items for the carousel
          sortBy: "newest" as const,
        };
        console.log("Fetching featured content with options:", options);
        const content = await getContent(options);
        console.log("Fetched featured content:", content);
        setFeaturedContent(content);
      } catch (err) {
        console.error("Failed to fetch featured content:", err);
        setError("فشل في تحميل المحتوى المميز");
        toast({
          title: "خطأ",
          description: "تعذر تحميل المحتوى المميز",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedContent();
  }, [toast]);

	const totalItems = featuredContent.length;


	// Auto-scroll effect
  useEffect(() => {
    if (totalItems > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1 >= totalItems ? 0 : prevIndex + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [totalItems]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 >= totalItems ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? totalItems - 1 : prevIndex - 1));
  };

	// Get visible items based on current index
  const getVisibleItems = () => {
    if (totalItems === 0) return [];
    const items = [];
    for (let i = 0; i < maxVisibleItems; i++) {
      const index = (currentIndex + i) % totalItems;
      items.push(featuredContent[index]);
    }
    return items;
  };

  // Get icon for content type
  const getIconForType = (typeName: string) => {
    return contentTypeIcons[typeName as keyof typeof contentTypeIcons] || FileText;
  };


		// Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-vintage-accent" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

	// Empty state
  if (totalItems === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لا يوجد محتوى مميز متاح حالياً</p>
      </div>
    );
  }

return (
    <div className="relative overflow-hidden">
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="border-vintage-border hover:bg-vintage-paper-dark/10 z-10"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">السابق</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="border-vintage-border hover:bg-vintage-paper-dark/10 z-10"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">التالي</span>
        </Button>
      </div>
      <div
        ref={containerRef}
        className="relative grid grid-cols-1 md:grid-cols-3 gap-6 transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${(currentIndex % maxVisibleItems) * (100 / maxVisibleItems)}%)` }}
      >
        {featuredContent.map((item, index) => {
          const ItemIcon = getIconForType(item.contentType?.label || "");
          return (
            <div
              key={item._id?.toString()}
              className={`w-full ${index >= currentIndex && index < currentIndex + maxVisibleItems ? "block" : "hidden"} md:block`}
            >
              <Link href={`/content/${item.slug}`}>
                <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md border-vintage-border backdrop-blur-sm">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.coverImage || "/placeholder.svg?height=400&width=600"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-vintage-accent/90 hover:bg-vintage-accent text-white">
                        <ItemIcon className="h-3 w-3 mr-1" />
                        {item.contentType?.label || "غير محدد"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-EG") : "غير محدد"}
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-muted-foreground line-clamp-3">{item.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
