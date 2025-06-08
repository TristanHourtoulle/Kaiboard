interface StructuredDataProps {
  type?: 'website' | 'organization' | 'softwareApplication' | 'breadcrumb';
  data?: Record<string, any>;
}

export function StructuredData({ type = 'website', data = {} }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kaiboard.vercel.app';
    
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Kaiboard',
          description: 'Project Management for Distributed Teams - Schedule meetings across timezones with ease.',
          url: baseUrl,
          logo: `${baseUrl}/kaiboard-logo/Logo Kaiboard Transparent.svg`,
          foundingDate: '2024',
          sameAs: [
            // Add social media links when available
            // 'https://twitter.com/kaiboard',
            // 'https://linkedin.com/company/kaiboard',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            // Add contact information when available
            // email: 'support@kaiboard.com',
          },
          ...data,
        };

      case 'softwareApplication':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Kaiboard',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any',
          description: 'Project Management for Distributed Teams - Schedule meetings across timezones with ease. Collaborate seamlessly with your global team.',
          url: baseUrl,
          screenshot: `${baseUrl}/assets/screenshots/Kaiboard-cover.jpeg`,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free Beta Access',
          },
          author: {
            '@type': 'Organization',
            name: 'Kaiboard Team',
          },
          softwareVersion: '2.0',
          releaseNotes: 'Beta version with enhanced collaboration features',
          featureList: [
            'Smart timezone scheduling',
            'Distributed team collaboration',
            'Meeting management',
            'Team calendar integration',
            'Cross-timezone meeting optimization',
          ],
          ...data,
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.breadcrumbs?.map((crumb: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: `${baseUrl}${crumb.url}`,
          })) || [],
        };

      case 'website':
      default:
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Kaiboard',
          description: 'Project Management for Distributed Teams - Schedule meetings across timezones with ease.',
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Kaiboard',
          },
          ...data,
        };
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
} 