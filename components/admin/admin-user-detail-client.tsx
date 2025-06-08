'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
	ArrowLeft,
	User,
	Mail,
	Shield,
	Globe,
	Calendar,
	Clock,
	Users,
	Video,
	Activity,
	CheckCircle,
	XCircle,
	AlertCircle,
	Building,
	Link as LinkIcon,
	Database,
	Server,
	Eye,
	Settings,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { getUserOnlineStatus, isUserOnline } from '@/lib/user-activity'

interface UserDetail {
	id: string
	name: string | null
	email: string
	image: string | null
	role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER'
	timezone: string | null
	country: string | null
	createdAt: string
	updatedAt: string
	lastActiveAt: string | null
	emailVerified: string | null
	accounts: Array<{
		provider: string
		providerAccountId: string
		createdAt: string
		type: string
	}>
	sessions: Array<{
		sessionToken: string
		expires: string
		createdAt: string
		updatedAt: string
	}>
	teams: Array<{
		id: string
		role: string
		joinedAt: string
		team: {
			id: string
			name: string
			description: string | null
			image: string | null
			createdAt: string
			_count: {
				members: number
				meetings: number
			}
		}
		customRoles: Array<{
			teamRole: {
				id: string
				name: string
				color: string
			}
		}>
	}>
	createdMeetings: Array<{
		id: string
		title: string
		description: string | null
		startTime: string
		endTime: string
		createdAt: string
		team: {
			id: string
			name: string
		} | null
		_count: {
			participants: number
		}
	}>
	meetingParticipants: Array<{
		id: string
		status: string
		respondedAt: string | null
		createdAt: string
		meeting: {
			id: string
			title: string
			startTime: string
			endTime: string
			creator: {
				id: string
				name: string | null
				email: string
			}
			team: {
				id: string
				name: string
			} | null
		}
	}>
	requestLogs: Array<{
		id: string
		method: string
		path: string
		statusCode: number | null
		responseTime: number | null
		timestamp: string
		errorMessage: string | null
	}>
	statistics: {
		totalTeams: number
		totalMeetingsCreated: number
		totalMeetingParticipations: number
		totalRequestLogs: number
		totalSessions: number
		totalAccounts: number
		activeSessions: number
		recentActivityCount: number
	}
}

interface AdminUserDetailClientProps {
	userId: string
}

