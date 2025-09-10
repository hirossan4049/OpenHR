import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";
import { skillUpdateSchema } from "~/lib/validation/skill";

// PUT /api/skills/[skillId] - Update user skill
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const session = await auth();
    const { skillId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = skillUpdateSchema.parse(body);

    // Verify the skill belongs to the user
    const existingUserSkill = await db.userSkill.findFirst({
      where: {
        id: skillId,
        userId: session.user.id,
      },
    });

    if (!existingUserSkill) {
      return NextResponse.json(
        { message: "Skill not found" },
        { status: 404 }
      );
    }

    const updatedUserSkill = await db.userSkill.update({
      where: { id: skillId },
      data: {
        level: validatedData.level,
        yearsOfExp: validatedData.yearsOfExp,
      },
      include: {
        skill: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedSkill = {
      id: updatedUserSkill.id,
      skillId: updatedUserSkill.skillId,
      name: updatedUserSkill.skill.name,
      level: updatedUserSkill.level,
      yearsOfExp: updatedUserSkill.yearsOfExp,
    };

    return NextResponse.json(formattedSkill);
  } catch (error) {
    console.error("Error updating skill:", error);
    
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

// DELETE /api/skills/[skillId] - Remove user skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const session = await auth();
    const { skillId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the skill belongs to the user
    const existingUserSkill = await db.userSkill.findFirst({
      where: {
        id: skillId,
        userId: session.user.id,
      },
    });

    if (!existingUserSkill) {
      return NextResponse.json(
        { message: "Skill not found" },
        { status: 404 }
      );
    }

    await db.userSkill.delete({
      where: { id: skillId },
    });

    return NextResponse.json({ message: "Skill removed successfully" });
  } catch (error) {
    console.error("Error removing skill:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}