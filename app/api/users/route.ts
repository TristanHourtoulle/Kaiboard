import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get session to verify authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users (team members)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        country: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ 
      users: users.map(user => ({
        id: user.id,
        name: user.name || 'Unknown User',
        email: user.email,
        timezone: user.timezone || 'UTC',
        country: user.country,
        role: user.role || 'MEMBER',
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 