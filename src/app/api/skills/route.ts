import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.number().min(1).max(5),
  yearsOfExp: z.number().min(0).max(50).optional(),
});

// GET /api/skills - Get user skills
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userSkills = await db.userSkill.findMany({
      where: { userId: session.user.id },
      include: {
        skill: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    const formattedSkills = userSkills.map((userSkill: typeof userSkills[0]) => ({
      id: userSkill.id,
      skillId: userSkill.skillId,
      name: userSkill.skill.name,
      level: userSkill.level,
      yearsOfExp: userSkill.yearsOfExp,
    }));

    return NextResponse.json(formattedSkills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/skills - Add new skill
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = skillSchema.parse(body);

    // Check if user already has this skill
    const existingUserSkill = await db.userSkill.findFirst({
      where: {
        userId: session.user.id,
        skill: {
          name: validatedData.name
        }
      }
    });

    if (existingUserSkill) {
      return NextResponse.json(
        { message: "You already have this skill" },
        { status: 400 }
      );
    }

    // Find or create the skill
    let skill = await db.skill.findFirst({
      where: {
        name: validatedData.name
      }
    });

    if (!skill) {
      skill = await db.skill.create({
        data: {
          name: validatedData.name,
          category: null, // Can be enhanced later to categorize skills
        },
      });
    }

    // Create the user skill relationship
    const userSkill = await db.userSkill.create({
      data: {
        userId: session.user.id,
        skillId: skill.id,
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
      id: userSkill.id,
      skillId: userSkill.skillId,
      name: userSkill.skill.name,
      level: userSkill.level,
      yearsOfExp: userSkill.yearsOfExp,
    };

    return NextResponse.json(formattedSkill);
  } catch (error) {
    console.error("Error adding skill:", error);
    
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