export function AdminUserDetailClient({ userId }: AdminUserDetailClientProps) {
	const router = useRouter()
	const [user, setUser] = useState<UserDetail | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchUserDetails()
	}, [userId])

	const fetchUserDetails = async () => {
		try {
			setLoading(true)
			const response = await fetch(`/api/admin/users/${userId}`)
			
			if (!response.ok) {
				if (response.status === 403) {
					toast.error('Access denied. Super admin privileges required.')
					router.push('/admin/users')
					return
				}
				if (response.status === 404) {
					toast.error('User not found')
					router.push('/admin/users')
					return
				}
				throw new Error('Failed to fetch user details')
			}

			const data = await response.json()
			setUser(data.user)
		} catch (error) {
			console.error('Error fetching user details:', error)
			toast.error('Failed to load user details')
		} finally {
			setLoading(false)
		}
	}

	const getRoleColor = (role: string) => {
		switch (role) {
			case 'SUPER_ADMIN':
				return 'bg-red-100 text-red-800 border-red-200'
			case 'ADMIN':
				return 'bg-orange-100 text-orange-800 border-orange-200'
			case 'MEMBER':
				return 'bg-blue-100 text-blue-800 border-blue-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'ACCEPTED':
				return 'bg-green-100 text-green-800 border-green-200'
			case 'DECLINED':
				return 'bg-red-100 text-red-800 border-red-200'
			case 'PENDING':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200'
			case 'MAYBE':
				return 'bg-blue-100 text-blue-800 border-blue-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	const getProviderIcon = (provider: string) => {
		switch (provider) {
			case 'github':
				return '🐙'
			case 'google':
				return '🔍'
			case 'microsoft':
				return '🏢'
			default:
				return '🔗'
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 lg:p-8">
				<div className="max-w-7xl mx-auto space-y-6">
					<Card>
						<CardHeader>
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-4 w-96" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{[...Array(5)].map((_, i) => (
									<Skeleton key={i} className="h-16 w-full" />
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 lg:p-8">
				<div className="max-w-7xl mx-auto">
					<Card>
						<CardContent className="text-center py-12">
							<User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-medium text-muted-foreground mb-2">User not found</h3>
							<Button onClick={() => router.push('/admin/users')}>
								Back to Users
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	const activeSessions = user.sessions.filter(session => new Date(session.expires) > new Date())

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<Card className="border-2 border-primary/10">
					<CardHeader>
						<div className="flex items-center gap-4 mb-4">
							<Button
								variant="ghost"
								onClick={() => router.push('/admin/users')}
								className="flex items-center gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Users
							</Button>
						</div>
						
						<div className="flex flex-col sm:flex-row sm:items-start gap-6">
							<Avatar className="w-24 h-24 border-4 border-background shadow-lg">
								{user.image && <AvatarImage src={user.image} alt={user.name || 'User'} />}
								<AvatarFallback className="text-2xl">
									{user.name?.charAt(0) || user.email.charAt(0)}
								</AvatarFallback>
							</Avatar>
							
							<div className="flex-1 space-y-4">
								<div>
									<CardTitle className="text-3xl flex items-center gap-3">
										{user.name || 'No Name'}
										<Badge className={getRoleColor(user.role)}>
											{user.role}
										</Badge>
									</CardTitle>
									<CardDescription className="text-lg mt-2 flex items-center gap-2">
										<Mail className="w-4 h-4" />
										{user.email}
										{user.emailVerified && (
											<CheckCircle className="w-4 h-4 text-green-500" />
										)}
									</CardDescription>
								</div>
								
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
									<div className="text-center">
										<div className="text-2xl font-bold text-primary">{user.statistics.totalTeams}</div>
										<div className="text-sm text-muted-foreground">Teams</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-primary">{user.statistics.totalMeetingsCreated}</div>
										<div className="text-sm text-muted-foreground">Meetings Created</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-primary">{user.statistics.activeSessions}</div>
										<div className="text-sm text-muted-foreground">Active Sessions</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-primary">{user.statistics.recentActivityCount}</div>
										<div className="text-sm text-muted-foreground">Recent Activity</div>
									</div>
								</div>
							</div>
						</div>
					</CardHeader>
				</Card>

				{/* User Information Tabs */}
				<Tabs defaultValue="overview" className="space-y-6">
					<div className="relative">
						{/* Modern Tab Design */}
						<div className="border-b border-border/20 bg-gradient-to-r from-card/50 to-muted/30 backdrop-blur-sm rounded-t-xl p-1">
							<TabsList className="grid w-full grid-cols-6 bg-transparent h-auto p-0 gap-1">
								<TabsTrigger 
									value="overview" 
									className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 hover:bg-accent/50 hover:text-foreground border-0"
								>
									<User className="w-4 h-4" />
									<span className="hidden sm:inline">Overview</span>
								</TabsTrigger>
								<TabsTrigger 
									value="teams" 
									className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 hover:bg-accent/50 hover:text-foreground border-0"
								>
									<Building className="w-4 h-4" />
									<span className="hidden sm:inline">Teams</span>
								</TabsTrigger>
								<TabsTrigger 
									value="meetings" 
									className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 hover:bg-accent/50 hover:text-foreground border-0"
								>
									<Video className="w-4 h-4" />
									<span className="hidden sm:inline">Meetings</span>
								</TabsTrigger>
								<TabsTrigger 
									value="sessions" 
									className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 hover:bg-accent/50 hover:text-foreground border-0"
								>
									<Database className="w-4 h-4" />
									<span className="hidden sm:inline">Sessions</span>
								</TabsTrigger>
								<TabsTrigger 
									value="activity" 
									className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 hover:bg-accent/50 hover:text-foreground border-0"
								>
									<Activity className="w-4 h-4" />
									<span className="hidden sm:inline">Activity</span>
								</TabsTrigger>
								<TabsTrigger 
									value="accounts" 
									className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 hover:bg-accent/50 hover:text-foreground border-0"
								>
									<Settings className="w-4 h-4" />
									<span className="hidden sm:inline">Accounts</span>
								</TabsTrigger>
							</TabsList>
						</div>
						
						{/* Decorative gradient line */}
						<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
					</div>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="w-5 h-5" />
										User Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium text-muted-foreground">User ID</label>
											<p className="font-mono text-sm">{user.id}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Role</label>
											<div className="mt-1">
												<Badge className={getRoleColor(user.role)}>
													{user.role}
												</Badge>
											</div>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Timezone</label>
											<p className="flex items-center gap-1">
												<Globe className="w-4 h-4" />
												{user.timezone || 'Not set'}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Country</label>
											<p>{user.country || 'Not set'}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Created At</label>
											<p>{format(new Date(user.createdAt), 'PPP')}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Last Updated</label>
											<p>{formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Last Active</label>
											<p className="flex items-center gap-2">
												{user.lastActiveAt ? (
													<>
														{formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })}
														{(() => {
															const status = getUserOnlineStatus(new Date(user.lastActiveAt))
															const statusColors = {
																online: 'text-green-600',
																away: 'text-yellow-600', 
																offline: 'text-gray-600'
															}
															return <span className={`text-xs ${statusColors[status]} capitalize`}>({status})</span>
														})()}
													</>
												) : (
													<span className="text-muted-foreground">Never</span>
												)}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Activity className="w-5 h-5" />
										Statistics
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4">
										<div className="text-center p-4 bg-muted/50 rounded-lg">
											<div className="text-2xl font-bold">{user.statistics.totalTeams}</div>
											<div className="text-sm text-muted-foreground">Teams</div>
										</div>
										<div className="text-center p-4 bg-muted/50 rounded-lg">
											<div className="text-2xl font-bold">{user.statistics.totalMeetingsCreated}</div>
											<div className="text-sm text-muted-foreground">Meetings Created</div>
										</div>
										<div className="text-center p-4 bg-muted/50 rounded-lg">
											<div className="text-2xl font-bold">{user.statistics.totalMeetingParticipations}</div>
											<div className="text-sm text-muted-foreground">Meeting Participations</div>
										</div>
										<div className="text-center p-4 bg-muted/50 rounded-lg">
											<div className="text-2xl font-bold">{user.statistics.totalSessions}</div>
											<div className="text-sm text-muted-foreground">Total Sessions</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Teams Tab */}
					<TabsContent value="teams" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Teams ({user.teams.length})</CardTitle>
								<CardDescription>
									Teams this user is a member of
								</CardDescription>
							</CardHeader>
							<CardContent>
								{user.teams.length > 0 ? (
									<div className="space-y-4">
										{user.teams.map((teamMember) => (
											<div key={teamMember.id} className="flex items-center justify-between p-4 border rounded-lg">
												<div className="flex items-center gap-4">
													<Avatar className="w-12 h-12">
														{teamMember.team.image && <AvatarImage src={teamMember.team.image} />}
														<AvatarFallback>{teamMember.team.name.charAt(0)}</AvatarFallback>
													</Avatar>
													<div>
														<h4 className="font-semibold">{teamMember.team.name}</h4>
														<p className="text-sm text-muted-foreground">
															{teamMember.team.description || 'No description'}
														</p>
														<div className="flex items-center gap-2 mt-2">
															<Badge variant="outline">{teamMember.role}</Badge>
															{teamMember.customRoles.map((role) => (
																<Badge 
																	key={role.teamRole.id}
																	style={{ backgroundColor: role.teamRole.color + '20', color: role.teamRole.color }}
																>
																	{role.teamRole.name}
																</Badge>
															))}
														</div>
													</div>
												</div>
												<div className="text-right text-sm text-muted-foreground">
													<div>{teamMember.team._count.members} members</div>
													<div>{teamMember.team._count.meetings} meetings</div>
													<div>Joined {formatDistanceToNow(new Date(teamMember.joinedAt), { addSuffix: true })}</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
										<p className="text-muted-foreground">No teams found</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Meetings Tab */}
					<TabsContent value="meetings" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Created Meetings ({user.createdMeetings.length})</CardTitle>
								</CardHeader>
								<CardContent>
									{user.createdMeetings.length > 0 ? (
										<div className="space-y-3">
											{user.createdMeetings.map((meeting) => (
												<div key={meeting.id} className="p-3 border rounded-lg">
													<h4 className="font-semibold">{meeting.title}</h4>
													<p className="text-sm text-muted-foreground mb-2">
														{meeting.description || 'No description'}
													</p>
													<div className="flex items-center justify-between text-sm">
														<div className="flex items-center gap-2">
															<Calendar className="w-4 h-4" />
															{format(new Date(meeting.startTime), 'PPp')}
														</div>
														<div className="flex items-center gap-2">
															<Users className="w-4 h-4" />
															{meeting._count.participants}
														</div>
													</div>
													{meeting.team && (
														<Badge variant="outline" className="mt-2">
															{meeting.team.name}
														</Badge>
													)}
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-8">
											<Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
											<p className="text-muted-foreground">No meetings created</p>
										</div>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Meeting Participations ({user.meetingParticipants.length})</CardTitle>
								</CardHeader>
								<CardContent>
									{user.meetingParticipants.length > 0 ? (
										<div className="space-y-3">
											{user.meetingParticipants.map((participation) => (
												<div key={participation.id} className="p-3 border rounded-lg">
													<h4 className="font-semibold">{participation.meeting.title}</h4>
													<div className="flex items-center justify-between text-sm mt-2">
														<div className="flex items-center gap-2">
															<Calendar className="w-4 h-4" />
															{format(new Date(participation.meeting.startTime), 'PPp')}
														</div>
														<Badge className={getStatusColor(participation.status)}>
															{participation.status}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mt-1">
														Created by {participation.meeting.creator.name || participation.meeting.creator.email}
													</p>
													{participation.meeting.team && (
														<Badge variant="outline" className="mt-2">
															{participation.meeting.team.name}
														</Badge>
													)}
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-8">
											<Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
											<p className="text-muted-foreground">No meeting participations</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Sessions Tab */}
					<TabsContent value="sessions" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Sessions ({user.sessions.length})</CardTitle>
								<CardDescription>
									Active: {activeSessions.length} | Total: {user.sessions.length}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Status</TableHead>
											<TableHead>Created</TableHead>
											<TableHead>Expires</TableHead>
											<TableHead>Last Updated</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{user.sessions.map((session) => {
											const isActive = new Date(session.expires) > new Date()
											return (
												<TableRow key={session.sessionToken}>
													<TableCell>
														<Badge variant={isActive ? 'default' : 'secondary'}>
															{isActive ? 'Active' : 'Expired'}
														</Badge>
													</TableCell>
													<TableCell>{format(new Date(session.createdAt), 'PPp')}</TableCell>
													<TableCell>{format(new Date(session.expires), 'PPp')}</TableCell>
													<TableCell>{formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}</TableCell>
												</TableRow>
											)
										})}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Activity Tab */}
					<TabsContent value="activity" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Recent Activity ({user.requestLogs.length})</CardTitle>
								<CardDescription>
									API requests and system activity
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Method</TableHead>
											<TableHead>Path</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Response Time</TableHead>
											<TableHead>Timestamp</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{user.requestLogs.map((log) => (
											<TableRow key={log.id}>
												<TableCell>
													<Badge variant="outline">{log.method}</Badge>
												</TableCell>
												<TableCell className="font-mono text-sm">{log.path}</TableCell>
												<TableCell>
													<Badge variant={log.statusCode && log.statusCode < 400 ? 'default' : 'destructive'}>
														{log.statusCode || 'N/A'}
													</Badge>
												</TableCell>
												<TableCell>{log.responseTime ? `${log.responseTime}ms` : 'N/A'}</TableCell>
												<TableCell>{format(new Date(log.timestamp), 'PPp')}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Accounts Tab */}
					<TabsContent value="accounts" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Connected Accounts ({user.accounts.length})</CardTitle>
								<CardDescription>
									OAuth providers and external accounts
								</CardDescription>
							</CardHeader>
							<CardContent>
								{user.accounts.length > 0 ? (
									<div className="space-y-4">
										{user.accounts.map((account, index) => (
											<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
												<div className="flex items-center gap-3">
													<div className="text-2xl">{getProviderIcon(account.provider)}</div>
													<div>
														<h4 className="font-semibold capitalize">{account.provider}</h4>
														<p className="text-sm text-muted-foreground">
															Account ID: {account.providerAccountId}
														</p>
														<Badge variant="outline" className="mt-1">
															{account.type}
														</Badge>
													</div>
												</div>
												<div className="text-right text-sm text-muted-foreground">
													<div>Connected {formatDistanceToNow(new Date(account.createdAt), { addSuffix: true })}</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<LinkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
										<p className="text-muted-foreground">No connected accounts</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
} 