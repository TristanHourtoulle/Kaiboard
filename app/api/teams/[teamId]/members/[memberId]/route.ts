import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage members
    const userMembership = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Get the member to update
    const memberToUpdate = await prisma.teamMember.findFirst({
      where: {
        id: params.memberId,
        teamId: params.teamId,
      },
    });

    if (!memberToUpdate) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const body = await request.json();
    const { role, customRoleIds } = body;

    // Prevent updating the owner's role (but allow custom role updates)
    if (memberToUpdate.role === 'OWNER' && role && role !== 'OWNER') {
      return NextResponse.json({ error: "Cannot change owner's permission level" }, { status: 400 });
    }

    // Only owners can promote to admin
    if (userMembership.role !== 'OWNER' && role === 'ADMIN') {
      return NextResponse.json({ error: "Only owners can promote members to admin" }, { status: 403 });
    }

    // Update the member using a transaction to handle both role and custom roles
    const updatedMember = await prisma.$transaction(async (tx) => {
      // Update the member's role if provided
      const member = await tx.teamMember.update({
        where: { id: params.memberId },
        data: {
          role: role || memberToUpdate.role,
        },
      });

      // Handle custom roles if provided
      if (customRoleIds !== undefined) {
        // Remove all existing custom roles
        await tx.teamMemberCustomRole.deleteMany({
          where: { teamMemberId: params.memberId },
        });

        // Add new custom roles
        if (customRoleIds && customRoleIds.length > 0) {
          // Validate that all role IDs exist and belong to this team
          const validRoles = await tx.teamRole.findMany({
            where: {
              id: { in: customRoleIds },
              teamId: params.teamId,
            },
          });

          if (validRoles.length !== customRoleIds.length) {
            throw new Error("One or more custom roles not found or don't belong to this team");
          }

          await tx.teamMemberCustomRole.createMany({
            data: customRoleIds.map((roleId: string) => ({
              teamMemberId: params.memberId,
              teamRoleId: roleId,
            })),
          });
        }
      }

      // Return the updated member with all relations
      return tx.teamMember.findFirst({
        where: { id: params.memberId },
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
      });
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating member:", error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("custom roles not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage members
    const userMembership = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Get the member to remove
    const memberToRemove = await prisma.teamMember.findFirst({
      where: {
        id: params.memberId,
        teamId: params.teamId,
      },
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent removing the owner
    if (memberToRemove.role === 'OWNER') {
      return NextResponse.json({ error: "Cannot remove team owner" }, { status: 400 });
    }

    // Remove the member
    await prisma.teamMember.delete({
      where: { id: params.memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 