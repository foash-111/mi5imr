import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"
import type { User, Content, Comment, ContentType, Category, Subscriber, EmailLog, Notification } from "../models/types"

// Database and collections names
const DB_NAME = "arabic-storytelling"
const COLLECTIONS = {
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

// Get database connection
export async function getDb() {
  const client = await clientPromise
  return client.db(DB_NAME)
}

// User operations
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb()
  return db.collection<User>(COLLECTIONS.USERS).findOne({ email })
}

export async function getAllUsers() {
	const db = await getDb()
  return db.collection<User>(COLLECTIONS.USERS).find().toArray()
}


export async function createUser(user: User): Promise<User> {
  const db = await getDb()
  const result = await db.collection<User>(COLLECTIONS.USERS).insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb()
  return db.collection<User>(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) })
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
	//console.log("db", user._id)
  const result = await db.collection<User>(COLLECTIONS.USERS).updateOne({ _id: user._id }, { $set: user })
	console.log("db", result)
 // Fetch the updated user to ensure consistency
    const updatedUser = await db.collection<User>(COLLECTIONS.USERS).findOne({ _id: new ObjectId(user._id) });
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    return updatedUser;
} catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
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

  console.log("Content counts:", contentCounts); // Debug: [{ label: "مقالات", count: 2 }, ...]

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
  return result;
}

export async function getContentTypeById(id: string): Promise<ContentType | null> {
  const db = await getDb()
  return db.collection<ContentType>(COLLECTIONS.CONTENT_TYPES).findOne({ _id: new ObjectId(id) })
}

