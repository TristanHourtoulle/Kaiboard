import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check authentication and super admin role
    const session = await auth();
    console.log('🔍 Admin logs API - Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and check if super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const method = searchParams.get('method') || '';
    const status = searchParams.get('status') || '';
    const userId = searchParams.get('userId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { path: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
        { userAgent: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { errorMessage: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (method) {
      where.method = method;
    }

    if (status) {
      const statusCode = parseInt(status);
      if (!isNaN(statusCode)) {
        where.statusCode = statusCode;
      }
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.requestLog.count({ where });

    // Fetch logs with pagination
    const logs = await prisma.requestLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get summary statistics
    const stats = await prisma.requestLog.aggregate({
      where,
      _count: { id: true },
      _avg: { responseTime: true }
    });

    // Get method distribution
    const methodStats = await prisma.requestLog.groupBy({
      by: ['method'],
      where,
      _count: { method: true },
      orderBy: { _count: { method: 'desc' } }
    });

    // Get status code distribution
    const statusStats = await prisma.requestLog.groupBy({
      by: ['statusCode'],
      where,
      _count: { statusCode: true },
      orderBy: { _count: { statusCode: 'desc' } }
    });

    const response = NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      stats: {
        totalRequests: stats._count.id,
        averageResponseTime: Math.round(stats._avg.responseTime || 0),
        methodDistribution: methodStats.map(stat => ({
          method: stat.method,
          count: stat._count.method
        })),
        statusDistribution: statusStats.map(stat => ({
          status: stat.statusCode,
          count: stat._count.statusCode
        }))
      }
    });

    return response;

  } catch (error) {
    console.error('Error fetching request logs:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 