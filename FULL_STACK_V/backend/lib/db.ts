import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"
import type { User, Content, Comment, ContentType, Category, Subscriber, EmailLog, Notification, Feedback, ContactMessage, Settings } from "../models/types"
import nodemailer from "nodemailer"

// Database and collections names
const DB_NAME = "arabic-storytelling"
export const COLLECTIONS = {
  USERS: "users",
  CONTENT: "content",
  COMMENTS: "comments",
  CONTENT_TYPES: "content_types",
  CATEGORIES: "categories",
  TAGS: "tags",
  CONTENT_LIKES: "content_likes",
  COMMENT_LIKES: "comment_likes",
  BOOKMARKS: "bookmarks",
  SUBSCRIBERS: "subscribers",
  EMAIL_LOGS: "email_logs",
  NOTIFICATIONS: "notifications",
}

// Utility functions to serialize MongoDB objects to plain JavaScript objects
function serializeObjectId(id: any): string {
  if (id instanceof ObjectId) {
    return id.toString()
  }
  if (typeof id === 'string') {
    return id
  }
  if (id && typeof id === 'object' && id.toString) {
    return id.toString()
  }
  return id
}

function serializeDocument(doc: any): any {
  if (!doc || typeof doc !== 'object') {
    return doc
  }
  
  const serialized: any = {}
  
  for (const [key, value] of Object.entries(doc)) {
    if (value instanceof ObjectId) {
      serialized[key] = value.toString()
    } else if (value instanceof Date) {
      serialized[key] = value.toISOString()
    } else if (Array.isArray(value)) {
      serialized[key] = value.map(item => serializeDocument(item))
    } else if (value && typeof value === 'object') {
      serialized[key] = serializeDocument(value)
    } else {
      serialized[key] = value
    }
  }
  
  return serialized
}

function serializeArray<T>(array: T[]): any[] {
  return array.map(item => serializeDocument(item))
}

// Get database connection
export async function getDb() {
  const client = await clientPromise
  return client.db(DB_NAME)
}

// User operations
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb()
  const user = await db.collection<User>(COLLECTIONS.USERS).findOne({ email })
  return user ? serializeDocument(user) : null
}

export async function getAllUsers() {
	const db = await getDb()
  const users = await db.collection<User>(COLLECTIONS.USERS).find().toArray()
  return serializeArray(users)
}


export async function createUser(user: User): Promise<User> {
  const db = await getDb()
  const result = await db.collection<User>(COLLECTIONS.USERS).insertOne(user)
  return serializeDocument({ ...user, _id: result.insertedId })
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb()
  const user = await db.collection<User>(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) })
  return user ? serializeDocument(user) : null
}

// backend/lib/db.ts
export async function deleteUser(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<User>(COLLECTIONS.USERS).deleteOne({ _id: new ObjectId(id) })
	console.log('Delete result:', result);
  return result.deletedCount > 0
}

export async function updateUser(user: Partial<User>): Promise<User> {
	if (!user._id || !ObjectId.isValid(user._id)) {
    throw new Error('Invalid or missing user ID');
  }
	try {
  const db = await getDb()
	console.log("=== BACKEND UPDATE USER DEBUG ===");
	console.log("User data to update:", user);
	console.log("User ID:", user._id);
	
	// Extract _id and create update data without it
	const { _id, ...updateData } = user;
	
  const result = await db.collection<User>(COLLECTIONS.USERS).updateOne({ _id: new ObjectId(_id) }, { $set: updateData })
	console.log("MongoDB update result:", result);
	console.log("Modified count:", result.modifiedCount);
	console.log("Matched count:", result.matchedCount);
	
 // Fetch the updated user to ensure consistency
    const updatedUser = await db.collection<User>(COLLECTIONS.USERS).findOne({ _id: new ObjectId(_id) });
    console.log("Updated user from DB:", updatedUser);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    const serializedUser = serializeDocument(updatedUser);
    console.log("Serialized user:", serializedUser);
    console.log("=== BACKEND UPDATE USER DEBUG END ===");
    return serializedUser;
} catch (error: any) {
    console.error('=== ORIGINAL ERROR IN updateUser ===');
    console.error('Error type:', typeof error);
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
    }
    console.error('=== END ORIGINAL ERROR ===');
    throw new Error(`Failed to update user: ${error.message}`);
  }
}


