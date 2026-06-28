import { useState } from 'react'
import { Link } from '@tanstack/react-router'

// Same hex pattern as hero — dark green strokes for light background
const CTA_PATTERN_SVG = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'><defs><pattern id='ctap' patternUnits='userSpaceOnUse' width='68' height='61.151' patternTransform='scale(0.7) rotate(0)'><rect width='100%25' height='100%25' fill='none'/><path d='M113.548 50.575H90.454l-11.547-20 11.547-20h23.094l11.547 20zm-136 0h-23.095l-11.547-20 11.547-20h23.094l11.547 20zm119 30.576H73.452l-11.547-20 11.547-20h23.094l11.547 20zm-34 0H39.452l-11.547-20 11.547-20h23.094l11.547 20zm-34 0H5.452l-11.547-20 11.547-20h23.094l11.547 20zm-34.001 0h-23.094l-11.547-20 11.547-20h23.094l11.547 20zm61.906-30.576h23.094l11.547-20-11.547-20H56.453l-11.547 20zm-10.906 0H22.453l-11.547-20 11.547-20h23.094l11.547 20zm-34 0h-23.094l-11.547-20 11.547-20h23.094l11.547 20zm85-30.575H73.453L61.906 0l11.547-20h23.094l11.547 20zm-34 0H39.453L27.906 0l11.547-20h23.094L74.094 0zm-34 0H5.453L-6.094 0 5.453-20h23.094L40.094 0zm-34 0h-23.094L-40.094 0l11.547-20h23.094L6.094 0z' stroke-width='1' stroke='hsla(160,60%25,20%25,1)' fill='none'/></pattern></defs><rect width='800%25' height='800%25' fill='url(%23ctap)'/></svg>")`

export function CTASection() {
  const [primaryHovered, setPrimaryHovered] = useState(false)
  const [secondaryHovered, setSecondaryHovered] = useState(false)

  return (
    <section
      className="relative overflow-hidden px-5 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24"
      style={{
        background: 'linear-gradient(205deg, #fdfcf3 0%, #eef5ee 60%, #cde8d8 100%)',
        textAlign: 'center',
      }}
    >
      {/* Layer 1 — Islamic geometric pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: CTA_PATTERN_SVG,
          backgroundSize: '100px 100px',
          opacity: 0.04,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Layer 2 — concentric circle arcs, top-left pair */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          top: -260,
          left: -160,
          border: '1px solid rgba(30,138,116,0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          top: -120,
          left: -60,
          border: '1px solid rgba(30,138,116,0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Layer 2 — concentric circle arcs, bottom-right pair */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          bottom: -260,
          right: -160,
          border: '1px solid rgba(30,138,116,0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          bottom: -120,
          right: -60,
          border: '1px solid rgba(30,138,116,0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Inner content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
        {/* Arabic quote */}
        <p
          style={{
            fontSize: 22,
            color: '#1e8a74',
            opacity: 0.5,
            direction: 'rtl',
            letterSpacing: '0.05em',
            marginBottom: 20,
          }}
        >
          بِسْمِ اللَّهِ
        </p>

        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ width: 20, height: 1, background: '#1e8a74', display: 'block', flexShrink: 0 }} />
          <span
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#1e8a74',
              whiteSpace: 'nowrap',
            }}
          >
            Begin today
          </span>
          <span style={{ width: 20, height: 1, background: '#1e8a74', display: 'block', flexShrink: 0 }} />
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 42,
            fontWeight: 400,
            color: '#0a1f18',
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Your duas{' '}
          <em style={{ fontStyle: 'italic', color: '#1e8a74' }}>are waiting.</em>
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 16,
            fontStyle: 'italic',
            color: '#5F5E5A',
            lineHeight: 1.8,
            maxWidth: 440,
            margin: '0 auto 40px',
          }}
        >
          Every dua you save is a moment you carry with you. Start building your collection today.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Link
            to="/onboarding"
            className="inline-flex items-center"
            onMouseEnter={() => setPrimaryHovered(true)}
            onMouseLeave={() => setPrimaryHovered(false)}
            style={{
              backgroundColor: primaryHovered ? '#153830' : '#0f5f50',
              border: 'none',
              borderRadius: 10,
              padding: '13px 32px',
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: '#ffffff',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease',
            }}
          >
            Create your doa list
          </Link>

          <Link
            to="/lists"
            className="inline-flex items-center justify-center"
            onMouseEnter={() => setSecondaryHovered(true)}
            onMouseLeave={() => setSecondaryHovered(false)}
            style={{
              backgroundColor: secondaryHovered ? 'rgba(15,95,80,0.05)' : 'transparent',
              border: '1px solid rgba(15,95,80,0.4)',
              borderRadius: 10,
              padding: '13px 24px',
              fontSize: 14,
              color: '#0f5f50',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease',
            }}
          >
            Browse lists
          </Link>
        </div>

        {/* Footnote */}
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 13,
            fontStyle: 'italic',
            color: '#888780',
            textAlign: 'center',
          }}
        >
          Free to start. No credit card needed.
        </p>
      </div>
    </section>
  )
}
