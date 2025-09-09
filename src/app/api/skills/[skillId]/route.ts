import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const skillUpdateSchema = z.object({
  level: z.number().min(1).max(5),
  yearsOfExp: z.number().min(0).max(50).optional(),
});

// PUT /api/skills/[skillId] - Update user skill
export async function PUT(
  request: NextRequest,
  { params }: { params: { skillId: string } }
) {
  try {
    const session = await auth();
    
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
        id: params.skillId,
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
      where: { id: params.skillId },
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
  { params }: { params: { skillId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the skill belongs to the user
    const existingUserSkill = await db.userSkill.findFirst({
      where: {
        id: params.skillId,
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
      where: { id: params.skillId },
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