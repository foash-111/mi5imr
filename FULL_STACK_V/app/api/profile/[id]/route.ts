import { type NextRequest, NextResponse } from "next/server";
import { updateUser, deleteUser, getUserByEmail, getUserById } from "@/backend/lib/db";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { User } from "@/backend/models/types";
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

// Example: Save images to a local directory (replace with S3/Cloudinary for production)
const uploadDir = path.join(process.cwd(), 'public/uploads');

export const config = {
  api: {
    bodyParser: false, // Important! Disables Next.js's default body parser
  },
};

// PUT /api/profile/[id] - Update a user profile
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate ID
    if (!ObjectId.isValid(awaitedParams.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const data = await request.json();
    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    if (data.email !== session.user.email) {
      return NextResponse.json({ error: "You can only update your own profile" }, { status: 403 });
    }

    // Fetch existing user to preserve other fields
    const existingUser = await getUserById(awaitedParams.id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData: User = {
      ...existingUser,
      ...data,
    };
    
    // Remove _id from userData since it's immutable in MongoDB
    const { _id, ...userDataWithoutId } = userData;
    
    const updatedUser = await updateUser({ _id: new ObjectId(awaitedParams.id), ...userDataWithoutId });
    if (!updatedUser._id) {
      return NextResponse.json({ error: "No edits Done" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/profile/[id] - Delete a user profile
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(awaitedParams.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await getUserById(awaitedParams.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.email !== session.user.email) {
      return NextResponse.json({ error: "You can only delete your own profile" }, { status: 403 });
    }

    const deleted = await deleteUser(awaitedParams.id);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

// POST /api/profile/[id] - Update user avatar
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(awaitedParams.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File;
    
    if (!avatarFile) {
      return NextResponse.json({ error: "No avatar file provided" }, { status: 400 });
    }

    // Validate file type
    if (!avatarFile.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (avatarFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Ensure user can only update their own avatar
    const user = await getUserByEmail(session.user.email);
    if (!user || user._id?.toString() !== awaitedParams.id) {
      return NextResponse.json({ error: "You can only update your own avatar" }, { status: 403 });
    }

    // Convert file to buffer
    const bytes = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = avatarFile.name.split('.').pop();
    const fileName = `${awaitedParams.id}-${Date.now()}.${fileExtension}`;

    // Upload to local directory
    const filePath = path.join(uploadDir, fileName);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);

    const avatarUrl = `/uploads/${fileName}`;

    // Update user with new avatar URL
    const updatedUser = await updateUser({ 
      _id: new ObjectId(awaitedParams.id), 
      avatar: avatarUrl 
    });

    if (!updatedUser._id) {
      return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
    }

    return NextResponse.json({ avatarUrl });
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
  }
}

// GET /api/profile/[id] - Get a user profile
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
} 