import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiRequest } from "@/lib/api-logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await auth();
    
    console.log("Session in API route:", session);
    
    if (!session?.user?.id) {
      console.log("No session or user found");
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("User ID:", userId);

    const body = await request.json();
    const { 
      title, 
      description, 
      date, 
      startTime, 
      endTime, 
      timezone, 
      meetingLink, 
      location, 
      agenda, 
      participantIds,
      teamId,
      emailParticipants
    } = body;

    // Validate required fields
    if (!title || !date || !startTime || !endTime || !timezone) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Combine date and time to create DateTime objects
    // Extract the date part from the ISO string (YYYY-MM-DD)
    const dateString = new Date(date).toISOString().split('T')[0];
    const startDateTime = new Date(`${dateString}T${startTime}:00`);
    const endDateTime = new Date(`${dateString}T${endTime}:00`);

    // Handle team assignment
    let finalTeamId = null;
    
    if (teamId) {
      // Verify user has access to the specified team
      const teamAccess = await prisma.teamMember.findFirst({
        where: {
          teamId: teamId,
          userId: userId
        }
      });
      
      if (!teamAccess) {
        return NextResponse.json(
          { error: "You don't have access to this team" }, 
          { status: 403 }
        );
      }
      
      finalTeamId = teamId;
    }
    // If no teamId provided, this is a personal meeting (finalTeamId remains null)

    // Prepare participant data
    const participantData = [];
    
    // Add team member participants
    if (participantIds && participantIds.length > 0) {
      participantData.push(...participantIds.map((participantId: string) => ({
        userId: participantId,
        status: participantId === userId ? "ACCEPTED" : "PENDING"
      })));
    }
    
    // For personal meetings, always include the creator as a participant
    if (!finalTeamId && !participantData.some(p => p.userId === userId)) {
      participantData.push({
        userId: userId,
        status: "ACCEPTED"
      });
    }

    // Create the meeting
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        timezone,
        meetingLink,
        location,
        agenda,
        teamId: finalTeamId, // This can be null for personal meetings
        creatorId: userId,
        participants: {
          create: participantData
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    const response = NextResponse.json({ meeting });
    
    // Log successful request
    logApiRequest({
      method: request.method,
      url: request.url,
      statusCode: 200,
      responseTime: Date.now() - startTime,
      userId: session.user.id,
      requestBody: { title, teamId: finalTeamId }
    }).catch(console.error);
    
    return response;
  } catch (error) {
    console.error("Error creating meeting:", error);
    
    // Log failed request
    logApiRequest({
      method: request.method,
      url: request.url,
      statusCode: 500,
      responseTime: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }).catch(console.error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get meetings where user is creator or participant
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { creatorId: userId },
          {
            participants: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    const response = NextResponse.json({ meetings });
    
    // Log successful request
    logApiRequest({
      method: request.method,
      url: request.url,
      statusCode: 200,
      responseTime: Date.now() - startTime,
      userId: session.user.id
    }).catch(console.error);
    
    return response;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    
    // Log failed request
    logApiRequest({
      method: request.method,
      url: request.url,
      statusCode: 500,
      responseTime: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }).catch(console.error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 