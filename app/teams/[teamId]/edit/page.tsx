import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { TeamSettingsClient } from "@/components/teams/team-settings-client";

export default async function TeamSettingsPage({ params }: { params: Promise<{ teamId: string }> }) {
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
          role: {
            in: ['OWNER', 'ADMIN'], // Only owners and admins can access settings
          },
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
        orderBy: [
          { role: 'asc' },
          { joinedAt: 'asc' },
        ],
      },
      roles: {
        orderBy: {
          createdAt: 'asc',
        },
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
    <div className="container-responsive py-6 lg:py-8 max-w-4xl">
      <TeamSettingsClient 
        team={{
          ...team,
          createdAt: team.createdAt.toISOString(),
          userRole,
          members: team.members.map(member => ({
            ...member,
            joinedAt: member.joinedAt.toISOString(),
          })),
        }} 
        currentUserId={session.user?.id || ""} 
      />
    </div>
  );
} 