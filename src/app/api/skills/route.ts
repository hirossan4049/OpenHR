import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";
import { skillCreateSchema } from "~/lib/validation/skill";

// GET /api/skills - Get user skills
function redirectToLogin(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/api/auth/signin", request.url));
  const cookiesToClear = [
    // NextAuth v4 legacy
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.callback-url",
    "next-auth.csrf-token",
    // Auth.js v5 (NextAuth v5)
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.callback-url",
    "authjs.csrf-token",
  ];
  cookiesToClear.forEach((name) => res.cookies.delete(name));
  return res;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) return redirectToLogin(request);

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
    
    if (!session?.user?.id) return redirectToLogin(request);

    const body = await request.json();
    const validatedData = skillCreateSchema.parse(body);

    // Normalize name and slug
    const name = validatedData.name.trim();
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    // Ensure the user exists in DB (tokens can outlive user records in dev)
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return redirectToLogin(request);

    // Check if user already has this skill
    const existingUserSkill = await db.userSkill.findFirst({
      where: {
        userId: session.user.id,
        skill: {
          OR: [
            { slug },
            { name },
          ]
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
        OR: [
          { slug },
          { name },
        ]
      }
    });

    if (!skill) {
      skill = await db.skill.create({
        data: {
          name,
          slug,
          category: null, // Can be enhanced later to categorize skills
          verified: false,
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