// Content type operations
// export async function getContentTypes(): Promise<ContentType[]> {
//   const db = await getDb()
//   return db.collection<ContentType>(COLLECTIONS.CONTENT_TYPES).find().sort({ createdAt: 1 }).toArray()
// }
export async function getContentTypes(): Promise<ContentType[]> {
  const db = await getDb();

  // Step 1: Aggregate counts from content collection
  const contentCounts = await db
    .collection(COLLECTIONS.CONTENT)
    .aggregate([
      // Match only published content
      { $match: { published: true } },
      // Group by contentType.label to count documents
      {
        $group: {
          _id: "$contentType.label",
          count: { $sum: 1 },
        },
      },
      // Project to simplify output
      {
        $project: {
          label: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ])
    .toArray();

  // console.log("Content counts:", contentCounts); // Debug: [{ label: "مقالات", count: 2 }, ...]

  // Step 2: Fetch all content types
  const contentTypes = await db
    .collection<ContentType>(COLLECTIONS.CONTENT_TYPES)
    .find()
    .sort({ createdAt: 1 })
    .toArray();

  // Step 3: Merge counts with content types
  const result = contentTypes.map((ct) => ({
    ...ct,
    count: contentCounts.find((c) => c.label === ct.label)?.count || 0,
  }));

  //console.log("Final content types:", result); // Debug
  return serializeArray(result);
}

export async function getContentTypeById(id: string): Promise<ContentType | null> {
  const db = await getDb()
  const contentType = await db.collection<ContentType>(COLLECTIONS.CONTENT_TYPES).findOne({ _id: new ObjectId(id) })
  return contentType ? serializeDocument(contentType) : null
}

export async function createContentType(contentType: Omit<ContentType, "_id">): Promise<ContentType> {
  const db = await getDb()
  const result = await db.collection<ContentType>(COLLECTIONS.CONTENT_TYPES).insertOne({
    ...contentType,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return serializeDocument({ ...contentType, _id: result.insertedId })
}

export async function updateContentType(id: string, contentType: Partial<ContentType>): Promise<boolean> {
  const db = await getDb()
  const result = await db
    .collection(COLLECTIONS.CONTENT_TYPES)
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...contentType, updatedAt: new Date() } })
  return result.modifiedCount > 0
}

export async function deleteContentType(id: string): Promise<boolean> {
  const db = await getDb()

  // Check if there are any content items using this content type
  const contentCount = await db.collection(COLLECTIONS.CONTENT).countDocuments({ "contentType._id": new ObjectId(id) })
  if (contentCount > 0) {
    throw new Error("Cannot delete content type that is being used by existing content")
  }

  // Delete all categories associated with this content type
  await db.collection(COLLECTIONS.CATEGORIES).deleteMany({ contentTypeId: new ObjectId(id) })

  // Delete the content type
  const result = await db.collection(COLLECTIONS.CONTENT_TYPES).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

// Category operations
export async function getCategories(contentTypeId?: string): Promise<Category[]> {
  const db = await getDb()
  let query: any = {}

  if (contentTypeId) {
    query = {
      $or: [{ contentTypeId: new ObjectId(contentTypeId) }, { isDefault: true }],
    }
  }

  const categories = await db.collection<Category>(COLLECTIONS.CATEGORIES).find(query).sort({ createdAt: 1 }).toArray()
  return serializeArray(categories)
}

// Get categories with content counts
export async function getCategoriesWithCounts(contentTypeIds?: string[] | string): Promise<(Category & { count: number })[]> {
  const db = await getDb()
  
  // Step 1: Aggregate counts from content collection
  const categoryCounts = await db
    .collection(COLLECTIONS.CONTENT)
    .aggregate([
      // Match only published content
      { $match: { published: true } },
      // Unwind categories array to get individual categories
      { $unwind: "$categories" },
      // Group by category name to count documents
      {
        $group: {
          _id: "$categories.label",
          count: { $sum: 1 },
        },
      },
      // Project to simplify output
      {
        $project: {
          label: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ])
    .toArray();

  // Step 2: Fetch all categories
  let query: any = {}
  if (contentTypeIds && (Array.isArray(contentTypeIds) ? contentTypeIds.length > 0 : true)) {
    const ids = Array.isArray(contentTypeIds) ? contentTypeIds : [contentTypeIds]
    query = {
      $or: [
        { contentTypeId: { $in: ids.map((id) => new ObjectId(id)) } },
        { isDefault: true }
      ]
    }
  }

  const categories = await db.collection<Category>(COLLECTIONS.CATEGORIES).find(query).sort({ createdAt: 1 }).toArray()

  // Step 3: Merge counts with categories
  const result = categories.map((cat) => ({
    ...cat,
    count: categoryCounts.find((c) => c.label === cat.label)?.count || 0,
  }));

  return serializeArray(result);
}

export async function getDefaultCategories(): Promise<Category[]> {
  const db = await getDb()
  const categories = await db.collection<Category>(COLLECTIONS.CATEGORIES).find({ isDefault: true }).sort({ createdAt: 1 }).toArray()
  return serializeArray(categories)
}

export async function getCategoriesByContentType(contentTypeId: string): Promise<Category[]> {
  const db = await getDb()
  const categories = await db
    .collection<Category>(COLLECTIONS.CATEGORIES)
    .find({ 
      contentTypeId: new ObjectId(contentTypeId), 
      isDefault: false 
    })
    .sort({ createdAt: 1 })
    .toArray()
  return serializeArray(categories)
}

export async function createCategory(category: Omit<Category, "_id">): Promise<Category> {
  const db = await getDb()
  const result = await db.collection<Category>(COLLECTIONS.CATEGORIES).insertOne({
    ...category,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return serializeDocument({ ...category, _id: result.insertedId })
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<boolean> {
  const db = await getDb()
  const result = await db
    .collection(COLLECTIONS.CATEGORIES)
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...category, updatedAt: new Date() } })
  return result.modifiedCount > 0
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.CATEGORIES).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function getAllContent(
  options: {
    published?: boolean
    contentType?: string | string[]
    category?: string
    tag?: string
    featured?: boolean
    sortBy?: "newest" | "popular" | "trending"
    limit?: number
    skip?: number
    createdAt?: { $gte: string }
    search?: string
    userId?: string
  } = {},
): Promise<{ content: Content[], totalCount: number }> {
  const { published, contentType, category, tag, featured, sortBy = "newest", limit = 30, skip = 0, createdAt, search, userId } = options

  const db = await getDb()

  // Build query
  const query: any = {}
  if (published !== undefined) {
    query.published = published
  }

  if (contentType) {
    query["contentType.label"] = Array.isArray(contentType)
      ? { $in: contentType }
      : contentType
  }

  if (category) {
    query["categories.name"] = category
  }

  if (tag) {
    query.tags = tag
  }

  if (featured !== undefined) {
    query.featured = featured
  }

  if (createdAt) {
    query.createdAt = {
      $gte: new Date(createdAt.$gte),
    }
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ]
  }

  // Build sort
  let sort: any = {}
  switch (sortBy) {
    case "popular":
      sort = { likesCount: -1, createdAt: -1 }
      break
    case "trending":
      sort = { viewCount: -1, createdAt: -1 }
      break
    case "newest":
    default:
      sort = { createdAt: -1 }
  }

  console.log("db query", query)

  // Fetch content and total count
  const [contentList, totalCount] = await Promise.all([
    db.collection<Content>(COLLECTIONS.CONTENT)
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection<Content>(COLLECTIONS.CONTENT)
      .countDocuments(query),
  ]);

  // Fetch total comments count for each content item
  const commentsCounts = await Promise.all(
    contentList.map(async (content) => {
      return {
        _id: content._id,
        commentsCount: await getTotalCommentsCount(content._id.toString()),
      }
    })
  )
  const commentsCountMap = Object.fromEntries(commentsCounts.map(c => [c._id.toString(), c.commentsCount]))

  // Ensure all content items have required fields with defaults
  const safeContentList = contentList.map(content => ({
    ...content,
    author: content.author || { name: '—', avatar: '' },
    contentType: content.contentType || { label: '—' },
    commentsCount: commentsCountMap[content._id.toString()] || 0,
  }))

  // If userId is provided, fetch like/save status in bulk
  if (userId) {
    const contentIds = contentList.map(content => new ObjectId(content._id))

    // Fetch all likes for the user and content IDs
    const likes = await db.collection(COLLECTIONS.CONTENT_LIKES)
      .find({ userId: new ObjectId(userId), contentId: { $in: contentIds } })
      .toArray()
    const likedContentIds = new Set(likes.map(like => like.contentId.toString()))

    // Fetch all saves for the user and content IDs
    const saves = await db.collection(COLLECTIONS.BOOKMARKS)
      .find({ userId: new ObjectId(userId), contentId: { $in: contentIds } })
      .toArray()
    const savedContentIds = new Set(saves.map(save => save.contentId.toString()))

    return {
      content: safeContentList.map(content => ({
        ...content,
        isLiked: likedContentIds.has(content._id.toString()),
        isSaved: savedContentIds.has(content._id.toString()),
      })),
      totalCount,
    }
  }

  return {
    content: safeContentList,
    totalCount,
  }
}

export async function getContentById(id: string): Promise<Content | null> {
  const db = await getDb()
  const content = await db.collection<Content>(COLLECTIONS.CONTENT).findOne({ _id: new ObjectId(id) })
  return content ? serializeDocument(content) : null
}

export async function getContentBySlug(slug: string): Promise<Content | null> {
  const db = await getDb()
  const content = await db.collection<Content>(COLLECTIONS.CONTENT).findOne({ slug })
  return content ? serializeDocument(content) : null
}

export async function createContent(content: Content): Promise<Content> {
  const db = await getDb()
  const result = await db.collection<Content>(COLLECTIONS.CONTENT).insertOne(content)

  // If content is published, send newsletter to subscribers
  if (content.published) {
    await sendNewsletterForNewContent({ ...content, _id: result.insertedId })
  }

  return serializeDocument({ ...content, _id: result.insertedId })
}

export async function updateContent(id: string, content: Partial<Content>): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.CONTENT).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...content,
        updatedAt: new Date(),
      },
    },
  )
  return result.modifiedCount > 0
}

export async function deleteContent(id: string): Promise<boolean> {
  const db = await getDb()
  const contentObjectId = new ObjectId(id)
  
  try {
    // Delete all comments related to this content
    await db.collection(COLLECTIONS.COMMENTS).deleteMany({ contentId: contentObjectId })
    
    // Delete all likes related to this content
    await db.collection(COLLECTIONS.CONTENT_LIKES).deleteMany({ contentId: contentObjectId })
    
    // Delete all bookmarks related to this content
    await db.collection(COLLECTIONS.BOOKMARKS).deleteMany({ contentId: contentObjectId })
    
    // Delete the content itself
    const result = await db.collection(COLLECTIONS.CONTENT).deleteOne({ _id: contentObjectId })
    
    return result.deletedCount > 0
  } catch (error) {
    console.error("Error deleting content and related data:", error)
    return false
  }
}

export async function incrementContentViews(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db
    .collection(COLLECTIONS.CONTENT)
    .updateOne({ _id: new ObjectId(id) }, { $inc: { viewCount: 1 } })
  return result.modifiedCount > 0
}

// Comment operations


export async function getAllComments() {
	const db = await getDb()
  const comments = await db.collection<Comment>(COLLECTIONS.COMMENTS).find().toArray()
  return serializeArray(comments)
}

