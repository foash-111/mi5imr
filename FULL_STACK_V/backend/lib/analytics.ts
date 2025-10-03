import { getDb, COLLECTIONS, getContentTypes } from './db'
import { ObjectId } from 'mongodb'
import { NextRequest } from 'next/server'

export async function getAnalyticsOverview() {
  const db = await getDb()
  const now = new Date()
  const monthsBack = 12

  // Helper to get YYYY-MM string
  const getMonthStr = (date: Date) => `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}`

  // 1. User signups per month
  const userSignups = await db.collection(COLLECTIONS.USERS).aggregate([
    { $match: { createdAt: { $exists: true } } },
    { $group: {
      _id: { $substr: ["$createdAt", 0, 7] },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]).toArray()

  // 2. Content created per month
  const contentCreated = await db.collection(COLLECTIONS.CONTENT).aggregate([
    { $match: { createdAt: { $exists: true } } },
    { $group: {
      _id: { $substr: ["$createdAt", 0, 7] },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]).toArray()

  // 3. Engagement per month (views, likes, comments)
  // Views: from CONTENT collection
  const viewsPerMonth = await db.collection(COLLECTIONS.CONTENT).aggregate([
    { $match: { createdAt: { $exists: true } } },
    { $group: {
      _id: { $substr: ["$createdAt", 0, 7] },
      views: { $sum: "$viewCount" }
    }},
    { $sort: { _id: 1 } }
  ]).toArray()
  // Likes: from CONTENT_LIKES collection
  const likesPerMonth = await db.collection(COLLECTIONS.CONTENT_LIKES).aggregate([
    { $match: { createdAt: { $exists: true } } },
    { $group: {
      _id: { $substr: ["$createdAt", 0, 7] },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]).toArray()
  // Comments: from COMMENTS collection
  const commentsPerMonth = await db.collection(COLLECTIONS.COMMENTS).aggregate([
    { $match: { createdAt: { $exists: true } } },
    { $group: {
      _id: { $substr: ["$createdAt", 0, 7] },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]).toArray()

  // 4. Top users by activity (sum of content, comments, likes)
  const topUsers = await db.collection(COLLECTIONS.USERS).aggregate([
    { $lookup: {
      from: COLLECTIONS.CONTENT,
      localField: "_id",
      foreignField: "authorId",
      as: "content"
    }},
    { $lookup: {
      from: COLLECTIONS.COMMENTS,
      localField: "_id",
      foreignField: "userId",
      as: "comments"
    }},
    { $lookup: {
      from: COLLECTIONS.CONTENT_LIKES,
      localField: "_id",
      foreignField: "userId",
      as: "likes"
    }},
    { $project: {
      name: 1,
      email: 1,
      activityScore: { $add: [ { $size: "$content" }, { $size: "$comments" }, { $size: "$likes" } ] }
    }},
    { $sort: { activityScore: -1 } },
    { $limit: 5 }
  ]).toArray()

  // 5. Top posts by engagement (likes + comments)
  const topPosts = await db.collection(COLLECTIONS.CONTENT).aggregate([
    { $lookup: {
      from: COLLECTIONS.CONTENT_LIKES,
      localField: "_id",
      foreignField: "contentId",
      as: "likes"
    }},
    { $lookup: {
      from: COLLECTIONS.COMMENTS,
      localField: "_id",
      foreignField: "contentId",
      as: "comments"
    }},
    { $project: {
      title: 1,
      slug: 1,
      engagement: { $add: [ { $size: "$likes" }, { $size: "$comments" } ] }
    }},
    { $sort: { engagement: -1 } },
    { $limit: 5 }
  ]).toArray()

  return {
    userSignups,
    contentCreated,
    viewsPerMonth,
    likesPerMonth,
    commentsPerMonth,
    topUsers,
    topPosts
  }
}

// Helper: get daily time series for views, likes, comments (last 30 days)
export async function getViewsByDay() {
  const db = await getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const views = await db.collection(COLLECTIONS.CONTENT).aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      views: { $sum: "$viewCount" }
    }},
    { $sort: { _id: 1 } }
  ]).toArray();

  return views.map(v => ({ date: v._id, views: v.views }));
}

export async function getLikesByDay() {
  const db = await getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const likes = await db.collection(COLLECTIONS.CONTENT_LIKES).aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      likes: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]).toArray();

  return likes.map(l => ({ date: l._id, likes: l.likes }));
}

export async function getCommentsByDay() {
  const db = await getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const comments = await db.collection(COLLECTIONS.COMMENTS).aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      comments: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]).toArray();

  return comments.map(c => ({ date: c._id, comments: c.comments }));
}

