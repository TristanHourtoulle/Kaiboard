export const seoConfig = {
  // Base configuration
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://kaiboard.vercel.app',
  siteName: 'Kaiboard',
  siteDescription: 'Project Management for Distributed Teams - Schedule meetings across timezones with ease. Collaborate seamlessly with your global team.',
  
  // Default metadata
  defaultTitle: 'Kaiboard - Project Management for Distributed Teams',
  titleTemplate: '%s | Kaiboard',
  
  // Keywords
  keywords: [
    'project management',
    'distributed teams',
    'remote collaboration',
    'timezone scheduling',
    'team productivity',
    'global teams',
    'meeting scheduler',
    'collaboration tools',
    'productivity software',
    'remote work',
    'team calendar',
    'cross-timezone meetings',
    'distributed workforce',
    'async collaboration',
    'team coordination'
  ],
  
  // Social media
  social: {
    twitter: '@kaiboard',
    // Add other social media handles when available
  },
  
  // Open Graph defaults
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Kaiboard',
    images: [
      {
        url: '/assets/screenshots/Kaiboard-cover.jpeg',
        width: 1200,
        height: 630,
        alt: 'Kaiboard - Project Management for Distributed Teams',
        type: 'image/jpeg',
      },
    ],
  },
  
  // Twitter defaults
  twitter: {
    card: 'summary_large_image',
    site: '@kaiboard',
    creator: '@kaiboard',
  },
  
  // Robots configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Page-specific configurations
  pages: {
    home: {
      title: 'Kaiboard - Project Management for Distributed Teams',
      description: 'Schedule meetings across timezones with ease. Collaborate seamlessly with your global team using Kaiboard\'s smart project management platform.',
    },
    calendar: {
      title: 'Calendar - Schedule Meetings Across Timezones',
      description: 'View and manage your meetings in a smart calendar that automatically handles timezone conflicts and suggests optimal meeting times for your distributed team.',
    },
    meetings: {
      title: 'Meetings - Manage Your Team Meetings',
      description: 'Create, schedule, and manage meetings with your distributed team. Smart timezone handling, automated reminders, and seamless collaboration tools.',
    },
    teams: {
      title: 'Teams - Collaborate with Your Distributed Team',
      description: 'Create and manage teams for your distributed organization. Invite members, assign roles, and collaborate effectively across timezones.',
    },
    settings: {
      title: 'Settings - Customize Your Kaiboard Experience',
      description: 'Manage your account settings, timezone preferences, notification settings, and customize your Kaiboard experience for optimal productivity.',
    },
  },
  
  // Structured data templates
  structuredData: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Kaiboard',
      description: 'Project Management for Distributed Teams - Schedule meetings across timezones with ease.',
      foundingDate: '2024',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
    },
    
    softwareApplication: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Kaiboard',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      softwareVersion: '2.0',
      releaseNotes: 'Beta version with enhanced collaboration features',
      featureList: [
        'Smart timezone scheduling',
        'Distributed team collaboration',
        'Meeting management',
        'Team calendar integration',
        'Cross-timezone meeting optimization',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free Beta Access',
      },
    },
  },
};

// Helper function to generate page metadata
export function generatePageMetadata(pageKey: keyof typeof seoConfig.pages, customData?: any) {
  const pageConfig = seoConfig.pages[pageKey];
  const baseUrl = seoConfig.baseUrl;
  
  return {
    title: pageConfig.title,
    description: pageConfig.description,
    keywords: seoConfig.keywords,
    openGraph: {
      ...seoConfig.openGraph,
      title: pageConfig.title,
      description: pageConfig.description,
      url: pageKey === 'home' ? baseUrl : `${baseUrl}/${pageKey}`,
    },
    twitter: {
      ...seoConfig.twitter,
      title: pageConfig.title,
      description: pageConfig.description,
    },
    alternates: {
      canonical: pageKey === 'home' ? baseUrl : `${baseUrl}/${pageKey}`,
    },
    ...customData,
  };
} 