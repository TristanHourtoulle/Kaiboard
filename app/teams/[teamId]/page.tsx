import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { TeamManagementClient } from "@/components/teams/team-management-client";

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  const team = await prisma.team.findFirst({
    where: {
      id: resolvedParams.teamId,
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
    notFound();
  }

  // Get user's role in the team
  const userMembership = team.members.find(member => member.userId === session.user?.id);
  const userRole = userMembership?.role || 'MEMBER';

  return (
    <div className="container mx-auto py-8">
      <TeamManagementClient 
        team={{
          ...team,
          createdAt: team.createdAt.toISOString(),
          userRole,
          members: team.members.map(member => ({
            ...member,
            joinedAt: member.joinedAt.toISOString(),
          })),
          meetings: team.meetings.map(meeting => ({
            ...meeting,
            startTime: meeting.startTime.toISOString(),
            endTime: meeting.endTime.toISOString(),
          })),
        }} 
        currentUserId={session.user?.id || ""} 
      />
    </div>
  );
} 