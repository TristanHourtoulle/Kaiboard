import { Metadata } from 'next';
import { MeetingsClient } from "@/components/meetings/meetings-client";

export const metadata: Metadata = {
  title: 'Meetings - Manage Your Team Meetings',
  description: 'Create, schedule, and manage meetings with your distributed team. Smart timezone handling, automated reminders, and seamless collaboration tools.',
  keywords: [
    'meetings',
    'team meetings',
    'video conferencing',
    'meeting management',
    'distributed team meetings',
    'remote meetings',
    'meeting scheduler',
    'collaboration tools',
    'meeting notes',
    'agenda management'
  ],
  openGraph: {
    title: 'Meetings - Manage Your Team Meetings | Kaiboard',
    description: 'Create, schedule, and manage meetings with your distributed team. Smart timezone handling and seamless collaboration tools.',
    url: '/meetings',
    images: [
      {
        url: '/screen/Kaiboard-cover.jpeg',
        width: 1200,
        height: 630,
        alt: 'Kaiboard Meetings - Team Meeting Management',
      },
    ],
  },
  twitter: {
    title: 'Meetings - Manage Your Team Meetings | Kaiboard',
    description: 'Create, schedule, and manage meetings with your distributed team.',
  },
  alternates: {
    canonical: '/meetings',
  },
};

export default function MeetingsPage() {
  return <MeetingsClient />;
} 