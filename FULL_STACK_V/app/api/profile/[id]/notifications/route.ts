import { type NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/backend/lib/db";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

// PUT /api/profile/[id]/notifications - Update email notification preferences
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(awaitedParams.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const data = await request.json();
    const { emailNotifications } = data;

    if (!emailNotifications) {
      return NextResponse.json({ error: "Email notifications data is required" }, { status: 400 });
    }

    // Validate email notifications structure
    const requiredFields = ['newsletter'];
    for (const field of requiredFields) {
      if (typeof emailNotifications[field] !== 'boolean') {
        return NextResponse.json({ error: `Invalid ${field} notification setting` }, { status: 400 });
      }
    }

    // Update user with email notification preferences
    const updatedUser = await updateUser({ 
      _id: new ObjectId(awaitedParams.id), 
      emailNotifications 
    });

    if (!updatedUser._id) {
      return NextResponse.json({ error: "Failed to update email notifications" }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailNotifications });
  } catch (error: any) {
    console.error("Error updating email notifications:", error);
    return NextResponse.json({ error: "Failed to update email notifications" }, { status: 500 });
  }
} 