export async function getCommentsByContentId(contentId: string, userId?: string): Promise<Comment[]> {
  const db = await getDb()

  console.log("🔍 Fetching comments for contentId:", contentId, "userId:", userId)
  
  // Convert contentId to ObjectId
  const contentObjectId = new ObjectId(contentId)
  console.log("🔍 Converted contentId to ObjectId:", contentObjectId)
  
  try {
    // First, let's check what comments exist in the database for this contentId
    const allCommentsForContent = await db
      .collection(COLLECTIONS.COMMENTS)
      .find({ 
        $or: [
          { contentId: contentObjectId },
          { contentId: contentId }
        ]
      })
      .toArray()
    
    console.log("🔍 ALL comments for contentId (any status):", allCommentsForContent.length)
    console.log("🔍 All comments details:", allCommentsForContent.map((c: any) => ({ 
      id: c._id, 
      status: c.status, 
      parentId: c.parentId,
      contentId: c.contentId,
      contentIdType: typeof c.contentId,
      content: c.content.substring(0, 30) 
    })))

    // Use aggregation pipeline to get nested comments
    const pipeline = [
      // Match comments for this content
      { 
        $match: { 
          $or: [
            { contentId: contentObjectId },
            { contentId: contentId }
          ],
          status: "approved"
        } 
      },
      // Lookup user information for comment authors
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      // Use graphLookup to find all replies
      {
        $graphLookup: {
          from: "comments",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "replies",
          restrictSearchWithMatch: { 
            $or: [
              { contentId: contentObjectId },
              { contentId: contentId }
            ],
            status: "approved"
          }
        }
      },
      // Lookup user information for reply authors
      {
        $lookup: {
          from: "users",
          localField: "replies.userId",
          foreignField: "_id",
          as: "replyUsers"
        }
      },
      // Add user info to replies and sort them
      {
        $addFields: {
          replies: {
            $map: {
              input: {
                $sortArray: {
                  input: {
                    $map: {
                      input: "$replies",
                      as: "reply",
                      in: {
                        $mergeObjects: [
                          "$$reply",
                          {
                            user: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$replyUsers",
                                    as: "ru",
                                    cond: { $eq: ["$$ru._id", "$$reply.userId"] }
                                  }
                                }, 0
                              ]
                            }
                          }
                        ]
                      }
                    }
                  },
                  sortBy: { createdAt: 1 }
                }
              },
              as: "sortedReply",
              in: "$$sortedReply"
            }
          }
        }
      },
      // Only get top-level comments (no parentId)
      { $match: { parentId: null } },
      // Sort top-level comments by creation date
      { $sort: { createdAt: -1 } },
      // Project the final structure
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          likes: 1,
          status: 1,
          contentId: 1,
          parentId: 1,
          userName: "$user.name",
          userAvatar: "$user.avatar",
          userEmail: "$user.email",
          replies: {
            _id: 1,
            content: 1,
            createdAt: 1,
            updatedAt: 1,
            likes: 1,
            status: 1,
            contentId: 1,
            parentId: 1,
            userName: "$replies.user.name",
            userAvatar: "$replies.user.avatar",
            userEmail: "$replies.user.email"
          }
        }
      }
    ]

    console.log("🔍 Running aggregation pipeline...")
    const comments = await db.collection(COLLECTIONS.COMMENTS).aggregate(pipeline).toArray()
    
    console.log("🔍 Found top-level comments:", comments.length)
    console.log("🔍 Comments structure:", comments.map((c: any) => ({ 
      id: c._id, 
      content: c.content.substring(0, 50),
      repliesCount: c.replies?.length || 0
    })))

    // Helper function to build nested tree from flat replies
    function nestReplies(parent: any, allReplies: any[]) {
      const replyMap = new Map()
      allReplies.forEach(r => replyMap.set(r._id.toString(), { ...r, replies: [] }))

      allReplies.forEach(reply => {
        const parentId = reply.parentId?.toString()
        if (parentId && replyMap.has(parentId)) {
          replyMap.get(parentId).replies.push(replyMap.get(reply._id.toString()))
        }
      })

      if (parent.replies) {
        parent.replies = parent.replies
          .map((r: any) => replyMap.get(r._id.toString()))
          .filter(Boolean)
        
        parent.replies.forEach((r: any) => nestReplies(r, allReplies))
      }
      
      return parent
    }

    // Build nested structure for each top-level comment
    const nestedComments = comments.map((top: any) => {
      if (top.replies && top.replies.length > 0) {
        return nestReplies(top, top.replies)
      }
      return { ...top, replies: [] }
    })

    console.log("🔍 Built nested comments structure")

    // Add like status if user is provided
    if (userId) {
      // Collect all comment and reply IDs
      const allCommentIds = [
        ...nestedComments.map((comment: any) => new ObjectId(comment._id)),
        ...nestedComments.flatMap((comment: any) =>
          (comment.replies || []).map((reply: any) => new ObjectId(reply._id))
        ),
      ]
      
      console.log("🔍 All comment IDs for likes:", allCommentIds.length)
      
      if (allCommentIds.length > 0) {
        // Fetch like statuses
        const likes = await db
          .collection(COLLECTIONS.COMMENT_LIKES)
          .find({
            userId: new ObjectId(userId),
            commentId: { $in: allCommentIds },
          })
          .toArray()

        console.log("🔍 Found likes:", likes.length)

        const likedCommentIds = new Set(likes.map((like) => like.commentId.toString()))

        // Add isLiked to comments and replies recursively
        function addLikeStatus(comment: any): any {
          return {
            ...comment,
            isLiked: likedCommentIds.has(comment._id.toString()),
            replies: (comment.replies || []).map((reply: any) => addLikeStatus(reply))
          }
        }

        return nestedComments.map((comment: any) => addLikeStatus(comment))
      }
    }

    return nestedComments
  } catch (error) {
    console.error("🔍 Error in aggregation pipeline:", error)
    return []
  }
}

export async function createComment(comment: Comment): Promise<Comment> {
  const db = await getDb()
  // Always set status to 'approved'
  const commentToSave = {
    ...comment,
    status: "approved" as const,
    contentId: comment.contentId instanceof ObjectId ? comment.contentId : new ObjectId(comment.contentId),
    userId: comment.userId instanceof ObjectId ? comment.userId : new ObjectId(comment.userId),
    parentId: comment.parentId ? (comment.parentId instanceof ObjectId ? comment.parentId : new ObjectId(comment.parentId)) : undefined
  }
  const result = await db.collection<Comment>(COLLECTIONS.COMMENTS).insertOne(commentToSave)
  // Increment comment count on the content
  await db.collection(COLLECTIONS.CONTENT).updateOne({ _id: commentToSave.contentId }, { $inc: { commentsCount: 1 } })
  return serializeDocument({ ...commentToSave, _id: result.insertedId })
}

export async function updateCommentStatus(id: string, status: "approved" | "rejected"): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.COMMENTS).updateOne({ _id: new ObjectId(id) }, { $set: { status } })
  return result.modifiedCount > 0
}

export async function updateCommentContent(id: string, content: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.COMMENTS).updateOne(
    { _id: new ObjectId(id) }, 
    { $set: { content, updatedAt: new Date() } }
  )
  return result.modifiedCount > 0
}

export async function canUserEditComment(userId: string, commentId: string): Promise<boolean> {
  const db = await getDb()
  const comment = await db.collection(COLLECTIONS.COMMENTS).findOne({ _id: new ObjectId(commentId) })
  
  if (!comment) return false
  
  // User can edit if they are the author or an admin
  const user = await getUserById(userId)
  return comment.userId.toString() === userId || (user?.isAdmin ?? false)
}

export async function canUserDeleteComment(userId: string, commentId: string): Promise<boolean> {
  const db = await getDb()
  const comment = await db.collection(COLLECTIONS.COMMENTS).findOne({ _id: new ObjectId(commentId) })
  
  if (!comment) return false
  
  // User can delete if they are the author or an admin
  const user = await getUserById(userId)
  return comment.userId.toString() === userId || (user?.isAdmin ?? false)
}

export async function deleteComment(id: string): Promise<boolean> {
  const db = await getDb()

  // Get the comment to find its contentId
  const comment = await db.collection<Comment>(COLLECTIONS.COMMENTS).findOne({ _id: new ObjectId(id) })

  if (!comment) return false

  // Delete the comment
  const result = await db.collection(COLLECTIONS.COMMENTS).deleteOne({ _id: new ObjectId(id) })

  if (result.deletedCount > 0) {
    // Decrement comment count on the content
    await db.collection(COLLECTIONS.CONTENT).updateOne({ _id: comment.contentId }, { $inc: { commentsCount: -1 } })
    return true
  }

  return false
}

export async function likeComment(userId: string, commentId: string): Promise<boolean> {
  const db = await getDb()

  // Check if already liked
  const existingLike = await db.collection(COLLECTIONS.COMMENT_LIKES).findOne({
    userId: new ObjectId(userId),
    commentId: new ObjectId(commentId),
  })

  if (existingLike) return false

  // Add like
  await db.collection(COLLECTIONS.COMMENT_LIKES).insertOne({
    userId: new ObjectId(userId),
    commentId: new ObjectId(commentId),
    createdAt: new Date(),
  })

  // Increment like count on content
  await db.collection(COLLECTIONS.COMMENTS).updateOne({ _id: new ObjectId(commentId) }, { $inc: { likes: 1 } })

  return true
}

