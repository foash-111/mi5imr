import { type NextRequest, NextResponse } from "next/server";
import { updateUser, deleteUser, getUserByEmail, getUserById } from "@/backend/lib/db";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { User } from "@/backend/models/types";


// PUT /api/deactivate-user-status - Update a user status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user by email from session
    const existingUser = await getUserByEmail(session.user.email);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request body
    const { status } = await request.json();
    if (typeof status !== "boolean") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Update only the status field, passing the user object with _id
    const userData: Partial<User> = {
      _id: existingUser._id,
      status,
    };

    const updatedUser = await updateUser(userData);
    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}
