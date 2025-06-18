import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  avatar?: string
  isAdmin: boolean
  createdAt: Date
}

export interface ContentType {
  _id?: ObjectId
  name: string
  label: string
  icon: string
  createdAt: Date
  updatedAt?: Date
}

export interface Category {
  _id?: ObjectId
  name: string
  label: string
  contentTypeId: ObjectId // Link to content type
  isDefault: boolean // Whether it's a default category (available to all content types)
  createdAt: Date
  updatedAt?: Date
}

export interface Tag {
  _id?: ObjectId
  name: string
  createdAt: Date
}

export interface Content {
  _id?: ObjectId
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  author: {
    _id: ObjectId
    name: string
    avatar?: string
  }
  contentType: {
    _id: ObjectId
    name: string
    label: string
    icon: string
  }
  categories: Array<{
    _id: ObjectId
    name: string
    label: string
    isDefault: boolean
  }>
  tags: string[]
  externalUrl?: string
  published: boolean
  featured: boolean
  viewCount: number
  likesCount: number
  commentsCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  _id?: ObjectId
  contentId: ObjectId
  userId: ObjectId
  userName: string
  userAvatar?: string
  parentId?: ObjectId
  content: string
  likes: number
  createdAt: Date
  status: "pending" | "approved" | "rejected"
}

export interface ContentLike {
  userId: ObjectId
  contentId: ObjectId
  createdAt: Date
}

export interface CommentLike {
  userId: ObjectId
  commentId: ObjectId
  createdAt: Date
}

export interface Bookmark {
  userId: ObjectId
  contentId: ObjectId
  createdAt: Date
}

// Newsletter Integration
export interface Subscriber {
  _id?: ObjectId
  email: string
  isActive: boolean
  subscribedAt: Date
  unsubscribedAt?: Date
  unsubscribeToken: string
}

export interface EmailLog {
  _id?: ObjectId
  subscriberId: ObjectId
  contentId?: ObjectId
  emailType: "newsletter" | "notification" | "welcome"
  subject: string
  status: "sent" | "failed" | "pending"
  sentAt?: Date
  error?: string
}

// Notification System
export interface Notification {
  _id?: ObjectId
  userId: ObjectId
  type: "new_post" | "comment_reply" | "content_like" | "comment_like"
  title: string
  message: string
  contentId?: ObjectId
  commentId?: ObjectId
  isRead: boolean
  createdAt: Date
}