export async function unlikeComment(userId: string, commentId: string): Promise<boolean> {
  const db = await getDb()

  // Remove like
  const result = await db.collection(COLLECTIONS.COMMENT_LIKES).deleteOne({
    userId: new ObjectId(userId),
    commentId: new ObjectId(commentId),
  })

  if (result.deletedCount > 0) {
    // Decrement like count on content
    await db.collection(COLLECTIONS.COMMENTS).updateOne({ _id: new ObjectId(commentId) }, { $inc: { likes: -1 } })
    return true
  }

  return false
}

export async function isCommentLikedByUser(userId: string, commentId: string): Promise<boolean> {
  const db = await getDb()
  const like = await db.collection(COLLECTIONS.COMMENT_LIKES).findOne({
    userId: new ObjectId(userId),
    commentId: new ObjectId(commentId),
  })
  return !!like
}





// Like operations



export async function getUserLikes(userId: string): Promise<Content[]> {
  const db = await getDb()

  // Get all liked content IDs
  const likes = await db
    .collection(COLLECTIONS.CONTENT_LIKES)
    .find({ userId: new ObjectId(userId) })
    .toArray()

  const contentIds = likes.map((l) => l.contentId)

  if (contentIds.length === 0) return []

  // Get the actual content
  const content = await db
    .collection<Content>(COLLECTIONS.CONTENT)
    .find({ _id: { $in: contentIds } })
    .toArray()
  return serializeArray(content)
}

export async function likeContent(userId: string, contentId: string): Promise<boolean> {
  const db = await getDb()

  // Check if already liked
  const existingLike = await db.collection(COLLECTIONS.CONTENT_LIKES).findOne({
    userId: new ObjectId(userId),
    contentId: new ObjectId(contentId),
  })

  if (existingLike) return false

  // Add like
  await db.collection(COLLECTIONS.CONTENT_LIKES).insertOne({
    userId: new ObjectId(userId),
    contentId: new ObjectId(contentId),
    createdAt: new Date(),
  })

  // Increment like count on content
  await db.collection(COLLECTIONS.CONTENT).updateOne({ _id: new ObjectId(contentId) }, { $inc: { likesCount: 1 } })

  return true
}

export async function unlikeContent(userId: string, contentId: string): Promise<boolean> {
  const db = await getDb()

  // Remove like
  const result = await db.collection(COLLECTIONS.CONTENT_LIKES).deleteOne({
    userId: new ObjectId(userId),
    contentId: new ObjectId(contentId),
  })

  if (result.deletedCount > 0) {
    // Decrement like count on content
    await db.collection(COLLECTIONS.CONTENT).updateOne({ _id: new ObjectId(contentId) }, { $inc: { likesCount: -1 } })
    return true
  }

  return false
}

export async function isContentLikedByUser(userId: string, contentId: string): Promise<boolean> {
  const db = await getDb()
  const like = await db.collection(COLLECTIONS.CONTENT_LIKES).findOne({
    userId: new ObjectId(userId),
    contentId: new ObjectId(contentId),
  })
  return !!like
}

// Bookmark operations
export async function bookmarkContent(userId: string, contentId: string): Promise<boolean> {
  const db = await getDb()

  // Check if already bookmarked
  const existingBookmark = await db.collection(COLLECTIONS.BOOKMARKS).findOne({
    userId: new ObjectId(userId),
    contentId: new ObjectId(contentId),
  })

  if (existingBookmark) return false

  // Add bookmark
  await db.collection(COLLECTIONS.BOOKMARKS).insertOne({
    userId: new ObjectId(userId),
    contentId: new ObjectId(contentId),
    createdAt: new Date(),
  })

  return true
}

export async function unbookmarkContent(userId: string, contentId: string): Promise<boolean> {
  const db = await getDb()

  // Remove bookmark
  const result = await db.collection(COLLECTIONS.BOOKMARKS).deleteOne({
    userId: new ObjectId(userId),
    contentId: new ObjectId(contentId),
  })

  return result.deletedCount > 0
}

export async function isContentBookmarkedByUser(userId: string, contentId: string): Promise<boolean> {
  const db = await getDb()
  const bookmark = await db.collection(COLLECTIONS.BOOKMARKS).findOne({
    userId: new ObjectId(userId),
    contentId: new ObjectId(contentId),
  })
  return !!bookmark
}

export async function getUserBookmarks(userId: string): Promise<Content[]> {
  const db = await getDb()

  // Get all bookmarked content IDs
  const bookmarks = await db
    .collection(COLLECTIONS.BOOKMARKS)
    .find({ userId: new ObjectId(userId) })
    .toArray()

  const contentIds = bookmarks.map((b) => b.contentId)

  if (contentIds.length === 0) return []

  // Get the actual content
  const content = await db
    .collection<Content>(COLLECTIONS.CONTENT)
    .find({ _id: { $in: contentIds } })
    .toArray()
  return serializeArray(content)
}

// Newsletter operations
export async function createSubscriber(email: string): Promise<Subscriber> {
  const db = await getDb()

  // Check if subscriber already exists
  const existingSubscriber = await db.collection<Subscriber>(COLLECTIONS.SUBSCRIBERS).findOne({ email })

  if (existingSubscriber) {
    if (!existingSubscriber.isActive) {
      // Reactivate subscriber
      await db.collection(COLLECTIONS.SUBSCRIBERS).updateOne(
        { email },
        {
          $set: {
            isActive: true,
            subscribedAt: new Date(),
            unsubscribedAt: undefined,
          },
        },
      )
      return serializeDocument({ ...existingSubscriber, isActive: true, subscribedAt: new Date() })
    }
    throw new Error("Email already subscribed")
  }

  const subscriber: Subscriber = {
    email,
    isActive: true,
    subscribedAt: new Date(),
    unsubscribeToken: generateUnsubscribeToken(),
  }

  const result = await db.collection<Subscriber>(COLLECTIONS.SUBSCRIBERS).insertOne(subscriber)
  return serializeDocument({ ...subscriber, _id: result.insertedId })
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.SUBSCRIBERS).updateOne(
    { unsubscribeToken: token },
    {
      $set: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    },
  )
  return result.modifiedCount > 0
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  const db = await getDb()
  const subscribers = await db.collection<Subscriber>(COLLECTIONS.SUBSCRIBERS).find({ isActive: true }).toArray()
  return serializeArray(subscribers)
}

export async function logEmail(log: EmailLog): Promise<void> {
  const db = await getDb()
  await db.collection<EmailLog>(COLLECTIONS.EMAIL_LOGS).insertOne(log)
}

// Notification operations
export async function createNotification(notification: Notification): Promise<Notification> {
  const db = await getDb()
  const result = await db.collection<Notification>(COLLECTIONS.NOTIFICATIONS).insertOne(notification)
  return serializeDocument({ ...notification, _id: result.insertedId })
}

export async function getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const db = await getDb()
  const notifications = await db
    .collection<Notification>(COLLECTIONS.NOTIFICATIONS)
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return serializeArray(notifications)
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db
    .collection(COLLECTIONS.NOTIFICATIONS)
    .updateOne({ _id: new ObjectId(id) }, { $set: { isRead: true } })
  return result.modifiedCount > 0
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const db = await getDb()
  return db.collection(COLLECTIONS.NOTIFICATIONS).countDocuments({
    userId: new ObjectId(userId),
    isRead: false,
  })
}

export async function deleteNotification(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.NOTIFICATIONS).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function deleteAllNotifications(userId: string): Promise<number> {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.NOTIFICATIONS).deleteMany({ userId: new ObjectId(userId) })
  return result.deletedCount || 0
}

