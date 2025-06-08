import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logApiRequest } from '@/lib/api-logger'

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ meetingId: string }> }
) {
	const startTime = Date.now()

	try {
		const session = await auth()

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const userId = session.user.id
		const { meetingId } = await context.params

		// Find meeting where user is creator or participant
		const meeting = await prisma.meeting.findFirst({
			where: {
				id: meetingId,
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
						email: true,
						image: true
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
			}
		})

		if (!meeting) {
			return NextResponse.json(
				{ error: 'Meeting not found or access denied' },
				{ status: 404 }
			)
		}

		const response = NextResponse.json({ 
			meeting,
			currentUserId: userId // Include current user ID for permission checks
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
		console.error('Error fetching meeting:', error)

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

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ meetingId: string }> }
) {
	const startTime = Date.now()

	try {
		const session = await auth()

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const userId = session.user.id
		const { meetingId } = await context.params

		// Check if user is the creator of the meeting
		const meeting = await prisma.meeting.findFirst({
			where: {
				id: meetingId,
				creatorId: userId
			}
		})

		if (!meeting) {
			return NextResponse.json(
				{ error: 'Meeting not found or you are not authorized to delete it' },
				{ status: 404 }
			)
		}

		// Delete the meeting (this will cascade delete participants due to foreign key)
		await prisma.meeting.delete({
			where: {
				id: meetingId
			}
		})

		const response = NextResponse.json({ 
			success: true, 
			message: 'Meeting deleted successfully' 
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
		console.error('Error deleting meeting:', error)

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