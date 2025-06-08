import { NextRequest, NextResponse } from 'next/server';
import { logApiRequest } from '@/lib/api-logger';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await auth();
    
    const response = NextResponse.json({ 
      message: 'Test log entry created successfully!',
      timestamp: new Date().toISOString(),
      user: session?.user?.id ? 'Authenticated' : 'Anonymous'
    });
    
    // Log this test request
    logApiRequest({
      method: request.method,
      url: request.url,
      statusCode: 200,
      responseTime: Date.now() - startTime,
      userId: session?.user?.id,
    }).catch(console.error);
    
    return response;
  } catch (error) {
    console.error('Error in test-log endpoint:', error);
    
    // Log failed request
    logApiRequest({
      method: request.method,
      url: request.url,
      statusCode: 500,
      responseTime: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }).catch(console.error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await auth();
    const body = await request.json();
    
    const response = NextResponse.json({ 
      message: 'Test POST log entry created successfully!',
      timestamp: new Date().toISOString(),
      user: session?.user?.id ? 'Authenticated' : 'Anonymous',
      data: body
    });
    
    // Log this test request
    logApiRequest({
      method: request.method,
      url: request.url,
      statusCode: 200,
      responseTime: Date.now() - startTime,
      userId: session?.user?.id,
      requestBody: body
    }).catch(console.error);
    
    return response;
  } catch (error) {
    console.error('Error in test-log POST endpoint:', error);
    
    // Log failed request
    logApiRequest({
      method: request.method,
      url: request.url,
      statusCode: 500,
      responseTime: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }).catch(console.error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 