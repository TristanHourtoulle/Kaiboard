import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = await prisma.team.findFirst({
      where: {
        id: params.teamId,
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
                timezone: true,
              },
            },
            customRoles: {
              include: {
                teamRole: true,
              },
            },
          },
          orderBy: [
            { role: 'asc' }, // OWNER first, then ADMIN, then MEMBER
            { joinedAt: 'asc' },
          ],
        },
        roles: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        meetings: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
          orderBy: {
            startTime: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            members: true,
            meetings: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Get user's role in the team
    const userMembership = team.members.find(member => member.userId === session.user?.id);
    
    return NextResponse.json({
      ...team,
      userRole: userMembership?.role,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is owner or admin
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, image } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Team name is required and must be at least 2 characters" },
        { status: 400 }
      );
    }

    const updatedTeam = await prisma.team.update({
      where: { id: params.teamId },
      data: {
        name: name.trim(),
        description: description || null,
        image: image || null,
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

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is owner
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        role: 'OWNER',
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Only team owners can delete teams" }, { status: 403 });
    }

    // Delete the team (cascade will handle related records)
    await prisma.team.delete({
      where: { id: params.teamId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 