import { Suspense } from 'react';
import { Metadata } from 'next';
import { CalendarClient } from '@/components/calendar/calendar-client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Calendar - Schedule Meetings Across Timezones',
  description: 'View and manage your meetings in a smart calendar that automatically handles timezone conflicts and suggests optimal meeting times for your distributed team.',
  keywords: [
    'calendar',
    'meeting scheduler',
    'timezone calendar',
    'team calendar',
    'distributed team meetings',
    'global scheduling',
    'meeting planner',
    'productivity calendar'
  ],
  openGraph: {
    title: 'Calendar - Schedule Meetings Across Timezones | Kaiboard',
    description: 'View and manage your meetings in a smart calendar that automatically handles timezone conflicts and suggests optimal meeting times.',
    url: '/calendar',
    images: [
      {
        url: '/assets/screenshots/Kaiboard-cover.jpeg',
        width: 1200,
        height: 630,
        alt: 'Kaiboard Calendar - Smart Meeting Scheduling',
      },
    ],
  },
  twitter: {
    title: 'Calendar - Schedule Meetings Across Timezones | Kaiboard',
    description: 'View and manage your meetings in a smart calendar that automatically handles timezone conflicts.',
  },
  alternates: {
    canonical: '/calendar',
  },
};

function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarClient />
    </Suspense>
  );
} 