// Helper functions
function generateUnsubscribeToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Helper: SVG icon for content type
function getIconSvg(icon: string) {
  const accent = '#B08968'
  switch (icon) {
    case 'BookOpen':
      return `<svg width="20" height="20" fill="none" stroke="${accent}" stroke-width="1.7" viewBox="0 0 24 24"><path d="M2 6.5A2.5 2.5 0 0 1 4.5 4H20M2 17.5A2.5 2.5 0 0 0 4.5 20H20M20 4v16M20 4a2.5 2.5 0 0 1 2.5 2.5v13A2.5 2.5 0 0 1 20 20M4.5 4A2.5 2.5 0 0 0 2 6.5v13A2.5 2.5 0 0 0 4.5 20"/></svg>`
    case 'FileText':
      return `<svg width="20" height="20" fill="none" stroke="${accent}" stroke-width="1.7" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>`
    case 'Music':
      return `<svg width="20" height="20" fill="none" stroke="${accent}" stroke-width="1.7" viewBox="0 0 24 24"><circle cx="8.5" cy="17.5" r="2.5"/><path d="M8.5 17.5V5.5l11-2v12"/><circle cx="19.5" cy="17.5" r="2.5"/></svg>`
    case 'Video':
      return `<svg width="20" height="20" fill="none" stroke="${accent}" stroke-width="1.7" viewBox="0 0 24 24"><rect x="3" y="5" width="15" height="14" rx="2"/><path d="M21 7v10l-4-3v-4l4-3z"/></svg>`
    case 'Coffee':
      return `<svg width="20" height="20" fill="none" stroke="${accent}" stroke-width="1.7" viewBox="0 0 24 24"><path d="M17 8v5a5 5 0 0 1-10 0V8zm0 0V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"/><path d="M21 13a3 3 0 0 1-3 3"/></svg>`
    case 'Mic':
      return `<svg width="20" height="20" fill="none" stroke="${accent}" stroke-width="1.7" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><path d="M12 19v3m-4 0h8"/></svg>`
    default:
      return `<svg width="20" height="20" fill="none" stroke="${accent}" stroke-width="1.7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`
  }
}

export async function sendNewsletterForNewContent(content: Content): Promise<void> {
  const db = await getDb()
  const subscribers = await db.collection<Subscriber>(COLLECTIONS.SUBSCRIBERS).find({ isActive: true }).toArray()
  if (!subscribers.length) return

  // SMTP config from env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const from = process.env.EMAIL_FROM || 'Mukheimar <no-reply@yourdomain.com>'
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const postUrl = `${baseUrl}/content/${content.slug}`

  // Email theme colors
  const accent = '#e27a30' // vintage-accent
  const border = '#e8ddcb' // vintage-border
  const bg = '#FFF8F0' // light background

  // HTML email
  const html = `
    <div style="background:${bg};padding:32px 0;font-family:'Tajawal',Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid ${border};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px #0001;">
        <img src="${content.coverImage}" alt="${content.title}" style="width:100%;height:220px;object-fit:cover;border-bottom:1px solid ${border};background:${border};" />
        <div style="padding:32px 24px 24px 24px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="color:${accent};font-weight:600;font-size:1.1rem;">${content.contentType.label}</span>
          </div>
          <h2 style="color:#222;font-size:2rem;margin:0 0 12px 0;">${content.title}</h2>
          <p style="color:#444;font-size:1.1rem;line-height:1.7;margin-bottom:24px;">${content.excerpt || ''}</p>
          <a href="${postUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;text-decoration:none;font-size:1rem;font-weight:500;line-height:44px;height:44px;padding:0 32px;border-radius:9999px;box-shadow:0 2px 8px #0002;background:${accent};color:#fff;transition:background 0.2s;">اقرأ الآن</a>
        </div>
      </div>
    </div>
  `

  for (const sub of subscribers) {
    await transporter.sendMail({
      from,
      to: sub.email,
      subject: `جديد على مخيمر : ${content.title}`,
      html,
    })
  }
}