export async function createContentType(contentType: Omit<ContentType, "_id">): Promise<ContentType> {
  const db = await getDb()
  const result = await db.collection<ContentType>(COLLECTIONS.CONTENT_TYPES).insertOne({
    ...contentType,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return { ...contentType, _id: result.insertedId }
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

  return db.collection<Category>(COLLECTIONS.CATEGORIES).find(query).sort({ createdAt: 1 }).toArray()
}

export async function getDefaultCategories(): Promise<Category[]> {
  const db = await getDb()
  return db.collection<Category>(COLLECTIONS.CATEGORIES).find({ isDefault: true }).sort({ createdAt: 1 }).toArray()
}

export async function getCategoriesByContentType(contentTypeId: string): Promise<Category[]> {
  const db = await getDb()
  return db
    .collection<Category>(COLLECTIONS.CATEGORIES)
    .find({ contentTypeId: new ObjectId(contentTypeId), isDefault: false })
    .sort({ createdAt: 1 })
    .toArray()
}

export async function createCategory(category: Omit<Category, "_id">): Promise<Category> {
  const db = await getDb()
  const result = await db.collection<Category>(COLLECTIONS.CATEGORIES).insertOne({
    ...category,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return { ...category, _id: result.insertedId }
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

// Content operations
export async function getAllContent(
  options: {
    published?: boolean
    contentType?: string
    category?: string
    tag?: string
    featured?: boolean
    sortBy?: "newest" | "popular" | "trending"
    limit?: number
    skip?: number
		createdAt?: { $gte: string }
    search?: string
  } = {},
): Promise<Content[]> {
  const { published = true, contentType, category, tag, featured, sortBy = "newest", limit = 10, skip = 0, createdAt, search  } = options

  const db = await getDb()

  // Build query
  const query: any = { published }

  /* if (contentType) {
    query["contentType.name"] = contentType
  } */
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

	/* if (createdAt) {
    query.createdAt = createdAt
  } */

		if (createdAt) {
    query.createdAt = {
      $gte: new Date(createdAt.$gte), // Convert string to Date
    };
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

  return db.collection<Content>(COLLECTIONS.CONTENT).find(query).sort(sort).skip(skip).limit(limit).toArray()
}

export async function getContentById(id: string): Promise<Content | null> {
  const db = await getDb()
  return db.collection<Content>(COLLECTIONS.CONTENT).findOne({ _id: new ObjectId(id) })
}

export async function getContentBySlug(slug: string): Promise<Content | null> {
  const db = await getDb()
  return db.collection<Content>(COLLECTIONS.CONTENT).findOne({ slug })
}

export async function createContent(content: Content): Promise<Content> {
  const db = await getDb()
  const result = await db.collection<Content>(COLLECTIONS.CONTENT).insertOne(content)

  // If content is published, send newsletter to subscribers
  if (content.published) {
    await sendNewsletterForNewContent({ ...content, _id: result.insertedId })
  }

  return { ...content, _id: result.insertedId }
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
  const result = await db.collection(COLLECTIONS.CONTENT).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
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
  return db.collection<Comment>(COLLECTIONS.COMMENTS).find().toArray()
}


export async function getCommentsByContentId(contentId: string): Promise<Comment[]> {
  const db = await getDb()
  return db
    .collection<Comment>(COLLECTIONS.COMMENTS)
    .find({
      contentId: new ObjectId(contentId),
      status: "approved",
    })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function createComment(comment: Comment): Promise<Comment> {
  const db = await getDb()
  const result = await db.collection<Comment>(COLLECTIONS.COMMENTS).insertOne(comment)

  // Increment comment count on the content
  await db.collection(COLLECTIONS.CONTENT).updateOne({ _id: comment.contentId }, { $inc: { commentsCount: 1 } })

  return { ...comment, _id: result.insertedId }
}

export async function updateCommentStatus(id: string, status: "approved" | "rejected"): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection(COLLECTIONS.COMMENTS).updateOne({ _id: new ObjectId(id) }, { $set: { status } })
  return result.modifiedCount > 0
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
  return db
    .collection<Content>(COLLECTIONS.CONTENT)
    .find({ _id: { $in: contentIds } })
    .toArray()
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
  return db
    .collection<Content>(COLLECTIONS.CONTENT)
    .find({ _id: { $in: contentIds } })
    .toArray()
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
      return { ...existingSubscriber, isActive: true, subscribedAt: new Date() }
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
  return { ...subscriber, _id: result.insertedId }
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
  return db.collection<Subscriber>(COLLECTIONS.SUBSCRIBERS).find({ isActive: true }).toArray()
}

export async function logEmail(log: EmailLog): Promise<void> {
  const db = await getDb()
  await db.collection<EmailLog>(COLLECTIONS.EMAIL_LOGS).insertOne(log)
}

// Notification operations
export async function createNotification(notification: Notification): Promise<Notification> {
  const db = await getDb()
  const result = await db.collection<Notification>(COLLECTIONS.NOTIFICATIONS).insertOne(notification)
  return { ...notification, _id: result.insertedId }
}

export async function getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const db = await getDb()
  return db
    .collection<Notification>(COLLECTIONS.NOTIFICATIONS)
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
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

// Helper functions
function generateUnsubscribeToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

async function sendNewsletterForNewContent(content: Content): Promise<void> {
  // This will be implemented with the email service
  console.log(`Sending newsletter for new content: ${content.title}`)
}

// Initialize database with default data if empty
export async function initializeDb() {
  const db = await getDb()

  // Check if content types exist
  const contentTypesCount = await db.collection(COLLECTIONS.CONTENT_TYPES).countDocuments()

  if (contentTypesCount === 0) {
    // Insert default content types
    const defaultContentTypes = [
      { name: "articles", label: "مقالات", icon: "FileText", createdAt: new Date(), updatedAt: new Date() },
      { name: "stories", label: "حواديت", icon: "BookOpen", createdAt: new Date(), updatedAt: new Date() },
      { name: "poetry", label: "شعر", icon: "Music", createdAt: new Date(), updatedAt: new Date() },
      { name: "cinema", label: "سينما", icon: "Video", createdAt: new Date(), updatedAt: new Date() },
      { name: "reflections", label: "تأملات", icon: "Coffee", createdAt: new Date(), updatedAt: new Date() },
      { name: "podcasts", label: "بودكاست", icon: "Mic", createdAt: new Date(), updatedAt: new Date() },
    ]

    const result = await db.collection(COLLECTIONS.CONTENT_TYPES).insertMany(defaultContentTypes)
    const contentTypeIds = Object.values(result.insertedIds)

    // Insert default categories
    const defaultCategories = [
      {
        name: "drama",
        label: "دراما",
        contentTypeId: contentTypeIds[0],
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "comedy",
        label: "كوميدي",
        contentTypeId: contentTypeIds[0],
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "self-development",
        label: "تطوير ذات",
        contentTypeId: contentTypeIds[0],
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection(COLLECTIONS.CATEGORIES).insertMany(defaultCategories)
  }
}