export async function getContentTypeDistribution() {
  const db = await getDb();
  // Fetch all content types
  const allTypes = await db.collection(COLLECTIONS.CONTENT_TYPES).find().toArray();
  // Aggregate post counts by contentType.label
  const pipeline = [
    { $group: { _id: "$contentType.label", value: { $sum: 1 } } },
    { $sort: { value: -1 } }
  ];
  const result = await db.collection(COLLECTIONS.CONTENT).aggregate(pipeline).toArray();
  // Merge: ensure all types are present, fill missing with value: 0
  const merged = allTypes.map(type => {
    const found = result.find(r => r._id === type.label);
    return { name: type.label, value: found ? found.value : 0 };
  });
  return merged;
}

// Get signups by day for a specific month
export async function getSignupsByDay(month?: string) {
  const db = await getDb();
  
  // If month is provided, filter to that month, otherwise get last 30 days
  let matchCondition: any = { createdAt: { $exists: true } };
  let dateRange: Date[] = [];
  
  if (month) {
    // Create proper date boundaries for the month
    const startOfMonth = new Date(month + '-01T00:00:00.000Z');
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    matchCondition.createdAt = {
      $gte: startOfMonth,
      $lte: endOfMonth
    };
    dateRange = [startOfMonth, endOfMonth];
  } else {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    matchCondition.createdAt = { $gte: thirtyDaysAgo };
    dateRange = [thirtyDaysAgo, new Date()];
  }
  
  const signups = await db.collection(COLLECTIONS.USERS).aggregate([
    { $match: matchCondition },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      signups: { $sum: 1 }
    }},
    { $sort: { _id: 1 } },
    { $project: {
      _id: 0,
      date: "$_id",
      signups: 1
    }}
  ]).toArray();

  // If filtering by month, fill in missing days with 0 signups
  if (month && dateRange.length === 2) {
    const [startDate, endDate] = dateRange;
    const allDays: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      allDays.push(currentDate.toISOString().slice(0, 10));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Create a map of existing data
    const signupMap = new Map(signups.map(s => [s.date, s.signups]));
    
    // Fill in missing days with 0 signups
    const completeData = allDays.map(date => ({
      date,
      signups: signupMap.get(date) || 0
    }));
    
    return completeData;
  }

  return signups;
}

// Get signups by month (for backward compatibility)
export async function getSignupsByMonth() {
  const db = await getDb();
  
  const signups = await db.collection(COLLECTIONS.USERS).aggregate([
    { $match: { createdAt: { $exists: true } } },
    { $group: {
      _id: { $substr: ["$createdAt", 0, 7] },
      signups: { $sum: 1 }
    }},
    { $sort: { _id: 1 } },
    { $project: {
      _id: 0,
      month: "$_id",
      signups: 1
    }}
  ]).toArray();

  return signups;
}

// Get top users by number of unique posts liked (include users with zero likes)
export async function getTopUsersByPosts(request: NextRequest) {
  const db = await getDb();
  
  const users = await db.collection(COLLECTIONS.USERS).aggregate([
    { $lookup: {
      from: COLLECTIONS.CONTENT,
      localField: "_id",
      foreignField: "authorId",
      as: "content"
    }},
    { $project: {
      name: 1,
      email: 1,
      posts: { $size: "$content" }
    }},
    { $sort: { posts: -1 } },
    { $limit: 10 }
  ]).toArray();

  return users.map(u => ({ name: u.name, email: u.email, value: u.posts }));
}

// Get top users by number of comments
export async function getTopUsersByComments(request: NextRequest) {
  const db = await getDb();
  
  const users = await db.collection(COLLECTIONS.USERS).aggregate([
    { $lookup: {
      from: COLLECTIONS.COMMENTS,
      localField: "_id",
      foreignField: "userId",
      as: "comments"
    }},
    { $project: {
      name: 1,
      email: 1,
      comments: { $size: "$comments" }
    }},
    { $sort: { comments: -1 } },
    { $limit: 10 }
  ]).toArray();

  return users.map(u => ({ name: u.name, email: u.email, value: u.comments }));
}

