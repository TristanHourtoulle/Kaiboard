'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
	Users,
	Search,
	Filter,
	MoreHorizontal,
	Eye,
	Shield,
	Calendar,
	Globe,
	ArrowUpDown,
	CheckCircle,
	XCircle,
	Clock,
	UserCheck,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { getUserOnlineStatus, isUserOnline } from '@/lib/user-activity'

interface User {
	id: string
	name: string | null
	email: string
	image: string | null
	role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER'
	timezone: string | null
	country: string | null
	createdAt: string
	updatedAt: string
	emailVerified: string | null
	lastActiveAt: string | null
	lastConnection: string | null
	sessionExpires: string | null
	teamCount: number
	meetingCount: number
	participationCount: number
	requestCount: number
	sessionCount: number
	teams: Array<{
		id: string
		role: string
		joinedAt: string
		team: {
			id: string
			name: string
			image: string | null
		}
	}>
}

interface UsersResponse {
	users: User[]
	total: number
}

type SortField = 'name' | 'email' | 'createdAt' | 'lastConnection' | 'teamCount' | 'meetingCount'
type SortDirection = 'asc' | 'desc'

export function AdminUsersClient() {
	const router = useRouter()
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [sortField, setSortField] = useState<SortField>('createdAt')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
	const [roleFilter, setRoleFilter] = useState<string>('all')

	useEffect(() => {
		fetchUsers()
	}, [])

	const fetchUsers = async () => {
		try {
			setLoading(true)
			const response = await fetch('/api/admin/users')
			
			if (!response.ok) {
				if (response.status === 403) {
					toast.error('Access denied. Super admin privileges required.')
					router.push('/')
					return
				}
				throw new Error('Failed to fetch users')
			}

			const data: UsersResponse = await response.json()
			setUsers(data.users)
		} catch (error) {
			console.error('Error fetching users:', error)
			toast.error('Failed to load users')
		} finally {
			setLoading(false)
		}
	}

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortField(field)
			setSortDirection('desc')
		}
	}

	const handleUserClick = (userId: string) => {
		router.push(`/admin/users/${userId}`)
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

	const getRoleIcon = (role: string) => {
		switch (role) {
			case 'SUPER_ADMIN':
				return <Shield className="w-3 h-3" />
			case 'ADMIN':
				return <UserCheck className="w-3 h-3" />
			case 'MEMBER':
				return <Users className="w-3 h-3" />
			default:
				return <Users className="w-3 h-3" />
		}
	}

	// Filter and sort users
	const filteredAndSortedUsers = users
		.filter(user => {
			const matchesSearch = !searchTerm || 
				user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase())
			
			const matchesRole = roleFilter === 'all' || user.role === roleFilter
			
			return matchesSearch && matchesRole
		})
		.sort((a, b) => {
			let aValue: any
			let bValue: any

			switch (sortField) {
				case 'name':
					aValue = a.name || ''
					bValue = b.name || ''
					break
				case 'email':
					aValue = a.email
					bValue = b.email
					break
				case 'createdAt':
					aValue = new Date(a.createdAt)
					bValue = new Date(b.createdAt)
					break
				case 'lastConnection':
					aValue = a.lastConnection ? new Date(a.lastConnection) : new Date(0)
					bValue = b.lastConnection ? new Date(b.lastConnection) : new Date(0)
					break
				case 'teamCount':
					aValue = a.teamCount
					bValue = b.teamCount
					break
				case 'meetingCount':
					aValue = a.meetingCount
					bValue = b.meetingCount
					break
				default:
					return 0
			}

			if (sortDirection === 'asc') {
				return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
			} else {
				return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
			}
		})

	const formatLastConnection = (lastActiveAt: string | null, lastConnection: string | null) => {
		const activeTime = lastActiveAt || lastConnection
		if (!activeTime) return 'Never'
		try {
			return formatDistanceToNow(new Date(activeTime), { addSuffix: true })
		} catch {
			return 'Unknown'
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
								{[...Array(10)].map((_, i) => (
									<Skeleton key={i} className="h-16 w-full" />
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<Card className="border-2 border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5">
					<CardHeader>
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div>
								<CardTitle className="flex items-center gap-2 text-2xl">
									<Users className="w-6 h-6 text-primary" />
									Users Management
								</CardTitle>
								<CardDescription className="text-base">
									Manage all users in the system ({users.length} total)
								</CardDescription>
							</div>
							<Badge variant="secondary" className="self-start sm:self-center px-4 py-2">
								Super Admin Panel
							</Badge>
						</div>
					</CardHeader>
				</Card>

				{/* Filters */}
				<Card>
					<CardHeader className="pb-4">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									placeholder="Search by name or email..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="flex items-center gap-2">
										<Filter className="w-4 h-4" />
										Role: {roleFilter === 'all' ? 'All' : roleFilter}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem onClick={() => setRoleFilter('all')}>
										All Roles
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setRoleFilter('SUPER_ADMIN')}>
										Super Admin
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setRoleFilter('ADMIN')}>
										Admin
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setRoleFilter('MEMBER')}>
										Member
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</CardHeader>
				</Card>

				{/* Users Table */}
				<Card>
					<CardHeader>
						<CardTitle>Users ({filteredAndSortedUsers.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead 
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('email')}
										>
											<div className="flex items-center gap-1">
												Email
												<ArrowUpDown className="w-3 h-3" />
											</div>
										</TableHead>
										<TableHead>Role</TableHead>
										<TableHead 
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('teamCount')}
										>
											<div className="flex items-center gap-1">
												Teams
												<ArrowUpDown className="w-3 h-3" />
											</div>
										</TableHead>
										<TableHead 
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('createdAt')}
										>
											<div className="flex items-center gap-1">
												Created At
												<ArrowUpDown className="w-3 h-3" />
											</div>
										</TableHead>
										<TableHead 
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('lastConnection')}
										>
											<div className="flex items-center gap-1">
												Last Connection
												<ArrowUpDown className="w-3 h-3" />
											</div>
										</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="w-12"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredAndSortedUsers.map((user) => (
										<TableRow 
											key={user.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => handleUserClick(user.id)}
										>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar className="w-10 h-10">
														{user.image && <AvatarImage src={user.image} alt={user.name || 'User'} />}
														<AvatarFallback>
															{user.name?.charAt(0) || user.email.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<div>
														<div className="font-medium">
															{user.name || 'No name'}
														</div>
														<div className="text-sm text-muted-foreground flex items-center gap-1">
															{user.timezone && (
																<>
																	<Globe className="w-3 h-3" />
																	{user.timezone}
																</>
															)}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{user.email}
													{user.emailVerified && (
														<CheckCircle className="w-4 h-4 text-green-500" />
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge className={getRoleColor(user.role)}>
													<div className="flex items-center gap-1">
														{getRoleIcon(user.role)}
														{user.role}
													</div>
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<span>{user.teamCount}</span>
													{user.teams.length > 0 && (
														<div className="flex -space-x-1">
															{user.teams.slice(0, 2).map((teamMember) => (
																<Avatar key={teamMember.team.id} className="w-6 h-6 border-2 border-background">
																	{teamMember.team.image && <AvatarImage src={teamMember.team.image} />}
																	<AvatarFallback className="text-xs">
																		{teamMember.team.name.charAt(0)}
																	</AvatarFallback>
																</Avatar>
															))}
															{user.teams.length > 2 && (
																<div className="w-6 h-6 bg-muted rounded-full border-2 border-background flex items-center justify-center">
																	<span className="text-xs">+{user.teams.length - 2}</span>
																</div>
															)}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{format(new Date(user.createdAt), 'MMM d, yyyy')}
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{formatLastConnection(user.lastActiveAt, user.lastConnection)}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{(() => {
														const status = getUserOnlineStatus(user.lastActiveAt ? new Date(user.lastActiveAt) : null)
														const statusConfig = {
															online: { 
																color: 'bg-green-50 text-green-700 border-green-200', 
																dot: 'bg-green-500', 
																label: 'Online' 
															},
															away: { 
																color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
																dot: 'bg-yellow-500', 
																label: 'Away' 
															},
															offline: { 
																color: 'bg-gray-50 text-gray-700 border-gray-200', 
																dot: 'bg-gray-400', 
																label: 'Offline' 
															}
														}
														const config = statusConfig[status]
														
														return (
															<Badge variant="outline" className={config.color}>
																<div className="flex items-center gap-1">
																	<div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
																	{config.label}
																</div>
															</Badge>
														)
													})()}
												</div>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={(e) => {
															e.stopPropagation()
															handleUserClick(user.id)
														}}>
															<Eye className="w-4 h-4 mr-2" />
															View Details
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
						
						{filteredAndSortedUsers.length === 0 && (
							<div className="text-center py-12">
								<Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-medium text-muted-foreground mb-2">No users found</h3>
								<p className="text-sm text-muted-foreground">
									Try adjusting your search or filter criteria
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 