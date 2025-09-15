import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  grade: z.string().optional(),
  contact: z.string().optional(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// GET /api/profile - Get user profile
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        bio: true,
        grade: true,
        contact: true,
        githubUrl: true,
        userTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        bio: validatedData.bio || null,
        grade: validatedData.grade || null,
        contact: validatedData.contact || null,
        githubUrl: validatedData.githubUrl || null,
      },
      select: {
        name: true,
        bio: true,
        grade: true,
        contact: true,
        githubUrl: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
