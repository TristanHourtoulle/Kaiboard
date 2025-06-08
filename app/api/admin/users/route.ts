import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logApiRequest } from '@/lib/api-logger'

export async function GET(request: NextRequest) {
	const startTime = Date.now()

	try {
		const session = await auth()

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check if user is super admin
		const currentUser = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { role: true }
		})

		if (currentUser?.role !== 'SUPER_ADMIN') {
			return NextResponse.json({ error: 'Access denied. Super admin only.' }, { status: 403 })
		}

		// Fetch all users with comprehensive information
		const users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				timezone: true,
				country: true,
				createdAt: true,
				updatedAt: true,
				lastActiveAt: true,
				emailVerified: true,
				_count: {
					select: {
						teams: true,
						createdMeetings: true,
						meetingParticipants: true,
						requestLogs: true,
						sessions: true,
					}
				},
				sessions: {
					select: {
						createdAt: true,
						expires: true,
					},
					orderBy: {
						createdAt: 'desc'
					},
					take: 1
				},
				teams: {
					select: {
						id: true,
						role: true,
						joinedAt: true,
						team: {
							select: {
								id: true,
								name: true,
								image: true,
							}
						}
					},
					orderBy: {
						joinedAt: 'desc'
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		// Transform the data to include last connection
		const transformedUsers = users.map(user => ({
			...user,
			lastConnection: user.lastActiveAt || user.sessions[0]?.createdAt || null,
			sessionExpires: user.sessions[0]?.expires || null,
			teamCount: user._count.teams,
			meetingCount: user._count.createdMeetings,
			participationCount: user._count.meetingParticipants,
			requestCount: user._count.requestLogs,
			sessionCount: user._count.sessions,
		}))

		const response = NextResponse.json({ 
			users: transformedUsers,
			total: users.length
		})

		// Log successful request
		logApiRequest({
			method: request.method,
			url: request.url,
			statusCode: 200,
			responseTime: Date.now() - startTime,
			userId: session.user.id
		}).catch(console.error)

		return response
	} catch (error) {
		console.error('Error fetching users:', error)

		// Log failed request
		logApiRequest({
			method: request.method,
			url: request.url,
			statusCode: 500,
			responseTime: Date.now() - startTime,
			errorMessage: error instanceof Error ? error.message : 'Unknown error'
		}).catch(console.error)

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 