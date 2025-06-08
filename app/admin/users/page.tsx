import { Metadata } from 'next'
import { AdminUsersClient } from '@/components/admin/admin-users-client'

export const metadata: Metadata = {
	title: 'Users Management | Kaiboard Admin',
	description: 'Manage all users in the system',
}

export default function AdminUsersPage() {
	return <AdminUsersClient />
} 