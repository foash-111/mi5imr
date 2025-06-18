// API client functions for frontend
import { User } from "@/backend/models/types";
// Content Types
export async function getContentTypes() {
  const res = await fetch("/api/content-types")
  if (!res.ok) throw new Error("Failed to fetch content types")
  return res.json()
}


/*export async function getAttributes() {
  const response = await fetch("/api/categories")
  if (!response.ok) throw new Error("Failed to fetch attributes")
  return response.json() // Returns [{ id: string, label: string, count: number }, ...]
}*/

export async function createContentType(data: { name: string; label: string; icon: string }) {
  const res = await fetch("/api/content-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create content type")
  return res.json()
}

export async function updateContentType(id: string, data: { label: string; icon: string }) {
  const res = await fetch(`/api/content-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update content type")
  return res.json()
}

export async function deleteContentType(id: string) {
  const res = await fetch(`/api/content-types/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete content type")
  return res.json()
}

// Categories
export async function getCategories() {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

export async function createCategory(data: { name: string; label: string; icon: string }) {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create category")
  return res.json()
}

export async function updateCategory(id: string, data: { label: string; icon: string }) {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update category")
  return res.json()
}

export async function deleteCategory(id: string) {
  const res = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete category")
  return res.json()
}

// Content
export async function getContent(
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
) {
  const params = new URLSearchParams()

  if (options.published !== undefined) params.append("published", options.published.toString())
  //if (options.contentType) params.append("contentType", options.contentType)
  if (options.contentType) {
  if (Array.isArray(options.contentType)) {
    options.contentType.forEach((type) => {
      params.append("contentType", type)
    })
  } else {
    params.append("contentType", options.contentType)
  }
}
  if (options.category) params.append("category", options.category)
  if (options.tag) params.append("tag", options.tag)
  if (options.featured !== undefined) params.append("featured", options.featured.toString())
  if (options.sortBy) params.append("sortBy", options.sortBy)
  if (options.limit) params.append("limit", options.limit.toString())
  if (options.skip) params.append("skip", options.skip.toString())
	if (options.createdAt) params.append("createdAt", JSON.stringify(options.createdAt))
  if (options.search) params.append("q", options.search)

	console.log("API request URL:", `/api/content?${params.toString()}`)
  const res = await fetch(`/api/content?${params.toString()}`)
  if (!res.ok) throw new Error("Failed to fetch content")
  return res.json()
}

export async function getContentById(id: string) {
  const res = await fetch(`/api/content/${id}`)
  if (!res.ok) throw new Error("Failed to fetch content")
  return res.json()
}

export async function getContentBySlug(slug: string) {
  const res = await fetch(`/api/content/slug/${slug}`)
  if (!res.ok) throw new Error("Failed to fetch content")
  return res.json()
}


export async function createContent(formData: FormData) {
  const res = await fetch("/api/content", {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to create content")
  }
  return res.json()
}

export async function updateContent(id: string, formData: FormData) {
		console.log("Loaded /api/content route file");
  const res = await fetch(`/api/content/${id}`, {
    method: "PUT",
    body: formData,
  })
  if (!res.ok) {
		const errorData = await res.json()
    throw new Error(errorData.error || "Failed to update content")
	}
  return res.json()
}

export async function deleteContent(id: string) {
  const res = await fetch(`/api/content/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete content")
  return res.json()
}

// Comments
export async function getCommentsByContentId(contentId: string) {
  const res = await fetch(`/api/comments?contentId=${contentId}`)
  if (!res.ok) throw new Error("Failed to fetch comments")
  return res.json()
}


export async function createComment(data: { contentId: string; content: string; parentId?: string }) {
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create comment")
  return res.json()
}

export async function updateCommentStatus(id: string, status: "approved" | "rejected") {
  const res = await fetch(`/api/comments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error("Failed to update comment status")
  return res.json()
}

export async function deleteComment(id: string) {
  const res = await fetch(`/api/comments/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete comment")
  return res.json()
}

// Likes
export async function toggleLike(contentId: string) {
  const res = await fetch("/api/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentId }),
  })
  if (!res.ok) throw new Error("Failed to toggle like")
  return res.json()
}

export async function checkLikeStatus(contentId: string) {
  const res = await fetch(`/api/likes?contentId=${contentId}`)
  if (!res.ok) throw new Error("Failed to check like status")
  return res.json()
}

// Bookmarks
export async function toggleBookmark(contentId: string) {
  const res = await fetch("/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentId }),
  })
  if (!res.ok) throw new Error("Failed to toggle bookmark")
  return res.json()
}

export async function getUserBookmarks() {
  const res = await fetch("/api/bookmarks", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("Failed to fetch bookmarks")
  return res.json()
}

export async function getUserLikes() {
  const res = await fetch("/api/likes")
  if (!res.ok) throw new Error("Failed to fetch likes")
  return res.json()
}

export async function deactivateUserStatus(status: boolean) {
  const res = await fetch('/api/deactivate-user-status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }), // Changed to match server-side expectation
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update user status');
  }

  return res.json();
}


export async function updateUser(id: string, data: Partial<User>) {
  const res = await fetch(`/profile/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include', // Include cookies for next-auth
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  return res.json();
}

export async function getDashboard() {
	const res = await fetch(`/api/dashboard`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies for next-auth
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to GET users');
  }
  return res.json();
	
}

export async function deleteUser(id: string) {
  const res = await fetch(`/profile/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete profile');
  }
  return res.json();
}



export async function updateAvatar(id: string, formData: FormData) {
	try{
		const res = await fetch(`/profile/${id}`, {
			method: 'POST',
			body: formData,
			credentials: 'include', // Include cookies for next-auth
		});
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.error || 'Failed to update profile');
		}
		return res.json();
} catch (error) {
    console.error('Error in updateAvatar:', error);
    throw error;
  }
}
