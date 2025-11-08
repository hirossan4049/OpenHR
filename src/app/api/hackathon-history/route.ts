import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hackathonHistory = await db.hackathonParticipation.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        participatedAt: 'desc',
      },
    });

    return NextResponse.json(hackathonHistory);
  } catch (error) {
    console.error("Error fetching hackathon history:", error);
    return NextResponse.json(
      { error: "Failed to fetch hackathon history" },
      { status: 500 }
    );
  }
}