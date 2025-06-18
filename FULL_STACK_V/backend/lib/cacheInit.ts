// lib/cacheInit.ts
import redis, { connectRedis } from "./redis";
import { getContentTypes, getAllContent, getCategories, getAllUsers } from "./db"; 

let hasInitialized = false;

export async function ensureInitialCache() {
  if (hasInitialized) return; // already initialized in memory

  await connectRedis();

  const flag = await redis.get("app_cache_initialized");
  if (flag) {
    hasInitialized = true;
    return;
  }

  // Your expensive DB fetches
  const feedData = await getAllContent();
  const contentTypes = await getContentTypes();
	const categories = await getCategories();
	const users = await getAllUsers(); // Assuming you have a function to get all users

  await redis.set("feedData", JSON.stringify(feedData));
  await redis.set("contentTypes", JSON.stringify(contentTypes));
	await redis.set("categories", JSON.stringify(categories));
	await redis.set("users", JSON.stringify(users));

  await redis.set("app_cache_initialized", "true"); // Set init flag
  hasInitialized = true;

  console.log("✅ Cached initial data in Redis");
}
