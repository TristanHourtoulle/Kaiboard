import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface LogRequestParams {
  method: string;
  url: string;
  path: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ipAddress?: string;
  userId?: string;
  requestBody?: any;
  queryParams?: Record<string, any>;
  headers?: Record<string, string>;
  errorMessage?: string;
}

// Sensitive fields to exclude from logging
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session',
  'csrf',
  'api_key',
  'access_token',
  'refresh_token'
];

// Sanitize request body by removing sensitive data
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowercaseKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      lowercaseKey.includes(field)
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Extract important headers while excluding sensitive ones
function sanitizeHeaders(headers: Headers): Record<string, string> {
  const importantHeaders: Record<string, string> = {};
  const headersToLog = [
    'content-type',
    'user-agent',
    'accept',
    'accept-language',
    'referer',
    'origin',
    'x-forwarded-for',
    'x-real-ip'
  ];
  
  headers.forEach((value, key) => {
    const lowercaseKey = key.toLowerCase();
    if (headersToLog.includes(lowercaseKey)) {
      importantHeaders[key] = value;
    }
  });
  
  return importantHeaders;
}

// Get client IP address from various headers
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || remoteAddr;
}

// Log request to database
export async function logRequest(params: LogRequestParams): Promise<void> {
  try {
    // Skip logging for the admin logs route to avoid infinite logging loops
    if (params.path === '/api/admin/logs') {
      return;
    }
    
    await prisma.requestLog.create({
      data: {
        method: params.method,
        url: params.url,
        path: params.path,
        statusCode: params.statusCode,
        responseTime: params.responseTime,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        userId: params.userId,
        requestBody: params.requestBody ? JSON.stringify(sanitizeData(params.requestBody)) : null,
        queryParams: params.queryParams ? JSON.stringify(params.queryParams) : null,
        headers: params.headers ? JSON.stringify(params.headers) : null,
        errorMessage: params.errorMessage,
      },
    });
  } catch (error) {
    // Don't let logging errors break the application
    console.error('Failed to log request:', error);
  }
}

// Create log entry from NextRequest
export async function logFromRequest(
  request: NextRequest,
  options: {
    statusCode?: number;
    responseTime?: number;
    userId?: string;
    errorMessage?: string;
  } = {}
): Promise<void> {
  const url = request.url;
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const queryParams = Object.fromEntries(urlObj.searchParams.entries());
  
  let requestBody = null;
  try {
    // Only attempt to parse body for non-GET requests
    if (request.method !== 'GET' && request.headers.get('content-type')?.includes('application/json')) {
      // Clone the request to read the body without consuming it
      const clonedRequest = request.clone();
      requestBody = await clonedRequest.json();
    }
  } catch (error) {
    // Body parsing failed, continue without it
  }
  
  await logRequest({
    method: request.method,
    url,
    path,
    statusCode: options.statusCode,
    responseTime: options.responseTime,
    userAgent: request.headers.get('user-agent') || undefined,
    ipAddress: getClientIP(request),
    userId: options.userId,
    requestBody,
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    headers: sanitizeHeaders(request.headers),
    errorMessage: options.errorMessage,
  });
}

// Middleware wrapper to automatically log requests
export function withRequestLogging<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now();
    const request = args[0] as NextRequest;
    let response: Response;
    let userId: string | undefined;
    
    try {
      // Execute the original handler
      response = await handler(...args);
      
      // Try to extract user ID from response or request
      // This would need to be customized based on your auth implementation
      
      const responseTime = Date.now() - startTime;
      
      // Log the request
      await logFromRequest(request, {
        statusCode: response.status,
        responseTime,
        userId,
      });
      
      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log the failed request
      await logFromRequest(request, {
        statusCode: 500,
        responseTime,
        userId,
        errorMessage,
      });
      
      throw error;
    }
  };
} 