import { Metadata } from 'next';
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TeamsClient } from "@/components/teams/teams-client";

export const metadata: Metadata = {
  title: 'Teams - Collaborate with Your Distributed Team',
  description: 'Create and manage teams for your distributed organization. Invite members, assign roles, and collaborate effectively across timezones.',
  keywords: [
    'teams',
    'team collaboration',
    'distributed teams',
    'remote teams',
    'team management',
    'team members',
    'collaboration',
    'team roles',
    'project teams',
    'team workspace'
  ],
  openGraph: {
    title: 'Teams - Collaborate with Your Distributed Team | Kaiboard',
    description: 'Create and manage teams for your distributed organization. Invite members, assign roles, and collaborate effectively across timezones.',
    url: '/teams',
    images: [
      {
        url: '/screen/Kaiboard-cover.jpeg',
        width: 1200,
        height: 630,
        alt: 'Kaiboard Teams - Distributed Team Collaboration',
      },
    ],
  },
  twitter: {
    title: 'Teams - Collaborate with Your Distributed Team | Kaiboard',
    description: 'Create and manage teams for your distributed organization.',
  },
  alternates: {
    canonical: '/teams',
  },
};

export default async function TeamsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  // Get all teams where user is a member
  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          customRoles: {
            include: {
              teamRole: true,
            },
          }
        }
      },
      roles: true,
      _count: {
        select: {
          members: true,
          meetings: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Get user's role in each team
  const teamsWithUserRole = teams.map(team => {
    const userMembership = team.members.find(member => member.userId === session.user?.id);
    return {
      ...team,
      createdAt: team.createdAt.toISOString(),
      userRole: userMembership?.role || 'MEMBER',
      members: team.members.map(member => ({
        ...member,
        joinedAt: member.joinedAt.toISOString(),
      })),
    };
  });

  return (
    <div className="container-responsive py-6 lg:py-8">
      <TeamsClient teams={teamsWithUserRole} currentUserId={session.user?.id || ""} />
    </div>
  );
} 