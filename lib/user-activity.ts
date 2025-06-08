import { prisma } from '@/lib/prisma'

/**
 * Updates the user's last active timestamp
 * @param userId - The ID of the user to update
 */
export async function updateUserActivity(userId: string): Promise<void> {
	try {
		// First check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true }
		})
		
		if (!existingUser) {
			console.warn(`User ${userId} not found, skipping activity update`)
			return
		}
		
		// Update the user's last active timestamp
		await prisma.user.update({
			where: { id: userId },
			data: { lastActiveAt: new Date() }
		})
	} catch (error) {
		// Silently fail to avoid breaking the main functionality
		console.error('Failed to update user activity:', error)
	}
}

/**
 * Updates user activity with debouncing to avoid excessive database writes
 * @param userId - The ID of the user to update
 */
const userActivityCache = new Map<string, number>()
const ACTIVITY_UPDATE_DEBOUNCE_MS = 60000 // 1 minute

export async function updateUserActivityDebounced(userId: string): Promise<void> {
	const now = Date.now()
	const lastUpdate = userActivityCache.get(userId) || 0
	
	// Only update if more than 1 minute has passed since last update
	if (now - lastUpdate > ACTIVITY_UPDATE_DEBOUNCE_MS) {
		userActivityCache.set(userId, now)
		await updateUserActivity(userId)
	}
}

/**
 * Checks if a user is considered "online" based on their last activity
 * @param lastActiveAt - The user's last activity timestamp
 * @param thresholdMinutes - Minutes threshold for considering user online (default: 5)
 * @returns true if user is considered online
 */
export function isUserOnline(lastActiveAt: Date | null, thresholdMinutes: number = 5): boolean {
	if (!lastActiveAt) return false
	
	const now = new Date()
	const diffMs = now.getTime() - lastActiveAt.getTime()
	const diffMinutes = diffMs / (1000 * 60)
	
	return diffMinutes <= thresholdMinutes
}

/**
 * Gets the user's online status string
 * @param lastActiveAt - The user's last activity timestamp
 * @returns Status string: 'online', 'away', or 'offline'
 */
export function getUserOnlineStatus(lastActiveAt: Date | null): 'online' | 'away' | 'offline' {
	if (!lastActiveAt) return 'offline'
	
	const now = new Date()
	const diffMs = now.getTime() - lastActiveAt.getTime()
	const diffMinutes = diffMs / (1000 * 60)
	
	if (diffMinutes <= 5) return 'online'      // Active in last 5 minutes
	if (diffMinutes <= 30) return 'away'       // Active in last 30 minutes
	return 'offline'                           // Not active in last 30 minutes
} 