import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, image, roles } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Team name is required and must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Create the team with the user as owner
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description || null,
        image: image || null,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
        // Create team roles if provided
        roles: roles && roles.length > 0 ? {
          create: roles.map((role: { name: string; color: string }) => ({
            name: role.name,
            color: role.color,
          })),
        } : undefined,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            customRoles: {
              include: {
                teamRole: true,
              },
            },
          },
        },
        roles: true,
        _count: {
          select: {
            members: true,
            meetings: true,
          },
        },
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            customRoles: {
              include: {
                teamRole: true,
              },
            },
          },
        },
        roles: true,
        _count: {
          select: {
            members: true,
            meetings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 