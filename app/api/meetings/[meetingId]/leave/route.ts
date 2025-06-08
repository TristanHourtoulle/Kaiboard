import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logApiRequest } from '@/lib/api-logger'

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

		// Check if user is a participant in the meeting
		const participant = await prisma.meetingParticipant.findFirst({
			where: {
				meetingId: meetingId,
				userId: userId
			},
			include: {
				meeting: {
					select: {
						creatorId: true,
						title: true
					}
				}
			}
		})

		if (!participant) {
			return NextResponse.json(
				{ error: 'You are not a participant in this meeting' },
				{ status: 404 }
			)
		}

		// Prevent meeting creator from leaving their own meeting
		if (participant.meeting.creatorId === userId) {
			return NextResponse.json(
				{ error: 'Meeting creators cannot leave their own meetings. Delete the meeting instead.' },
				{ status: 400 }
			)
		}

		// Remove the participant from the meeting
		await prisma.meetingParticipant.delete({
			where: {
				id: participant.id
			}
		})

		const response = NextResponse.json({ 
			success: true, 
			message: `You have left the meeting "${participant.meeting.title}"` 
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
		console.error('Error leaving meeting:', error)

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