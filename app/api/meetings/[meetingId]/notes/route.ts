import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RouteParams {
	params: Promise<{
		meetingId: string
	}>
}

// GET /api/meetings/[meetingId]/notes - Get meeting notes
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { meetingId } = await params

		// Check if user has access to the meeting
		const meeting = await prisma.meeting.findFirst({
			where: {
				id: meetingId,
				OR: [
					{ creatorId: session.user.id },
					{
						participants: {
							some: {
								userId: session.user.id
							}
						}
					}
				]
			},
			include: {
				notes: {
					orderBy: {
						updatedAt: 'desc'
					},
					take: 1,
					include: {
						lastEditor: {
							select: {
								id: true,
								name: true,
								email: true
							}
						}
					}
				}
			}
		})

		if (!meeting) {
			return NextResponse.json({ error: 'Meeting not found or access denied' }, { status: 404 })
		}

		const notes = meeting.notes[0]

		return NextResponse.json({
			notes: notes ? {
				content: notes.content,
				updatedAt: notes.updatedAt,
				createdAt: notes.createdAt,
				lastSavedBy: notes.lastSavedBy,
				lastEditor: notes.lastEditor ? {
					id: notes.lastEditor.id,
					name: notes.lastEditor.name,
					email: notes.lastEditor.email
				} : null
			} : null
		})
	} catch (error) {
		console.error('Error fetching meeting notes:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

// POST /api/meetings/[meetingId]/notes - Save meeting notes
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { meetingId } = await params
		const { content } = await request.json()

		if (typeof content !== 'string') {
			return NextResponse.json({ error: 'Content must be a string' }, { status: 400 })
		}

		// Check if user has access to the meeting
		const meeting = await prisma.meeting.findFirst({
			where: {
				id: meetingId,
				OR: [
					{ creatorId: session.user.id },
					{
						participants: {
							some: {
								userId: session.user.id
							}
						}
					}
				]
			}
		})

		if (!meeting) {
			return NextResponse.json({ error: 'Meeting not found or access denied' }, { status: 404 })
		}

		// Check if notes already exist for this meeting
		const existingNotes = await prisma.meetingNotes.findFirst({
			where: {
				meetingId: meetingId
			}
		})

		let notes
		if (existingNotes) {
			// Update existing notes
			notes = await prisma.meetingNotes.update({
				where: {
					id: existingNotes.id
				},
				data: {
					content,
					lastSavedBy: session.user.id,
					updatedAt: new Date()
				},
				include: {
					lastEditor: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			})
		} else {
			// Create new notes
			notes = await prisma.meetingNotes.create({
				data: {
					meetingId,
					content,
					createdBy: session.user.id,
					lastSavedBy: session.user.id
				},
				include: {
					lastEditor: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			})
		}

		return NextResponse.json({
			message: 'Notes saved successfully',
			notes: {
				content: notes.content,
				updatedAt: notes.updatedAt,
				createdAt: notes.createdAt,
				lastSavedBy: notes.lastSavedBy,
				lastEditor: notes.lastEditor ? {
					id: notes.lastEditor.id,
					name: notes.lastEditor.name,
					email: notes.lastEditor.email
				} : null
			}
		})
	} catch (error) {
		console.error('Error saving meeting notes:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
} 