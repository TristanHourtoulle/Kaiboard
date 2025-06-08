import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ teamId: string; roleId: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage roles
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
    const { name, color } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: "Name and color are required" },
        { status: 400 }
      );
    }

    // Check if role exists and belongs to this team
    const existingRole = await prisma.teamRole.findFirst({
      where: {
        id: params.roleId,
        teamId: params.teamId,
      },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Check if another role with this name already exists for this team (excluding current role)
    const duplicateRole = await prisma.teamRole.findFirst({
      where: {
        teamId: params.teamId,
        name: name.trim(),
        id: {
          not: params.roleId,
        },
      },
    });

    if (duplicateRole) {
      return NextResponse.json(
        { error: "A role with this name already exists" },
        { status: 400 }
      );
    }

    // Update the role
    const updatedRole = await prisma.teamRole.update({
      where: { id: params.roleId },
      data: {
        name: name.trim(),
        color: color,
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ teamId: string; roleId: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage roles
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

    // Check if role exists and belongs to this team
    const existingRole = await prisma.teamRole.findFirst({
      where: {
        id: params.roleId,
        teamId: params.teamId,
      },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Remove the role from all team members who have it, then delete the role
    await prisma.$transaction([
      prisma.teamMemberCustomRole.deleteMany({
        where: {
          teamRoleId: params.roleId,
        },
      }),
      prisma.teamRole.delete({
        where: { id: params.roleId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 