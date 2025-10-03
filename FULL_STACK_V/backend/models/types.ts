import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  avatar?: string
  isAdmin: boolean
  createdAt: Date
  updatedAt?: Date
  bio?: string
  status?: boolean // User status (active, inactive, etc.)
  username?: string // Optional username for user profile
  image?: string // Optional image URL for user profile
  lastLogin?: Date // Optional field to track last login time
  emailNotifications?: {
    newsletter: boolean
  }
  socialLinks?: {
    twitter?: string
    facebook?: string
    youtube?: string
    instagram?: string
    linkedin?: string
    [key: string]: string | undefined
  }
  about?: {
    bio?: string
    image?: string
    [key: string]: any
  }
}

export interface ContentType {
  _id?: ObjectId
  label: string // The display name (الاسم المعروض) - used as unique identifier
  icon: string
  createdAt: Date
  updatedAt?: Date
}

export interface Category {
  _id?: ObjectId
  label: string // The display name (الاسم المعروض) - used as unique identifier
  contentTypeId?: ObjectId // Link to content type (optional for default categories)
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
    label: string
    icon: string
  }
  categories: Array<{
    _id: ObjectId
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
  userEmail?: string
  parentId?: ObjectId
  content: string
  likes: number
  createdAt: Date
  status: "pending" | "approved" | "rejected"
	isLiked?: boolean
  replies?: Comment[]
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
  type: "new_post" | "comment_reply" | "content_like" | "comment_like" | "content_comment"
  title: string
  message: string
  contentId?: ObjectId
  commentId?: ObjectId
  slug?: string
  isRead: boolean
  createdAt: Date
}

// Feedback System
export interface Feedback {
  _id?: ObjectId
  name: string
  email: string // Email address of the feedback sender
  role: string
  message: string
  status: "pending" | "approved" | "replied" | "archived"
  isPublic: boolean // Whether to show on feedback wall
  createdAt: Date
  updatedAt?: Date
  adminNotes?: string // Admin notes for internal use
}

// Contact System
export interface ContactMessage {
  _id?: ObjectId
  name: string
  email: string
  subject: string
  message: string
  status: "unread" | "read" | "replied" | "archived"
  createdAt: Date
  updatedAt?: Date
  adminReply?: string // Admin's reply to the contact message
  repliedAt?: Date
  repliedBy?: ObjectId // Admin who replied
}

// Site Settings (Contact Info)
export interface Settings {
  _id?: ObjectId
  contactEmail: string
  contactPhone: string
  contactLocation: {
    address: string
    mapUrl?: string
    embedUrl?: string
  }
  socialLinks?: {
    twitter?: string
    facebook?: string
    youtube?: string
    instagram?: string
    linkedin?: string
    [key: string]: string | undefined
  }
  about?: {
    bio?: string
    image?: string
    [key: string]: any
  }
  updatedAt?: Date
  updatedBy?: ObjectId
}
