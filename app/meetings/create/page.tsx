import { auth } from "@/auth";
import { CreateMeetingClient } from "@/components/meetings/create-meeting-client";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CreateMeetingPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/");
  }

  // Get teams for the user
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teams: {
        include: {
          team: {
            include: {
              members: {
                include: {
                                      user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        timezone: true,
                        image: true,
                        role: true,
                      }
                    }
                }
              }
            }
          }
        }
      }
    }
  });

  // Transform teams data for the component
  const teams = user?.teams.map(membership => ({
    id: membership.team.id,
    name: membership.team.name,
    members: membership.team.members.map(member => ({
      id: member.user.id,
      name: member.user.name || member.user.email || 'Unknown',
      timezone: member.user.timezone || 'UTC',
      image: member.user.image,
      role: member.user.role,
    }))
  })) || [];

  // Debug logging
  console.log('=== MEETING CREATE PAGE DEBUG ===');
  console.log('Current user ID:', session.user.id);
  console.log('User teams count:', teams.length);
  console.log('Teams:', teams);
  console.log('User timezone:', user?.timezone);

  return (
    <CreateMeetingClient 
      teams={teams}
      currentUserId={session.user.id}
      currentUserTimezone={user?.timezone || 'UTC'}
    />
  );
} 