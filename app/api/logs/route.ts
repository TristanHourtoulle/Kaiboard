import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logRequest } from '@/lib/request-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Only allow authenticated users to log requests
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      method,
      url,
      statusCode,
      responseTime,
      userAgent,
      ipAddress,
      requestBody,
      queryParams,
      headers,
      errorMessage
    } = body;

    // Extract path from URL if not provided
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    await logRequest({
      method,
      url,
      path,
      statusCode,
      responseTime,
      userAgent,
      ipAddress,
      userId: session.user.id,
      requestBody,
      queryParams,
      headers,
      errorMessage
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log request:', error);
    return NextResponse.json({ error: 'Failed to log request' }, { status: 500 });
  }
} 