import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logApiRequest } from '@/lib/api-logger'

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ userId: string }> }
) {
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

		const { userId } = await context.params

		// Fetch detailed user information
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				accounts: {
					select: {
						provider: true,
						providerAccountId: true,
						createdAt: true,
						type: true,
					}
				},
				sessions: {
					select: {
						sessionToken: true,
						expires: true,
						createdAt: true,
						updatedAt: true,
					},
					orderBy: {
						createdAt: 'desc'
					}
				},
				teams: {
					include: {
						team: {
							select: {
								id: true,
								name: true,
								description: true,
								image: true,
								createdAt: true,
								_count: {
									select: {
										members: true,
										meetings: true,
									}
								}
							}
						},
						customRoles: {
							include: {
								teamRole: {
									select: {
										id: true,
										name: true,
										color: true,
									}
								}
							}
						}
					},
					orderBy: {
						joinedAt: 'desc'
					}
				},
				createdMeetings: {
					select: {
						id: true,
						title: true,
						description: true,
						startTime: true,
						endTime: true,
						createdAt: true,
						team: {
							select: {
								id: true,
								name: true,
							}
						},
						_count: {
							select: {
								participants: true,
							}
						}
					},
					orderBy: {
						createdAt: 'desc'
					},
					take: 10
				},
				meetingParticipants: {
					select: {
						id: true,
						status: true,
						respondedAt: true,
						createdAt: true,
						meeting: {
							select: {
								id: true,
								title: true,
								startTime: true,
								endTime: true,
								creator: {
									select: {
										id: true,
										name: true,
										email: true,
									}
								},
								team: {
									select: {
										id: true,
										name: true,
									}
								}
							}
						}
					},
					orderBy: {
						createdAt: 'desc'
					},
					take: 10
				},
				requestLogs: {
					select: {
						id: true,
						method: true,
						path: true,
						statusCode: true,
						responseTime: true,
						timestamp: true,
						errorMessage: true,
					},
					orderBy: {
						timestamp: 'desc'
					},
					take: 20
				},
				_count: {
					select: {
						teams: true,
						createdMeetings: true,
						meetingParticipants: true,
						requestLogs: true,
						sessions: true,
						accounts: true,
					}
				}
			}
		})

		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			)
		}

		// Calculate additional statistics
		const now = new Date()
		const activeSessions = user.sessions.filter(session => session.expires > now)
		const recentActivity = user.requestLogs.filter(log => 
			new Date(log.timestamp) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
		)

		const response = NextResponse.json({ 
			user: {
				...user,
				statistics: {
					totalTeams: user._count.teams,
					totalMeetingsCreated: user._count.createdMeetings,
					totalMeetingParticipations: user._count.meetingParticipants,
					totalRequestLogs: user._count.requestLogs,
					totalSessions: user._count.sessions,
					totalAccounts: user._count.accounts,
					activeSessions: activeSessions.length,
					recentActivityCount: recentActivity.length,
				}
			}
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
		console.error('Error fetching user details:', error)

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