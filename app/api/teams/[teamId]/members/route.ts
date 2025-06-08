import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  const params = await context.params;
  
  console.log('🔥 API: Invite member request received', {
    teamId: params.teamId,
    timestamp: new Date().toISOString()
  });

  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log('❌ API: Unauthorized request - no session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('👤 API: Request authenticated', {
      inviterId: session.user.id,
      inviterEmail: session.user.email
    });

    // Check if user has permission to invite members
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
      console.log('❌ API: Insufficient permissions', {
        teamId: params.teamId,
        userId: session.user.id,
        userRole: 'none'
      });
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    console.log('✅ API: Permission check passed', {
      inviterRole: membership.role
    });

    const body = await request.json();
    const { email, role, customRoleIds } = body;

    console.log('📋 API: Request body parsed', {
      email,
      role,
      customRoleIds: customRoleIds?.length || 0
    });

    if (!email || !role) {
      console.log('❌ API: Missing required fields', { email: !!email, role: !!role });
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ API: User not found', { email });
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    console.log('👤 API: Target user found', {
      userId: user.id,
      userName: user.name
    });

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: user.id,
      },
    });

    if (existingMember) {
      console.log('❌ API: User already a member', {
        userId: user.id,
        existingRole: existingMember.role
      });
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      );
    }

    console.log('🔄 API: Starting database transaction');

    // Add the user to the team using transaction to handle custom roles
    const newMember = await prisma.$transaction(async (tx) => {
      console.log('➕ API: Creating team member record');
      
      // Create the team member
      const member = await tx.teamMember.create({
        data: {
          teamId: params.teamId,
          userId: user.id,
          role: role,
        },
      });

      console.log('✅ API: Team member created', {
        memberId: member.id,
        role: member.role
      });

      // Add custom roles if provided
      if (customRoleIds && customRoleIds.length > 0) {
        console.log('🏷️ API: Adding custom roles', {
          customRoleIds,
          count: customRoleIds.length
        });
        
        await tx.teamMemberCustomRole.createMany({
          data: customRoleIds.map((roleId: string) => ({
            teamMemberId: member.id,
            teamRoleId: roleId,
          })),
        });

        console.log('✅ API: Custom roles added successfully');
      }

      // Return the member with all relations
      const memberWithRelations = await tx.teamMember.findFirst({
        where: { id: member.id },
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

      console.log('✅ API: Member invitation completed successfully', {
        memberId: member.id,
        email: user.email,
        role: member.role,
        customRolesCount: memberWithRelations?.customRoles.length || 0
      });

      return memberWithRelations;
    });

    return NextResponse.json(newMember);
  } catch (error) {
    console.error("❌ API: Error inviting member", {
      teamId: params.teamId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 