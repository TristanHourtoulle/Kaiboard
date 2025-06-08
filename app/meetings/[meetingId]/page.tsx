import { MeetingDetailClient } from '@/components/meetings/meeting-detail-client'

interface MeetingDetailPageProps {
	params: Promise<{
		meetingId: string
	}>
}

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
	const { meetingId } = await params
	return <MeetingDetailClient meetingId={meetingId} />
}