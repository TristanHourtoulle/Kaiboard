'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

const ACTIVITY_UPDATE_INTERVAL = 60000 // 1 minute
const ACTIVITY_EVENTS = [
	'mousedown',
	'mousemove', 
	'keypress',
	'scroll',
	'touchstart',
	'click'
]

/**
 * Hook to track user activity and update their last active timestamp
 */
export function useActivityTracker() {
	const { data: session } = useSession()
	const lastActivityRef = useRef<number>(Date.now())
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	const updateActivity = async () => {
		if (!session?.user?.id) return

		try {
			await fetch('/api/user/activity', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					timestamp: new Date().toISOString()
				})
			})
		} catch (error) {
			console.error('Failed to update user activity:', error)
		}
	}

	const handleActivity = () => {
		lastActivityRef.current = Date.now()
	}

	useEffect(() => {
		if (!session?.user?.id) return

		// Add event listeners for activity detection
		ACTIVITY_EVENTS.forEach(event => {
			document.addEventListener(event, handleActivity, { passive: true })
		})

		// Set up periodic activity updates
		intervalRef.current = setInterval(() => {
			const now = Date.now()
			const timeSinceLastActivity = now - lastActivityRef.current

			// Only update if user was active in the last 5 minutes
			if (timeSinceLastActivity < 5 * 60 * 1000) {
				updateActivity()
			}
		}, ACTIVITY_UPDATE_INTERVAL)

		// Initial activity update
		updateActivity()

		// Cleanup
		return () => {
			ACTIVITY_EVENTS.forEach(event => {
				document.removeEventListener(event, handleActivity)
			})

			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [session?.user?.id])

	// Update activity when user signs in
	useEffect(() => {
		if (session?.user?.id) {
			updateActivity()
		}
	}, [session?.user?.id])
} 