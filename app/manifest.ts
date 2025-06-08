import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kaiboard - Project Management for Distributed Teams',
    short_name: 'Kaiboard',
    description: 'Schedule meetings across timezones with ease. Collaborate seamlessly with your global team.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['productivity', 'business', 'collaboration'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      }
    ],
    screenshots: [
      {
        src: '/assets/screenshots/Kaiboard-cover.jpeg',
        sizes: '1200x630',
        type: 'image/jpeg',
        form_factor: 'wide'
      }
    ],
    shortcuts: [
      {
        name: 'Calendar',
        short_name: 'Calendar',
        description: 'View your meeting calendar',
        url: '/calendar',
        icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
      },
      {
        name: 'Meetings',
        short_name: 'Meetings',
        description: 'Manage your meetings',
        url: '/meetings',
        icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
      },
      {
        name: 'Teams',
        short_name: 'Teams',
        description: 'Collaborate with your teams',
        url: '/teams',
        icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
      }
    ]
  }
} 