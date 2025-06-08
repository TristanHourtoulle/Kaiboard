import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Kaiboard - Project Management for Distributed Teams'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 24,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 'bold',
                color: '#4F46E5',
              }}
            >
              K
            </div>
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.025em',
            }}
          >
            Kaiboard
          </div>
        </div>
        
        <div
          style={{
            fontSize: 32,
            color: 'white',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
            opacity: 0.9,
          }}
        >
          Project Management for Distributed Teams
        </div>
        
        <div
          style={{
            fontSize: 20,
            color: 'white',
            textAlign: 'center',
            maxWidth: 600,
            marginTop: 20,
            opacity: 0.8,
          }}
        >
          Schedule meetings across timezones with ease
        </div>
        
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 40,
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '12px 24px',
            borderRadius: 50,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: 'white',
              fontWeight: '500',
            }}
          >
            ✨ Now in Beta
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 