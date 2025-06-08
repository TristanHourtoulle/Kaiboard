import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateUserActivityDebounced } from '@/lib/user-activity'

export async function POST(request: NextRequest) {
	try {
		const session = await auth()

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		console.log('Updating activity for user ID:', session.user.id)

		// Update user activity with debouncing
		await updateUserActivityDebounced(session.user.id)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error updating user activity:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 