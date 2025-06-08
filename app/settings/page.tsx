import { Metadata } from 'next';
import { auth } from "@/auth";
import { UserSettingsClient } from "@/components/settings/user-settings-client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: 'Settings - Customize Your Kaiboard Experience',
  description: 'Manage your account settings, timezone preferences, notification settings, and customize your Kaiboard experience for optimal productivity.',
  keywords: [
    'settings',
    'user settings',
    'account settings',
    'timezone settings',
    'notification preferences',
    'profile settings',
    'user preferences',
    'customization',
    'productivity settings',
    'account management'
  ],
  openGraph: {
    title: 'Settings - Customize Your Kaiboard Experience | Kaiboard',
    description: 'Manage your account settings, timezone preferences, and customize your Kaiboard experience for optimal productivity.',
    url: '/settings',
    images: [
      {
        url: '/screen/Kaiboard-cover.jpeg',
        width: 1200,
        height: 630,
        alt: 'Kaiboard Settings - Customize Your Experience',
      },
    ],
  },
  twitter: {
    title: 'Settings - Customize Your Kaiboard Experience | Kaiboard',
    description: 'Manage your account settings and customize your experience.',
  },
  alternates: {
    canonical: '/settings',
  },
  robots: {
    index: false, // Don't index settings pages for privacy
    follow: true,
  },
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session || !session.user) {
    return <div>Unauthorized</div>;
  }

  // Get user data with timezone and country
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      timezone: true,
      country: true,
      role: true,
      image: true,
    }
  });

  return <UserSettingsClient user={user} />;
} 