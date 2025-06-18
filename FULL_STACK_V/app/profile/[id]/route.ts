import { type NextRequest, NextResponse } from "next/server";
import { updateUser, deleteUser, getUserByEmail, getUserById } from "@/backend/lib/db";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { User } from "@/backend/models/types";
import { writeFile } from 'fs/promises';
import path from 'path';
import { readFile } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

// PUT /api/profile/[id] - Update a user profile
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
		// console.log("body",data)
    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    if (data.email !== session.user.email) {
      return NextResponse.json({ error: "You can only update your own profile" }, { status: 403 });
    }

    // Fetch existing user to preserve other fields
    const existingUser = await getUserById(awaitedParams.id);
		//console.log("user exist",existingUser)
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData: User = {
			...existingUser,
      ...data,
    };
    
		//console.log("user ddata in routes", userData)
    const updatedUser = await updateUser(userData);
		console.log(updatedUser)
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
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {

		//console.log('Deleting profile user profile rute page:', params.id, user._id);
    const awaitedParams = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate ID
    if (!ObjectId.isValid(awaitedParams.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Ensure user can only delete their own profile

    const user = await getUserByEmail(session.user.email);
    if (!user || user._id?.toString() !== awaitedParams.id) {
      return NextResponse.json({ error: "You can only delete your own profile" }, { status: 403 });
    }

    const deletedUser = await deleteUser(awaitedParams.id);
		console.log("routes", deletedUser)
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}


// Example: Save images to a local directory (replace with S3/Cloudinary for production)
const uploadDir = path.join(process.cwd(), 'public/uploads');


export const config = {
  api: {
    bodyParser: false, // Important! Disables Next.js's default body parser
  },
};


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ObjectId.isValid(awaitedParams.id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

		const formData = await request.formData();
  	const file = formData.get('avatar') as File | null;;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileExtension = path.extname(file.name || '');
    const fileName = `${awaitedParams.id}-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
   
		// Read the file as a buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// ...inside your POST handler, before writeFile:
		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, buffer);

		// Write the file to disk
		await writeFile(filePath, buffer);

    const avatarUrl = `/uploads/${fileName}`;

    const userToUpdate: Partial<User> = {
      _id: new ObjectId(awaitedParams.id),
      avatar: avatarUrl,
    };

    const updatedUser = await updateUser(userToUpdate);
    if (!updatedUser._id) {
      return NextResponse.json({ error: "Can't upload the image" }, { status: 404 });
    }

    return NextResponse.json({ avatarUrl });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}
