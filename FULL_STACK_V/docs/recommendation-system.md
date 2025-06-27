# Recommendation System Documentation

## Overview

The recommendation system provides intelligent content suggestions based on multiple factors to help users discover relevant content. It uses a sophisticated scoring algorithm that prioritizes different types of relationships between content.

## How It Works

### Scoring Algorithm

The system calculates a relevance score for each potential recommendation using the following weighted factors:

1. **Category Match** (Weight: 10 points per matching category)
   - Highest priority: Content with the same categories gets the highest score
   - Multiple category matches are additive

2. **Content Type Match** (Weight: 8 points)
   - High priority: Content of the same type (articles, stories, poetry, etc.)
   - Helps users find similar content formats

3. **Tag Overlap** (Weight: 3 points per matching tag)
   - Medium priority: Content with similar tags
   - Multiple tag matches are additive

4. **Same Author** (Weight: 5 points)
   - Medium priority: Content from the same author
   - Helps users discover more content from authors they like

5. **Popularity Boost** (Weight: 0.1 per like, 0.05 per view)
   - Low priority: Popular content gets a small boost
   - Helps surface high-quality content

6. **Recency Boost** (Weight: -0.01 per day since creation)
   - Very low priority: Newer content gets a small boost
   - Ensures fresh content is also recommended

### Example Scoring

For a poetry piece about "love" in the "romance" category:

- Another romance poetry piece: 18 points (10 for category + 8 for content type)
- A romance story: 10 points (10 for category only)
- A love-themed article: 3 points (3 for tag match)
- Another poetry piece by same author: 13 points (8 for content type + 5 for author)
- A popular romance story: 10.5 points (10 for category + 0.5 for popularity)

## API Endpoints

### Get Related Content

```
GET /api/related-content?contentId=123&limit=6
```

**Parameters:**
- `contentId` (required): The ID of the source content
- `limit` (optional): Number of recommendations to return (default: 6)

**Response:**
```json
[
  {
    "_id": "content_id",
    "title": "Content Title",
    "slug": "content-slug",
    "contentType": { "name": "poetry", "label": "شعر" },
    "categories": [{ "name": "romance", "label": "رومانسي" }],
    "tags": ["حب", "رومانسي"],
    "author": { "name": "Author Name" },
    "score": 18.5,
    "likesCount": 25,
    "commentsCount": 8,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Components

### RelatedContent Component

A sidebar component that shows related content in a compact list format.

```tsx
<RelatedContent slug="content-slug" contentId="content-id" />
```

**Features:**
- Shows relevance badges (عالية جداً, عالية, متوسطة, etc.)
- Displays category and content type badges
- Compact layout for sidebar placement

### YouMightAlsoLike Component

A full-width component that shows related content in a grid layout.

```tsx
<YouMightAlsoLike 
  contentId="content-id" 
  currentSlug="content-slug" 
  limit={6} 
/>
```

**Features:**
- Grid layout with cover images
- Detailed relevance scoring display
- Engagement metrics (likes, comments)
- Hover effects and animations

## Database Function

### getRelatedContent()

```typescript
export async function getRelatedContent(
  contentId: string,
  limit: number = 6
): Promise<Content[]>
```

**Implementation Details:**
- Uses MongoDB aggregation pipeline for efficient scoring
- Excludes the source content from results
- Only returns published content
- Sorts by relevance score (descending)
- Includes debugging logs for development

## Usage Examples

### Basic Usage

```tsx
import { getRelatedContent } from "@/lib/api-client"

const relatedContent = await getRelatedContent("content-id", 6)
```

### In Content Page

```tsx
// Sidebar recommendations
<RelatedContent slug={slug} contentId={contentId} />

// Bottom recommendations
<YouMightAlsoLike contentId={contentId} currentSlug={slug} />
```

## Customization

### Adjusting Weights

To modify the recommendation algorithm, edit the weights in `backend/lib/db.ts`:

```typescript
// Category match weight
$multiply: [categoryMatches, 10]

// Content type match weight
$cond: { if: sameType, then: 8, else: 0 }

// Tag overlap weight
$multiply: [tagMatches, 3]

// Author match weight
$cond: { if: sameAuthor, then: 5, else: 0 }

// Popularity weights
$multiply: ["$likesCount", 0.1]
$multiply: ["$viewCount", 0.05]
```

### Adding New Factors

To add new recommendation factors:

1. Add the factor to the aggregation pipeline in `getRelatedContent()`
2. Update the scoring logic
3. Test with different content types
4. Adjust weights based on desired behavior

## Performance Considerations

- The aggregation pipeline is optimized for performance
- Results are limited to prevent excessive data transfer
- Consider caching for frequently accessed content
- Monitor query performance with large datasets

## Future Enhancements

Potential improvements to consider:

1. **User Behavior Tracking**: Use user interaction data to improve recommendations
2. **Machine Learning**: Implement ML-based recommendations
3. **Collaborative Filtering**: Recommend content based on similar users' preferences
4. **Content Embeddings**: Use semantic similarity for better matching
5. **A/B Testing**: Test different recommendation algorithms
6. **Personalization**: Customize recommendations based on user preferences 