// Get top users by number of likes given
export async function getTopUsersByLikes(request: NextRequest) {
  const db = await getDb();
  
  const users = await db.collection(COLLECTIONS.USERS).aggregate([
    { $lookup: {
      from: COLLECTIONS.CONTENT_LIKES,
      localField: "_id",
      foreignField: "userId",
      as: "likes"
    }},
    { $project: {
      name: 1,
      email: 1,
      likes: { $size: "$likes" }
    }},
    { $sort: { likes: -1 } },
    { $limit: 10 }
  ]).toArray();

  return users.map(u => ({ name: u.name, email: u.email, value: u.likes }));
}

// Get top users by views received
export async function getTopUsersByViews(request: NextRequest) {
  const db = await getDb();
  
  const users = await db.collection(COLLECTIONS.USERS).aggregate([
    { $lookup: {
      from: COLLECTIONS.CONTENT,
      localField: "_id",
      foreignField: "authorId",
      as: "content"
    }},
    { $project: {
      name: 1,
      email: 1,
      views: { $sum: "$content.viewCount" }
    }},
    { $sort: { views: -1 } },
    { $limit: 10 }
  ]).toArray();

  return users.map(u => ({ name: u.name, email: u.email, value: u.views }));
}

// Get top users by engagement (posts + comments + likes given)
export async function getTopUsersByEngagement(request: NextRequest) {
  const db = await getDb();
  
  const users = await db.collection(COLLECTIONS.USERS).aggregate([
    { $lookup: {
      from: COLLECTIONS.CONTENT,
      localField: "_id",
      foreignField: "authorId",
      as: "content"
    }},
    { $lookup: {
      from: COLLECTIONS.COMMENTS,
      localField: "_id",
      foreignField: "userId",
      as: "comments"
    }},
    { $lookup: {
      from: COLLECTIONS.CONTENT_LIKES,
      localField: "_id",
      foreignField: "userId",
      as: "likes"
    }},
    { $project: {
      name: 1,
      email: 1,
      engagement: { $add: [ { $size: "$content" }, { $size: "$comments" }, { $size: "$likes" } ] }
    }},
    { $sort: { engagement: -1 } },
    { $limit: 10 }
  ]).toArray();

  return users.map(u => ({ name: u.name, email: u.email, value: u.engagement }));
}

