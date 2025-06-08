import { Metadata } from 'next'
import { AdminUserDetailClient } from '@/components/admin/admin-user-detail-client'

interface AdminUserDetailPageProps {
	params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: AdminUserDetailPageProps): Promise<Metadata> {
	const { userId } = await params
	
	return {
		title: `User Details | Kaiboard Admin`,
		description: `Detailed information for user ${userId}`,
	}
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
	const { userId } = await params
	
	return <AdminUserDetailClient userId={userId} />
} 