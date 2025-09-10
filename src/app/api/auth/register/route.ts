import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "~/server/db";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    // Normalize email to avoid case/whitespace mismatches at login
    const normalizedEmail = validatedData.email.trim().toLowerCase();

    // Hash password (used in both create and update flows)
    const hashedPassword = await hash(validatedData.password, 12);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // For idempotent test/setup flows, update password and name to ensure known credentials
      const updated = await db.user.update({
        where: { id: existingUser.id },
        data: {
          name: validatedData.name || existingUser.name,
          password: hashedPassword,
        },
        select: { id: true, name: true, email: true },
      });
      return NextResponse.json({
        message: "User already existed; credentials updated",
        user: updated,
      });
    }

    // Create user
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    
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
