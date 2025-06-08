import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'
import { updateUserActivityDebounced } from '@/lib/user-activity';

interface LogParams {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  requestBody?: any;
  errorMessage?: string;
}

export async function logApiRequest(params: LogParams): Promise<void> {
  try {
    const url = new URL(params.url);
    
    // Skip logging for the admin logs route to avoid infinite logging loops
    if (url.pathname === '/api/admin/logs') {
      return;
    }
    
    console.log('🔍 Logging API request:', {
      method: params.method,
      path: url.pathname,
      userId: params.userId,
      userAuthenticated: !!params.userId
    });
    
    await prisma.requestLog.create({
      data: {
        method: params.method,
        url: params.url,
        path: url.pathname,
        statusCode: params.statusCode,
        responseTime: params.responseTime,
        userAgent: null, // Will be added later if needed
        ipAddress: null, // Will be added later if needed
        userId: params.userId || null,
        requestBody: params.requestBody ? JSON.stringify(params.requestBody) : null,
        queryParams: url.search ? url.search : null,
        headers: null, // Will be added later if needed
        errorMessage: params.errorMessage || null,
      },
    });

    // Update user activity if userId is provided
    if (params.userId) {
      await updateUserActivityDebounced(params.userId);
    }
  } catch (error) {
    console.error('Failed to log API request:', error);
  }
}

// Wrapper function to automatically log API route handlers
export function withApiLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    let response: NextResponse;
    let statusCode = 200;
    let errorMessage: string | undefined;

    try {
      response = await handler(request, ...args);
      statusCode = response.status;
    } catch (error) {
      statusCode = 500;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    const responseTime = Date.now() - startTime;

    // Get user ID from response headers if set by middleware
    const userId = response.headers.get('x-user-id') || undefined;

    // Log the request asynchronously
    logApiRequest({
      method: request.method,
      url: request.url,
      statusCode,
      responseTime,
      userId,
      errorMessage,
    }).catch(console.error);

    return response;
  };
} 