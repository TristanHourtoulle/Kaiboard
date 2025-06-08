'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
	Calendar, 
	Clock, 
	Users, 
	MapPin, 
	ExternalLink, 
	ArrowLeft,
	User,
	FileText,
	Globe,
	Trash2,
	LogOut,
	AlertTriangle
} from 'lucide-react'
import { normalizeTimezone } from '@/lib/timezone-utils'
import { toast } from 'sonner'
import { MeetingNotesEditor } from './meeting-notes-editor'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Meeting {
	id: string
	title: string
	description: string | null
	startTime: string
	endTime: string
	timezone: string
	meetingLink: string | null
	location: string | null
	agenda: string | null
	creator: {
		id: string
		name: string | null
		email: string | null
		image?: string | null
	}
	participants: Array<{
		id: string
		status: string
		user: {
			id: string
			name: string | null
			email: string | null
			image?: string | null
		}
	}>
	team: {
		id: string
		name: string
	} | null
}

interface MeetingDetailClientProps {
	meetingId: string
}

export function MeetingDetailClient({ meetingId }: MeetingDetailClientProps) {
	const router = useRouter()
	const [meeting, setMeeting] = useState<Meeting | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [showLeaveDialog, setShowLeaveDialog] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isLeaving, setIsLeaving] = useState(false)

	useEffect(() => {
		const fetchMeeting = async () => {
			try {
				setLoading(true)
				const response = await fetch(`/api/meetings/${meetingId}`)
				
				if (!response.ok) {
					if (response.status === 404) {
						setError('Meeting not found or you do not have access to it')
					} else if (response.status === 401) {
						setError('You must be logged in to view this meeting')
					} else {
						setError('Failed to load meeting details')
					}
					return
				}

				const data = await response.json()
				setMeeting(data.meeting)
				
				// Use current user ID from API response (more reliable)
				if (data.currentUserId) {
					setCurrentUserId(data.currentUserId)
					console.log('Current user ID from API:', data.currentUserId)
				}
			} catch (err) {
				console.error('Error fetching meeting:', err)
				setError('Failed to load meeting details')
				toast.error('Failed to load meeting details')
			} finally {
				setLoading(false)
			}
		}

		fetchMeeting()
	}, [meetingId])

	const formatDateTime = (dateTime: string, timezone: string) => {
		try {
			const normalizedTimezone = normalizeTimezone(timezone)
			return new Date(dateTime).toLocaleString('en-US', {
				timeZone: normalizedTimezone,
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		} catch (error) {
			console.error('Error formatting date for timezone:', timezone, error)
			return new Date(dateTime).toLocaleString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200'
			case 'DECLINED': return 'bg-red-100 text-red-800 border-red-200'
			case 'MAYBE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
			default: return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'ACCEPTED': return '✓'
			case 'DECLINED': return '✗'
			case 'MAYBE': return '?'
			default: return '⏳'
		}
	}

	const isPastMeeting = (endTime: string) => {
		return new Date(endTime) < new Date()
	}

	const isCurrentMeeting = (startTime: string, endTime: string) => {
		const now = new Date()
		return new Date(startTime) <= now && now <= new Date(endTime)
	}

	const handleDeleteMeeting = async () => {
		if (!meeting) return

		setIsDeleting(true)
		try {
			const response = await fetch(`/api/meetings/${meetingId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				toast.success('Meeting deleted successfully')
				router.push('/meetings')
			} else {
				const data = await response.json()
				toast.error(data.error || 'Failed to delete meeting')
			}
		} catch (error) {
			console.error('Error deleting meeting:', error)
			toast.error('Failed to delete meeting')
		} finally {
			setIsDeleting(false)
			setShowDeleteDialog(false)
		}
	}

	const handleLeaveMeeting = async () => {
		if (!meeting) return

		setIsLeaving(true)
		try {
			const response = await fetch(`/api/meetings/${meetingId}/leave`, {
				method: 'DELETE',
			})

			if (response.ok) {
				const data = await response.json()
				toast.success(data.message || 'You have left the meeting')
				router.push('/meetings')
			} else {
				const data = await response.json()
				toast.error(data.error || 'Failed to leave meeting')
			}
		} catch (error) {
			console.error('Error leaving meeting:', error)
			toast.error('Failed to leave meeting')
		} finally {
			setIsLeaving(false)
			setShowLeaveDialog(false)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 lg:p-8">
				<div className="max-w-4xl mx-auto space-y-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
				<Card className="max-w-md w-full">
					<CardContent className="p-6 text-center">
						<div className="text-red-500 mb-4">
							<AlertTriangle className="w-12 h-12 m-auto" />
						</div>
						<h2 className="text-xl font-semibold mb-2">Error</h2>
						<p className="text-muted-foreground mb-4">{error}</p>
						<Button onClick={() => router.push('/meetings')}>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Meetings
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!meeting) {
		return null
	}

	const meetingStatus = isCurrentMeeting(meeting.startTime, meeting.endTime) 
		? 'live' 
		: isPastMeeting(meeting.endTime) 
			? 'completed' 
			: 'upcoming'

	// Determine user permissions
	const isCreator = currentUserId === meeting.creator.id
	const isParticipant = meeting.participants.some(p => p.user.id === currentUserId)
	const isPast = isPastMeeting(meeting.endTime)
	
	// Only allow deletion of upcoming/current meetings, not past ones (for audit trail)
	const canDelete = isCreator && !isPast
	const canLeave = isParticipant && !isCreator && !isPast

	console.log('Render state:', {
		currentUserId,
		creatorId: meeting.creator.id,
		isCreator,
		canDelete,
		showDeleteDialog
	})

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 lg:p-8">
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<Button
						variant="ghost"
						onClick={() => router.push('/meetings')}
						className="self-start"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Meetings
					</Button>

					{/* Action buttons */}
					<div className="flex gap-2">
						{canLeave && (
							<Button
								variant="outline"
								onClick={() => setShowLeaveDialog(true)}
								disabled={isLeaving}
								className="text-orange-600 border-orange-600 hover:bg-orange-50"
							>
								<LogOut className="w-4 h-4 mr-2" />
								{isLeaving ? 'Leaving...' : 'Leave Meeting'}
							</Button>
						)}
						{canDelete && (
							<Button
								variant="destructive"
								onClick={() => {
									console.log('Delete button clicked, opening dialog')
									setShowDeleteDialog(true)
								}}
								disabled={isDeleting}
							>
								<Trash2 className="w-4 h-4 mr-2" />
								{isDeleting ? 'Deleting...' : 'Delete Meeting'}
							</Button>
						)}
					</div>
				</div>

				{/* Meeting Details Card */}
				<Card className="overflow-hidden">
					<CardHeader className="bg-gradient-to-r from-primary/5 to-chart-2/5 border-b">
						<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
							<div className="space-y-2 flex-1">
								<div className="flex items-center gap-2 flex-wrap">
									<CardTitle className="text-2xl sm:text-3xl">{meeting.title}</CardTitle>
									<Badge 
										variant={meetingStatus === 'live' ? 'destructive' : meetingStatus === 'completed' ? 'secondary' : 'default'}
										className="capitalize"
									>
										{meetingStatus === 'live' ? '🔴 Live' : meetingStatus}
									</Badge>
								</div>
								{meeting.description && (
									<CardDescription className="text-base">
										{meeting.description}
									</CardDescription>
								)}
							</div>
							
							{meeting.meetingLink && meetingStatus !== 'completed' && (
								<Button
									size="lg"
									onClick={() => window.open(meeting.meetingLink!, '_blank')}
									className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
								>
									<ExternalLink className="w-4 h-4 mr-2" />
									Join Meeting
								</Button>
							)}
						</div>
					</CardHeader>

					<CardContent className="p-6 space-y-8">
						{/* Meeting Info Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Date & Time */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-lg font-semibold">
									<Calendar className="w-5 h-5 text-primary" />
									Date & Time
								</div>
								<div className="space-y-2 pl-7">
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4 text-muted-foreground" />
										<span className="font-medium">Start:</span>
										<span>{formatDateTime(meeting.startTime, meeting.timezone)}</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4 text-muted-foreground" />
										<span className="font-medium">End:</span>
										<span>{formatDateTime(meeting.endTime, meeting.timezone)}</span>
									</div>
									<div className="flex items-center gap-2">
										<Globe className="w-4 h-4 text-muted-foreground" />
										<span className="font-medium">Timezone:</span>
										<span>{meeting.timezone}</span>
									</div>
								</div>
							</div>

							{/* Location & Details */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-lg font-semibold">
									<MapPin className="w-5 h-5 text-primary" />
									Location & Details
								</div>
								<div className="space-y-2 pl-7">
									<div className="flex items-center gap-2">
										<span className="font-medium">Location:</span>
										<Badge variant="outline">{meeting.location || 'Online'}</Badge>
									</div>
									{meeting.team && (
										<div className="flex items-center gap-2">
											<span className="font-medium">Team:</span>
											<Badge variant="secondary">{meeting.team.name}</Badge>
										</div>
									)}
									<div className="flex items-center gap-2">
										<User className="w-4 h-4 text-muted-foreground" />
										<span className="font-medium">Created by:</span>
										<span>{meeting.creator.name || meeting.creator.email}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Agenda */}
						{meeting.agenda && (
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-lg font-semibold">
									<FileText className="w-5 h-5 text-primary" />
									Agenda
								</div>
								<Card className="ml-7 bg-muted/30">
									<CardContent className="p-4">
										<pre className="whitespace-pre-wrap text-sm font-mono">
											{meeting.agenda}
										</pre>
									</CardContent>
								</Card>
							</div>
						)}

						<Separator />

						{/* Participants */}
						<div className="space-y-4">
							<div className="flex items-center gap-2 text-lg font-semibold">
								<Users className="w-5 h-5 text-primary" />
								Participants ({meeting.participants.length})
							</div>
							
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{meeting.participants.map((participant) => {
									const isCurrentUser = participant.user.id === currentUserId
									const isCreatorParticipant = participant.user.id === meeting.creator.id
									
									return (
										<Card 
											key={participant.id} 
											className={`p-4 hover:shadow-md transition-shadow ${
												isCurrentUser ? 'ring-2 ring-primary/50 bg-primary/5' : ''
											}`}
										>
											<div className="flex items-center gap-3">
												<Avatar className="w-12 h-12">
													{participant.user.image ? (
														<AvatarImage src={participant.user.image} alt={participant.user.name || ''} />
													) : null}
													<AvatarFallback className="font-semibold">
														{participant.user.name?.charAt(0) || participant.user.email?.charAt(0) || '?'}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<p className="font-medium truncate">
															{participant.user.name || participant.user.email || 'Unknown'}
														</p>
														{isCurrentUser && (
															<Badge variant="secondary" className="text-xs">You</Badge>
														)}
														{isCreatorParticipant && (
															<Badge variant="default" className="text-xs">Creator</Badge>
														)}
													</div>
													<p className="text-sm text-muted-foreground truncate">
														{participant.user.email}
													</p>
													<Badge 
														variant="outline" 
														className={`text-xs mt-1 ${getStatusColor(participant.status)}`}
													>
														{getStatusIcon(participant.status)} {participant.status}
													</Badge>
												</div>
											</div>
										</Card>
									)
								})}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Meeting Notes Editor */}
				{isPast && (
					<Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
						<CardContent className="p-4">
							<div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
								<AlertTriangle className="w-4 h-4" />
								<span className="text-sm font-medium">
									This meeting has ended. You can view all information and notes, but cannot modify participant status or delete the meeting.
								</span>
							</div>
						</CardContent>
					</Card>
				)}
				<MeetingNotesEditor meetingId={meeting.id} meetingTitle={meeting.title} />

				{/* Delete Confirmation Dialog */}
				<AlertDialog 
					open={showDeleteDialog} 
					onOpenChange={setShowDeleteDialog}
				>
					<AlertDialogContent className="bg-white dark:bg-gray-900 border border-border">
						<AlertDialogHeader>
							<AlertDialogTitle className="flex items-center gap-2">
								<AlertTriangle className="w-5 h-5 text-destructive" />
								Delete Meeting
							</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete "<strong>{meeting.title}</strong>"? 
								This action cannot be undone and will remove the meeting for all participants.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteMeeting}
								disabled={isDeleting}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{isDeleting ? 'Deleting...' : 'Delete Meeting'}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Leave Confirmation Dialog */}
				<AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
					<AlertDialogContent className="bg-white dark:bg-gray-900 border border-border">
						<AlertDialogHeader>
							<AlertDialogTitle className="flex items-center gap-2">
								<LogOut className="w-5 h-5 text-orange-600" />
								Leave Meeting
							</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to leave "<strong>{meeting.title}</strong>"? 
								You will no longer receive updates about this meeting and won't be able to join it.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleLeaveMeeting}
								disabled={isLeaving}
								className="bg-orange-600 text-white hover:bg-orange-700"
							>
								{isLeaving ? 'Leaving...' : 'Leave Meeting'}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	)
} 