// Initialize database with default data if empty
export async function initializeDb() {
  const db = await getDb()

  // Ensure content collection has proper indexes
  try {
    // Create indexes for content collection
    await db.collection(COLLECTIONS.CONTENT).createIndex({ slug: 1 }, { unique: true })
    await db.collection(COLLECTIONS.CONTENT).createIndex({ published: 1 })
    await db.collection(COLLECTIONS.CONTENT).createIndex({ featured: 1 })
    await db.collection(COLLECTIONS.CONTENT).createIndex({ "author._id": 1 })
    await db.collection(COLLECTIONS.CONTENT).createIndex({ "contentType._id": 1 })
    await db.collection(COLLECTIONS.CONTENT).createIndex({ createdAt: -1 })
    await db.collection(COLLECTIONS.CONTENT).createIndex({ title: "text", content: "text" })
    
    console.log("✅ Content collection indexes created/verified")
  } catch (error) {
    console.warn("⚠️ Some indexes may already exist:", error)
  }

  // Ensure categories collection has proper indexes
  try {
    // Create indexes for categories collection
    await db.collection(COLLECTIONS.CATEGORIES).createIndex({ label: 1 }, { unique: true })
    await db.collection(COLLECTIONS.CATEGORIES).createIndex({ isDefault: 1 })
    await db.collection(COLLECTIONS.CATEGORIES).createIndex({ contentTypeId: 1 })
    await db.collection(COLLECTIONS.CATEGORIES).createIndex({ createdAt: 1 })
    
    console.log("✅ Categories collection indexes created/verified")
  } catch (error) {
    console.warn("⚠️ Some category indexes may already exist:", error)
  }

  // Ensure content types collection has proper indexes
  try {
    // Create indexes for content types collection
    await db.collection(COLLECTIONS.CONTENT_TYPES).createIndex({ label: 1 }, { unique: true })
    await db.collection(COLLECTIONS.CONTENT_TYPES).createIndex({ createdAt: 1 })
    
    console.log("✅ Content types collection indexes created/verified")
  } catch (error) {
    console.warn("⚠️ Some content type indexes may already exist:", error)
  }

  // Check if content types exist
  const contentTypesCount = await db.collection(COLLECTIONS.CONTENT_TYPES).countDocuments()

  if (contentTypesCount === 0) {
    // Insert default content types
    const defaultContentTypes = [
      { label: "مقالات", icon: "FileText", createdAt: new Date(), updatedAt: new Date() },
      { label: "حواديت", icon: "BookOpen", createdAt: new Date(), updatedAt: new Date() },
      { label: "شعر", icon: "Music", createdAt: new Date(), updatedAt: new Date() },
      { label: "سينما", icon: "Video", createdAt: new Date(), updatedAt: new Date() },
      { label: "تأملات", icon: "Coffee", createdAt: new Date(), updatedAt: new Date() },
      { label: "بودكاست", icon: "Mic", createdAt: new Date(), updatedAt: new Date() },
    ]

    const result = await db.collection(COLLECTIONS.CONTENT_TYPES).insertMany(defaultContentTypes)
    const contentTypeIds = Object.values(result.insertedIds)

    // Insert default categories for different content types
    const defaultCategories = [
      // Articles categories
      {
        name: "drama",
        label: "دراما",
        contentTypeId: contentTypeIds[0], // articles
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "comedy",
        label: "كوميدي",
        contentTypeId: contentTypeIds[0], // articles
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "self-development",
        label: "تطوير ذات",
        contentTypeId: contentTypeIds[0], // articles
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Stories categories
      {
        name: "adventure",
        label: "مغامرة",
        contentTypeId: contentTypeIds[1], // stories
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "romance",
        label: "رومانسي",
        contentTypeId: contentTypeIds[1], // stories
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "mystery",
        label: "غموض",
        contentTypeId: contentTypeIds[1], // stories
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Poetry categories
      {
        name: "love",
        label: "حب",
        contentTypeId: contentTypeIds[2], // poetry
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "nature",
        label: "طبيعة",
        contentTypeId: contentTypeIds[2], // poetry
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "philosophy",
        label: "فلسفة",
        contentTypeId: contentTypeIds[2], // poetry
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Cinema categories
      {
        name: "action",
        label: "أكشن",
        contentTypeId: contentTypeIds[3], // cinema
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "documentary",
        label: "وثائقي",
        contentTypeId: contentTypeIds[3], // cinema
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "classic",
        label: "كلاسيكي",
        contentTypeId: contentTypeIds[3], // cinema
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Reflections categories
      {
        name: "spirituality",
        label: "روحانيات",
        contentTypeId: contentTypeIds[4], // reflections
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "mindfulness",
        label: "وعي",
        contentTypeId: contentTypeIds[4], // reflections
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "wisdom",
        label: "حكمة",
        contentTypeId: contentTypeIds[4], // reflections
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Podcasts categories
      {
        name: "interviews",
        label: "مقابلات",
        contentTypeId: contentTypeIds[5], // podcasts
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "discussions",
        label: "مناقشات",
        contentTypeId: contentTypeIds[5], // podcasts
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "stories",
        label: "قصص",
        contentTypeId: contentTypeIds[5], // podcasts
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Default categories (available for all content types)
      {
        name: "featured",
        label: "مميز",
        contentTypeId: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "trending",
        label: "رائج",
        contentTypeId: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "new",
        label: "جديد",
        contentTypeId: null,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection(COLLECTIONS.CATEGORIES).insertMany(defaultCategories)
    console.log("✅ Default content types and categories created")
  } else {
    console.log("✅ Content types already exist")
  }
}

// Utility to get total comment count for a content (all comments, not just approved)
export async function getTotalCommentsCount(contentId: string): Promise<number> {
  const db = await getDb()
  const contentObjectId = new ObjectId(contentId)
  return db.collection(COLLECTIONS.COMMENTS).countDocuments({ contentId: contentObjectId })
}

export async function getRelatedContent(
  contentId: string,
  limit: number = 6
): Promise<Content[]> {
  const db = await getDb()
  
  // Get the source content
  const sourceContent = await db.collection<Content>(COLLECTIONS.CONTENT).findOne({ 
    _id: new ObjectId(contentId) 
  })
  
  if (!sourceContent) {
    console.log("❌ Source content not found for ID:", contentId)
    return []
  }

  console.log("🔍 Finding related content for:", sourceContent.title)
  console.log("📊 Source content categories:", sourceContent.categories.map(c => c.label))
  console.log("🏷️ Source content tags:", sourceContent.tags)
  console.log("📝 Source content type:", sourceContent.contentType.label)

  // Extract relevant data from source content
  const sourceCategories = sourceContent.categories.map(cat => cat._id.toString())
  const sourceContentTypeId = sourceContent.contentType._id.toString()
  const sourceTags = sourceContent.tags || []
  const sourceAuthorId = sourceContent.author._id.toString()

  // Build aggregation pipeline for recommendation scoring
  const pipeline = [
    // Exclude the source content itself
    { $match: { _id: { $ne: new ObjectId(contentId) }, published: true } },
    
    // Add scoring based on multiple factors
    {
      $addFields: {
        score: {
          $sum: [
            // Category match: highest priority (weight: 10)
            {
              $multiply: [
                {
                  $size: {
                    $setIntersection: [
                      { $ifNull: ["$categories._id", []] },
                      sourceContent.categories.map(cat => cat._id)
                    ]
                  }
                },
                10
              ]
            },
            // Content type match: high priority (weight: 8)
            {
              $cond: {
                if: { $eq: ["$contentType._id", sourceContent.contentType._id] },
                then: 8,
                else: 0
              }
            },
            // Tag overlap: medium priority (weight: 3 per tag)
            {
              $multiply: [
                {
                  $size: {
                    $setIntersection: [
                      { $ifNull: ["$tags", []] },
                      sourceTags
                    ]
                  }
                },
                3
              ]
            },
            // Same author: medium priority (weight: 5)
            {
              $cond: {
                if: { $eq: ["$author._id", sourceContent.author._id] },
                then: 5,
                else: 0
              }
            },
            // Popularity boost: low priority (weight: 0.1 per like, 0.05 per view)
            {
              $add: [
                { $multiply: ["$likesCount", 0.1] },
                { $multiply: ["$viewCount", 0.05] }
              ]
            },
            // Recency boost: very low priority (weight: 0.01 per day since creation)
            {
              $multiply: [
                {
                  $divide: [
                    { $subtract: [new Date(), "$createdAt"] },
                    1000 * 60 * 60 * 24 // Convert to days
                  ]
                },
                -0.01 // Negative because newer content should have higher score
              ]
            }
          ]
        }
      }
    },
    
    // Sort by score (descending)
    { $sort: { score: -1 } },
    
    // Limit results
    { $limit: limit }
  ]

  const relatedContent = await db.collection<Content>(COLLECTIONS.CONTENT).aggregate(pipeline).toArray()
  
  console.log("✅ Found", relatedContent.length, "related content items")
  if (relatedContent.length > 0) {
    console.log("🏆 Top recommendation:", relatedContent[0].title, "Score:", relatedContent[0].score)
  }
  
  return serializeArray(relatedContent)
}

interface GetContentOptions {
  contentType?: string[]
  category?: string[]
  sortBy?: "newest" | "popular" | "trending"
  published?: boolean
  limit?: number
  skip?: number
  createdAt?: any
  search?: string
}

export async function getContent(options: GetContentOptions = {}): Promise<{ content: Content[], totalCount: number }> {
  const db = await getDb()
  
  // Build aggregation pipeline for better performance
  const pipeline: any[] = [
    // Match stage - apply filters first for better performance
    { $match: { published: true } }
  ]

  // Add content type filter
  if (options.contentType && options.contentType.length > 0) {
    pipeline.push({
      $match: {
        "contentType.label": { $in: options.contentType }
      }
    })
  }

  // Add category filter with proper indexing
  if (options.category && options.category.length > 0) {
    const objectIds = options.category.filter((id: string) => ObjectId.isValid(id)).map((id: string) => new ObjectId(id))
    const rawIds = options.category
    pipeline.push({
      $match: {
        $or: [
          { "categories._id": { $in: objectIds } },
          { "categories._id": { $in: rawIds } }
        ]
      }
    })
  }

  // Add search filter
  if (options.search) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: options.search, $options: 'i' } },
          { excerpt: { $regex: options.search, $options: 'i' } },
          { tags: { $in: [new RegExp(options.search, 'i')] } }
        ]
      }
    })
  }

  // Add date filter
  if (options.createdAt) {
    pipeline.push({
      $match: {
        createdAt: options.createdAt
      }
    })
  }

  // Add lookup for author and content type (optimized) using distinct field names
  pipeline.push(
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "authorId",
        foreignField: "_id",
        as: "authorRef",
        pipeline: [
          { $project: { name: 1, avatar: 1, email: 1 } }
        ]
      }
    },
    {
      $lookup: {
        from: COLLECTIONS.CONTENT_TYPES,
        localField: "contentTypeId",
        foreignField: "_id",
        as: "contentTypeRef",
        pipeline: [
          { $project: { label: 1, name: 1, icon: 1 } }
        ]
      }
    }
  )

  // Unwind arrays
  pipeline.push(
    { $unwind: { path: "$authorRef", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$contentTypeRef", preserveNullAndEmptyArrays: true } }
  )

  // Prefer embedded author/contentType, otherwise use looked-up refs
  pipeline.push({
    $addFields: {
      author: { $ifNull: ["$author", "$authorRef"] },
      contentType: { $ifNull: ["$contentType", "$contentTypeRef"] },
    }
  })

  // Add sort stage
  const sortStage: any = {}
  switch (options.sortBy) {
    case "popular":
      sortStage.likesCount = -1
      break
    case "trending":
      sortStage.viewCount = -1
      break
    default:
      sortStage.createdAt = -1
  }
  pipeline.push({ $sort: sortStage })

  // Get total count for pagination
  const countPipeline = [...pipeline, { $count: "total" }]
  const countResult = await db.collection<Content>(COLLECTIONS.CONTENT).aggregate(countPipeline).toArray()
  const totalCount = countResult[0]?.total || 0

  // Add pagination
  if (options.skip) {
    pipeline.push({ $skip: options.skip })
  }
  if (options.limit) {
    pipeline.push({ $limit: options.limit })
  }

  // Execute optimized query
  const content = await db.collection<Content>(COLLECTIONS.CONTENT).aggregate(pipeline).toArray() as Content[]

  return { content, totalCount }
}

// Enhanced user management functions
export async function blockUser(userId: string, blocked: boolean): Promise<boolean> {
  const db = await getDb()
  const result = await db
    .collection(COLLECTIONS.USERS)
    .updateOne({ _id: new ObjectId(userId) }, { $set: { blocked, updatedAt: new Date() } })
  return result.modifiedCount > 0
}

export async function getAllUsersWithActivity(): Promise<any[]> {
  const db = await getDb()
  
  const users = await db.collection(COLLECTIONS.USERS).find({}).toArray()
  
  const usersWithActivity = await Promise.all(
    users.map(async (user) => {
      const userId = user._id
      
      // Get user's comments count
      const commentsCount = await db.collection(COLLECTIONS.COMMENTS).countDocuments({
        userId: userId
      })
      
      // Get user's likes count
      const likesCount = await db.collection(COLLECTIONS.CONTENT_LIKES).countDocuments({
        userId: userId
      })
      
      // Get user's bookmarks count
      const bookmarksCount = await db.collection(COLLECTIONS.BOOKMARKS).countDocuments({
        userId: userId
      })
      
      // Get user's content count
      const contentCreated = await db.collection(COLLECTIONS.CONTENT).countDocuments({
        authorId: userId
      })
      
      return {
        ...user,
        activity: {
          commentsCount,
          likesCount,
          bookmarksCount,
          lastLogin: user.lastLogin || null,
          contentCreated
        }
      }
    })
  )
  
  return usersWithActivity
}

export async function getContentWithDetailedStats(): Promise<any[]> {
  const db = await getDb()
  
  const content = await db.collection(COLLECTIONS.CONTENT)
    .aggregate([
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: "authorId",
          foreignField: "_id",
          as: "author"
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.CONTENT_TYPES,
          localField: "contentTypeId",
          foreignField: "_id",
          as: "contentType"
        }
      },
      {
        $unwind: "$author"
      },
      {
        $unwind: "$contentType"
      }
    ]).toArray()
  
  const contentWithStats = await Promise.all(
    content.map(async (item) => {
      const contentId = item._id
      
      // Get total views
      const totalViews = item.viewCount || 0
      
      // Get total likes
      const totalLikes = await db.collection(COLLECTIONS.CONTENT_LIKES).countDocuments({
        contentId: contentId
      })
      
      // Get total comments
      const totalComments = await db.collection(COLLECTIONS.COMMENTS).countDocuments({
        contentId: contentId
      })
      
      // Calculate engagement rate
      const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0
      
      return {
        ...item,
        detailedStats: {
          totalViews,
          totalLikes,
          totalComments,
          engagementRate: Math.round(engagementRate * 100) / 100
        }
      }
    })
  )
  
  return contentWithStats
}

