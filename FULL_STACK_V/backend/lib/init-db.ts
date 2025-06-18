import { initializeDb } from "./db"

export async function initDb() {
  try {
    await initializeDb()
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}