// Paginated versions for analytics charts
export async function getTopUsersByEngagementPaginated(skip: number = 0, limit: number = 10): Promise<[any[], number]> {
  const db = await getDb();
  
  const [users, totalCount] = await Promise.all([
    db.collection(COLLECTIONS.USERS).aggregate([
      { $lookup: {
        from: COLLECTIONS.CONTENT,
        localField: "_id",
        foreignField: "authorId",
        as: "content"
      }},
      { $lookup: {
        from: COLLECTIONS.COMMENTS,
        localField: "_id",
        foreignField: "userId",
        as: "comments"
      }},
      { $lookup: {
        from: COLLECTIONS.CONTENT_LIKES,
        localField: "_id",
        foreignField: "userId",
        as: "likes"
      }},
      { $project: {
        name: 1,
        email: 1,
        engagement: { $add: [ { $size: "$content" }, { $size: "$comments" }, { $size: "$likes" } ] }
      }},
      { $sort: { engagement: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray(),
    db.collection(COLLECTIONS.USERS).countDocuments()
  ]);

  const mappedUsers = users.map(u => ({ 
    name: u.name, 
    email: u.email, 
    engagement: u.engagement 
  }));

  return [mappedUsers, totalCount];
}

export async function getTopUsersByCommentsPaginated(skip: number = 0, limit: number = 10): Promise<[any[], number]> {
  const db = await getDb();
  
  const [users, totalCount] = await Promise.all([
    db.collection(COLLECTIONS.USERS).aggregate([
      { $lookup: {
        from: COLLECTIONS.COMMENTS,
        localField: "_id",
        foreignField: "userId",
        as: "comments"
      }},
      { $project: {
        name: 1,
        email: 1,
        comments: { $size: "$comments" }
      }},
      { $sort: { comments: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray(),
    db.collection(COLLECTIONS.USERS).countDocuments()
  ]);

  const mappedUsers = users.map(u => ({ 
    name: u.name, 
    email: u.email, 
    comments: u.comments 
  }));

  return [mappedUsers, totalCount];
}

export async function getTopUsersByLikesPaginated(skip: number = 0, limit: number = 10): Promise<[any[], number]> {
  const db = await getDb();
  
  const [users, totalCount] = await Promise.all([
    db.collection(COLLECTIONS.USERS).aggregate([
      { $lookup: {
        from: COLLECTIONS.CONTENT_LIKES,
        localField: "_id",
        foreignField: "userId",
        as: "likes"
      }},
      { $project: {
        name: 1,
        email: 1,
        likes: { $size: "$likes" }
      }},
      { $sort: { likes: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray(),
    db.collection(COLLECTIONS.USERS).countDocuments()
  ]);

  const mappedUsers = users.map(u => ({ 
    name: u.name, 
    email: u.email, 
    likes: u.likes 
  }));

  return [mappedUsers, totalCount];
}

export async function getTopPostsByViewsPaginated(skip: number = 0, limit: number = 10): Promise<[any[], number]> {
  const db = await getDb();
  
  const [posts, totalCount] = await Promise.all([
    db.collection(COLLECTIONS.CONTENT).aggregate([
      { $match: { published: true } },
      { $project: {
        title: 1,
        slug: 1,
        views: { $ifNull: ["$viewCount", 0] }
      }},
      { $sort: { views: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray(),
    db.collection(COLLECTIONS.CONTENT).countDocuments({ published: true })
  ]);

  const mappedPosts = posts.map(p => ({ 
    title: p.title, 
    slug: p.slug, 
    views: p.views 
  }));

  return [mappedPosts, totalCount];
}

export async function getTopPostsByLikesPaginated(skip: number = 0, limit: number = 10): Promise<[any[], number]> {
  const db = await getDb();
  
  const [posts, totalCount] = await Promise.all([
    db.collection(COLLECTIONS.CONTENT).aggregate([
      { $match: { published: true } },
      { $lookup: {
        from: COLLECTIONS.CONTENT_LIKES,
        localField: "_id",
        foreignField: "contentId",
        as: "likes"
      }},
      { $project: {
        title: 1,
        slug: 1,
        likes: { $size: "$likes" }
      }},
      { $sort: { likes: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray(),
    db.collection(COLLECTIONS.CONTENT).countDocuments({ published: true })
  ]);

  const mappedPosts = posts.map(p => ({ 
    title: p.title, 
    slug: p.slug, 
    likes: p.likes 
  }));

  return [mappedPosts, totalCount];
}

export async function getTopPostsByCommentsPaginated(skip: number = 0, limit: number = 10): Promise<[any[], number]> {
  const db = await getDb();
  
  const [posts, totalCount] = await Promise.all([
    db.collection(COLLECTIONS.CONTENT).aggregate([
      { $match: { published: true } },
      { $lookup: {
        from: COLLECTIONS.COMMENTS,
        localField: "_id",
        foreignField: "contentId",
        as: "comments"
      }},
      { $project: {
        title: 1,
        slug: 1,
        comments: { $size: "$comments" }
      }},
      { $sort: { comments: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray(),
    db.collection(COLLECTIONS.CONTENT).countDocuments({ published: true })
  ]);

  const mappedPosts = posts.map(p => ({ 
    title: p.title, 
    slug: p.slug, 
    comments: p.comments 
  }));

  return [mappedPosts, totalCount];
}

export async function getTopPostsByEngagementPaginated(skip: number = 0, limit: number = 10): Promise<[any[], number]> {
  const db = await getDb();
  
  const [posts, totalCount] = await Promise.all([
    db.collection(COLLECTIONS.CONTENT).aggregate([
      { $match: { published: true } },
      { $lookup: {
        from: COLLECTIONS.CONTENT_LIKES,
        localField: "_id",
        foreignField: "contentId",
        as: "likes"
      }},
      { $lookup: {
        from: COLLECTIONS.COMMENTS,
        localField: "_id",
        foreignField: "contentId",
        as: "comments"
      }},
      { $project: {
        title: 1,
        slug: 1,
        engagement: { $add: [ { $size: "$likes" }, { $size: "$comments" } ] }
      }},
      { $sort: { engagement: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray(),
    db.collection(COLLECTIONS.CONTENT).countDocuments({ published: true })
  ]);

  const mappedPosts = posts.map(p => ({ 
    title: p.title, 
    slug: p.slug, 
    engagement: p.engagement 
  }));

  return [mappedPosts, totalCount];
}