export async function getDashboardStats(): Promise<any> {
  const db = await getDb()
  
  // User statistics
  const totalUsers = await db.collection(COLLECTIONS.USERS).countDocuments()
  const activeUsers = await db.collection(COLLECTIONS.USERS).countDocuments({ blocked: { $ne: true } })
  const adminUsers = await db.collection(COLLECTIONS.USERS).countDocuments({ isAdmin: true })
  
  // Content statistics
  const totalContent = await db.collection(COLLECTIONS.CONTENT).countDocuments()
  const publishedContent = await db.collection(COLLECTIONS.CONTENT).countDocuments({ published: true })
  const draftContent = await db.collection(COLLECTIONS.CONTENT).countDocuments({ published: false })
  const featuredContent = await db.collection(COLLECTIONS.CONTENT).countDocuments({ featured: true })
  
  // Engagement statistics
  const totalComments = await db.collection(COLLECTIONS.COMMENTS).countDocuments()
  const approvedComments = await db.collection(COLLECTIONS.COMMENTS).countDocuments({ status: "approved" })
  const pendingComments = await db.collection(COLLECTIONS.COMMENTS).countDocuments({ status: "pending" })
  const rejectedComments = await db.collection(COLLECTIONS.COMMENTS).countDocuments({ status: "rejected" })
  
  const totalLikes = await db.collection(COLLECTIONS.CONTENT_LIKES).countDocuments()
  
  // Calculate total views
  const contentWithViews = await db.collection(COLLECTIONS.CONTENT).find({}).toArray()
  const totalViews = contentWithViews.reduce((sum, item) => sum + (item.viewCount || 0), 0)
  
  // Calculate average engagement
  const averageEngagement = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0
  
  // Newsletter statistics (placeholder)
  const totalSubscribers = 0
  const activeSubscribers = 0
  const newSubscribersThisMonth = 0
  
  // Performance metrics
  const contentViewsPerDay = Math.round(totalViews / 30) // Assuming 30 days
  const engagementRate = Math.round(averageEngagement * 100) / 100
  const commentApprovalRate = totalComments > 0 ? Math.round((approvedComments / totalComments) * 100) : 0
  
  // Growth rate (placeholder - would need historical data)
  const growthRate = 5.2 // Placeholder percentage
  
  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      newThisMonth: Math.round(totalUsers * 0.1), // Placeholder
      growthRate
    },
    content: {
      total: totalContent,
      published: publishedContent,
      drafts: draftContent,
      featured: featuredContent
    },
    engagement: {
      totalComments,
      approvedComments,
      pendingComments,
      rejectedComments,
      totalLikes,
      totalViews,
      averageEngagement: Math.round(averageEngagement * 100) / 100
    },
    newsletter: {
      totalSubscribers,
      activeSubscribers,
      newSubscribersThisMonth
    },
    performance: {
      contentViewsPerDay,
      engagementRate,
      commentApprovalRate
    }
  }
}

// Feedback System Functions
export async function createFeedback(feedback: Omit<Feedback, "_id">): Promise<Feedback> {
  const db = await getDb()
  const newFeedback: Feedback = {
    ...feedback,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const result = await db.collection("feedback").insertOne(newFeedback)
  return { ...newFeedback, _id: result.insertedId }
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const db = await getDb()
  const feedback = await db.collection("feedback")
    .find({})
    .sort({ createdAt: -1 })
    .toArray()
  
  return serializeArray(feedback)
}

export async function getFeedbackById(id: string): Promise<Feedback | null> {
  const db = await getDb()
  const feedback = await db.collection("feedback").findOne({ _id: new ObjectId(id) })
  
  return feedback ? serializeDocument(feedback) : null
}

export async function updateFeedbackStatus(id: string, status: "pending" | "approved" | "replied" | "archived", isPublic?: boolean, adminNotes?: string): Promise<boolean> {
  const db = await getDb()
  const updateData: any = { 
    status, 
    updatedAt: new Date() 
  }
  if (isPublic !== undefined) updateData.isPublic = isPublic
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes
  const result = await db.collection("feedback")
    .updateOne({ _id: new ObjectId(id) }, { $set: updateData })
  return result.modifiedCount > 0
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection("feedback").deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function getPublicFeedback(): Promise<Feedback[]> {
  const db = await getDb()
  const feedback = await db.collection("feedback")
    .find({ status: "approved", isPublic: true })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()
  
  return serializeArray(feedback)
}

export async function getFeedbackStats(): Promise<any> {
  const db = await getDb()
  
  const total = await db.collection("feedback").countDocuments()
  const pending = await db.collection("feedback").countDocuments({ status: "pending" })
  const approved = await db.collection("feedback").countDocuments({ status: "approved" })
  const rejected = await db.collection("feedback").countDocuments({ status: "rejected" })
  const publicFeedback = await db.collection("feedback").countDocuments({ status: "approved", isPublic: true })
  
  return {
    total,
    pending,
    approved,
    rejected,
    publicFeedback
  }
}

// Contact System Functions
export async function createContactMessage(contactMessage: Omit<ContactMessage, "_id">): Promise<ContactMessage> {
  const db = await getDb()
  const newContactMessage: ContactMessage = {
    ...contactMessage,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const result = await db.collection("contact_messages").insertOne(newContactMessage)
  return { ...newContactMessage, _id: result.insertedId }
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const db = await getDb()
  const messages = await db.collection("contact_messages")
    .find({})
    .sort({ createdAt: -1 })
    .toArray()
  
  return serializeArray(messages)
}

export async function getContactMessageById(id: string): Promise<ContactMessage | null> {
  const db = await getDb()
  const message = await db.collection("contact_messages").findOne({ _id: new ObjectId(id) })
  
  return message ? serializeDocument(message) : null
}

export async function updateContactMessageStatus(id: string, status: "unread" | "read" | "replied" | "archived"): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection("contact_messages")
    .updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { status, updatedAt: new Date() } }
    )
  
  return result.modifiedCount > 0
}

