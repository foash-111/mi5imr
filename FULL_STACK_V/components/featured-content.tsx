"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Music, Video, Coffee, Loader2, FileText, Mic } from "lucide-react"
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
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const currentIndexRef = useRef(0);
  const [itemsPerView, setItemsPerView] = useState(3); // Default for desktop

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 items
      } else {
        setItemsPerView(3); // Desktop: 3 items
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

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
        const {content} = await getContent(options);
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

	// Auto-scroll effect
  useEffect(() => {
    if (featuredContent.length > 0 && scrollRef.current) {
      const scrollContainer = scrollRef.current;
      
      // Wait a bit for the DOM to be ready
      const timeoutId = setTimeout(() => {
        console.log('Starting auto-scroll with', featuredContent.length, 'items, showing', itemsPerView, 'per view');
        
        const interval = setInterval(() => {
          if (scrollContainer && !isPaused) {
            const items = scrollContainer.children;
            if (items.length > 0) {
              // Get the current item width and gap
              const firstItem = items[0] as HTMLElement;
              const itemWidth = firstItem.offsetWidth;
              const gap = 24; // gap-6 = 24px
              const scrollAmount = itemWidth + gap;
              
              // Calculate next position - move by itemsPerView at a time
              const nextScrollLeft = currentIndexRef.current * scrollAmount * itemsPerView;
              
              // Check if we've reached the end (when we can't show itemsPerView more items)
              const totalItems = featuredContent.length;
              const currentGroup = Math.floor(currentIndexRef.current / itemsPerView);
              const remainingItems = totalItems - (currentGroup * itemsPerView);
              
              if (remainingItems <= 0) {
                // Reset to beginning
                currentIndexRef.current = 0;
                scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
                console.log('Reset to beginning');
              } else {
                // Move to next group of itemsPerView items
                currentIndexRef.current += itemsPerView;
                scrollContainer.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
                console.log('Auto-scrolling to group:', Math.floor(currentIndexRef.current / itemsPerView), 'position:', nextScrollLeft);
              }
            }
          }
        }, 3000); // Scroll every 3 seconds

        return () => clearInterval(interval);
      }, 1000); // Wait 1 second for DOM to be ready

      return () => clearTimeout(timeoutId);
    }
  }, [featuredContent, isPaused, itemsPerView]);

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
  if (featuredContent.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لا يوجد محتوى مميز متاح حالياً</p>
      </div>
    );
  }

return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Auto-scroll indicator */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} 
             title={isPaused ? 'Auto-scroll paused' : 'Auto-scroll active'} />
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Group items into sets based on itemsPerView */}
        {Array.from({ length: Math.ceil(featuredContent.length / itemsPerView) }, (_, groupIndex) => {
          const startIndex = groupIndex * itemsPerView;
          const groupItems = featuredContent.slice(startIndex, startIndex + itemsPerView);
          
          return (
            <div key={`group-${groupIndex}`} className="flex gap-6 flex-shrink-0">
              {groupItems.map((item) => {
                const ItemIcon = getIconForType(item.contentType?.label || "");
                return (
                  <div
                    key={item._id?.toString()}
                    className="w-80 md:w-96 lg:w-[420px]"
                  >
                    <Link href={`/content/${item.slug}`}>
                      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md border-vintage-border backdrop-blur-sm hover:scale-105">
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
              
              {/* Fill empty slots if group has fewer than itemsPerView items */}
              {Array.from({ length: itemsPerView - groupItems.length }, (_, index) => (
                <div
                  key={`empty-${groupIndex}-${index}`}
                  className="w-80 md:w-96 lg:w-[420px]"
                >
                  {/* Empty slot - just takes up space */}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
