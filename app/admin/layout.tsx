import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface AdminLayoutProps {
	children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
	const session = await auth()

	if (!session?.user?.id) {
		redirect('/api/auth/signin')
	}

	// Check if user is super admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { role: true }
	})

	if (user?.role !== 'SUPER_ADMIN') {
		redirect('/')
	}

	return <>{children}</>
} 