export async function replyToContactMessage(id: string, adminReply: string, repliedBy: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection("contact_messages")
    .updateOne(
      { _id: new ObjectId(id) }, 
      { 
        $set: { 
          adminReply, 
          repliedBy: new ObjectId(repliedBy),
          repliedAt: new Date(),
          status: "replied",
          updatedAt: new Date() 
        } 
      }
    )
  
  return result.modifiedCount > 0
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection("contact_messages").deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function getContactMessageStats(): Promise<any> {
  const db = await getDb()
  
  const total = await db.collection("contact_messages").countDocuments()
  const unread = await db.collection("contact_messages").countDocuments({ status: "unread" })
  const read = await db.collection("contact_messages").countDocuments({ status: "read" })
  const replied = await db.collection("contact_messages").countDocuments({ status: "replied" })
  const archived = await db.collection("contact_messages").countDocuments({ status: "archived" })
  
  return {
    total,
    unread,
    read,
    replied,
    archived
  }
}

// Seed test content data for dashboard analytics
export async function seedTestContentData() {
  const db = await getDb();
  const now = new Date();
  const contentTypes = [
    { name: "articles", label: "مقالات", icon: "FileText" },
    { name: "stories", label: "حواديت", icon: "BookOpen" },
    { name: "poetry", label: "شعر", icon: "Music" },
  ];
  // Published content: last 10 days
  for (let i = 0; i < 10; i++) {
    const type = contentTypes[i % contentTypes.length];
    await db.collection(COLLECTIONS.CONTENT).insertOne({
      title: `Test Content ${i+1}`,
      slug: `test-content-${i+1}`,
      excerpt: `Excerpt for test content ${i+1}`,
      coverImage: "",
      author: {
        _id: new ObjectId(),
        name: `Author ${i+1}`,
        avatar: ""
      },
      contentType: {
        _id: new ObjectId(),
        name: type.name,
        label: type.label,
        icon: type.icon
      },
      published: true,
      featured: false,
      createdAt: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
      viewCount: 10 + i * 5,
      likesCount: 2 + i,
      commentsCount: 1 + (i % 3),
      categories: [],
      tags: []
    });
  }
  // Draft content: last 10-12 days
  for (let i = 0; i < 2; i++) {
    const type = contentTypes[i % contentTypes.length];
    await db.collection(COLLECTIONS.CONTENT).insertOne({
      title: `Draft Content ${i+1}`,
      slug: `draft-content-${i+1}`,
      excerpt: `Draft excerpt ${i+1}`,
      coverImage: "",
      author: {
        _id: new ObjectId(),
        name: `Draft Author ${i+1}`,
        avatar: ""
      },
      contentType: {
        _id: new ObjectId(),
        name: type.name,
        label: type.label,
        icon: type.icon
      },
      published: false,
      featured: false,
      createdAt: new Date(now.getTime() - (10 + i) * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - (10 + i) * 24 * 60 * 60 * 1000),
      viewCount: 0,
      likesCount: 0,
      commentsCount: 0,
      categories: [],
      tags: []
    });
  }
  // Featured content: last 12-14 days
  for (let i = 0; i < 2; i++) {
    const type = contentTypes[i % contentTypes.length];
    await db.collection(COLLECTIONS.CONTENT).insertOne({
      title: `Featured Content ${i+1}`,
      slug: `featured-content-${i+1}`,
      excerpt: `Featured excerpt ${i+1}`,
      coverImage: "",
      author: {
        _id: new ObjectId(),
        name: `Featured Author ${i+1}`,
        avatar: ""
      },
      contentType: {
        _id: new ObjectId(),
        name: type.name,
        label: type.label,
        icon: type.icon
      },
      published: true,
      featured: true,
      createdAt: new Date(now.getTime() - (12 + i) * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - (12 + i) * 24 * 60 * 60 * 1000),
      viewCount: 20 + i * 3,
      likesCount: 5 + i,
      commentsCount: 2 + i,
      categories: [],
      tags: []
    });
  }
  return { ok: true };
}

// Settings (Contact Info)
export async function getSettings(): Promise<Settings | null> {
  const db = await getDb()
  const settings = await db.collection("settings").findOne({})
  return settings ? serializeDocument(settings) : null
}

export async function updateSettings(settings: Partial<Settings>, updatedBy?: string): Promise<boolean> {
  const db = await getDb()
  const updateData: any = { ...settings, updatedAt: new Date() }
  if (updatedBy) updateData.updatedBy = new ObjectId(updatedBy)
  const result = await db.collection("settings").updateOne({}, { $set: updateData }, { upsert: true })
  return result.acknowledged
}

// Efficient dashboard stats methods
export async function getContentCounts() {
  const db = await getDb();
  const total = await db.collection(COLLECTIONS.CONTENT).countDocuments({});
  const published = await db.collection(COLLECTIONS.CONTENT).countDocuments({ published: true });
  const drafts = await db.collection(COLLECTIONS.CONTENT).countDocuments({ published: false });
  const featured = await db.collection(COLLECTIONS.CONTENT).countDocuments({ featured: true });
  return { total, published, drafts, featured };
}

export async function getContentTypeDistribution() {
  const db = await getDb();
  const pipeline = [
    { $group: { _id: "$contentType.label", count: { $sum: 1 } } },
    { $project: { type: "$_id", count: 1, _id: 0 } }
  ];
  return db.collection(COLLECTIONS.CONTENT).aggregate(pipeline).toArray();
}

export async function getKeyMetrics() {
  const db = await getDb();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Helper to calculate percent change
  function percentChange(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  // Aggregate for last 30 days
  const pipelineCurrent = [
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: { $ifNull: ["$viewCount", 0] } },
        totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
        totalComments: { $sum: { $ifNull: ["$commentsCount", 0] } },
      }
    }
  ];
  const resultCurrent = await db.collection(COLLECTIONS.CONTENT).aggregate(pipelineCurrent).toArray();
  const { totalViews = 0, totalLikes = 0, totalComments = 0 } = resultCurrent[0] || {};

  // Aggregate for previous 30 days
  const pipelinePrev = [
    { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: { $ifNull: ["$viewCount", 0] } },
        totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
        totalComments: { $sum: { $ifNull: ["$commentsCount", 0] } },
      }
    }
  ];
  const resultPrev = await db.collection(COLLECTIONS.CONTENT).aggregate(pipelinePrev).toArray();
  const { totalViews: prevViews = 0, totalLikes: prevLikes = 0, totalComments: prevComments = 0 } = resultPrev[0] || {};

  // Calculate engagement rates
  const engagementRate = ((totalLikes + totalComments) / Math.max(totalViews, 1)) * 100;
  const prevEngagementRate = ((prevLikes + prevComments) / Math.max(prevViews, 1)) * 100;

  // Calculate percent changes
  const viewsChange = percentChange(totalViews, prevViews);
  const likesChange = percentChange(totalLikes, prevLikes);
  const commentsChange = percentChange(totalComments, prevComments);
  const engagementChange = percentChange(engagementRate, prevEngagementRate);

  return {
    totalViews,
    totalLikes,
    totalComments,
    engagementRate,
    viewsChange,
    likesChange,
    commentsChange,
    engagementChange
  };
}

/**
 * Returns performance metrics for the dashboard: growth rate, retention rate, average session time.
 * - Growth rate: % increase in users this month vs last month
 * - Retention rate: % of users active this month who were also active last month
 * - Average session time: placeholder (requires session tracking)
 */
export async function getPerformanceMetrics() {
  const db = await getDb();
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  // User growth rate
  const usersThisMonth = await db.collection(COLLECTIONS.USERS).countDocuments({ createdAt: { $gte: thisMonth } });
  const usersLastMonth = await db.collection(COLLECTIONS.USERS).countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } });
  let growthRate = 0;
  if (usersLastMonth === 0) growthRate = usersThisMonth > 0 ? 100 : 0;
  else growthRate = ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;

  // Retention rate (users who logged in this month and last month)
  // Assume lastLogin is tracked on user
  const usersActiveLastMonth = await db.collection(COLLECTIONS.USERS).find({ lastLogin: { $gte: lastMonth, $lt: thisMonth } }).toArray();
  const usersActiveThisMonth = await db.collection(COLLECTIONS.USERS).find({ lastLogin: { $gte: thisMonth } }).toArray();
  const retained = usersActiveThisMonth.filter(u => usersActiveLastMonth.some(lm => String(lm._id) === String(u._id)));
  const retentionRate = usersActiveLastMonth.length > 0 ? (retained.length / usersActiveLastMonth.length) * 100 : 0;

  // Average session time (placeholder, unless you have session logs)
  // If you have a sessions collection, you can aggregate average duration for this month
  // For now, return a placeholder value
  const avgSessionTime = 4.2; // minutes, placeholder

  return {
    growthRate: Math.round(growthRate * 10) / 10,
    retentionRate: Math.round(retentionRate * 10) / 10,
    avgSessionTime
  };
}
