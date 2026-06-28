import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { LANDING_CONTENT } from '@/lib/constants'

// Hex pattern — white strokes for dark forest green background
const HERO_PATTERN_SVG = `url("data:image/svg+xml,<svg id='patternId' width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='68' height='61.151' patternTransform='scale(0.7) rotate(0)'><rect x='0' y='0' width='100%25' height='100%25' fill='hsla(0,0%25,0%25,0)'/><path d='M113.548 50.575H90.454l-11.547-20 11.547-20h23.094l11.547 20zm-136 0h-23.095l-11.547-20 11.547-20h23.094l11.547 20zm119 30.576H73.452l-11.547-20 11.547-20h23.094l11.547 20zm-34 0H39.452l-11.547-20 11.547-20h23.094l11.547 20zm-34 0H5.452l-11.547-20 11.547-20h23.094l11.547 20zm-34.001 0h-23.094l-11.547-20 11.547-20h23.094l11.547 20zm61.906-30.576h23.094l11.547-20-11.547-20H56.453l-11.547 20zm-10.906 0H22.453l-11.547-20 11.547-20h23.094l11.547 20zm-34 0h-23.094l-11.547-20 11.547-20h23.094l11.547 20zm85-30.575H73.453L61.906 0l11.547-20h23.094l11.547 20zm-34 0H39.453L27.906 0l11.547-20h23.094L74.094 0zm-34 0H5.453L-6.094 0 5.453-20h23.094L40.094 0zm-34 0h-23.094L-40.094 0l11.547-20h23.094L6.094 0z' stroke-width='1' stroke='hsla(0,0%25,100%25,0.07)' fill='none'/></pattern></defs><rect width='800%25' height='800%25' transform='translate(0,0)' fill='url(%23a)'/></svg>")`

export function HeroSection() {
  return (
    <section
      className="px-12 py-20 relative"
      style={{
        minHeight: 580,
        background: 'linear-gradient(135deg, #0e2e24 0%, #173d30 100%)',
      }}
    >
      {/* Hex pattern overlay — fades out toward bottom-left */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: HERO_PATTERN_SVG,
        WebkitMaskImage: 'radial-gradient(ellipse at 0% 100%, transparent 0%, black 55%)',
        maskImage: 'radial-gradient(ellipse at 0% 100%, transparent 0%, black 55%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div className="flex flex-col lg:flex-row items-center gap-16 max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>

        {/* Left column */}
        <div className="flex-1 min-w-0">

          {/* Eyebrow */}
          <div className="flex items-center mb-5" style={{ gap: 8 }}>
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(196,124,46,0.9)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Your personal doa companion
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 58,
            fontWeight: 400,
            color: '#f5f0e8',
            lineHeight: 1.1,
            marginBottom: 20,
          }}>
            {LANDING_CONTENT.hero.title}
            <br />
            <em style={{ fontStyle: 'italic', color: '#cd9c54' }}>
              {LANDING_CONTENT.hero.subtitle}
            </em>
          </h1>

          {/* Subtext */}
          <p style={{
            fontFamily: "'Lora', serif",
            fontSize: 17,
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'rgba(245,240,232,0.65)',
            lineHeight: 1.8,
            maxWidth: 480,
            marginBottom: 38,
          }}>
            {LANDING_CONTENT.hero.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap" style={{ gap: 12 }}>
            <Link
              to="/doa"
              className="hero-cta-primary inline-flex items-center"
              style={{
                gap: 7,
                border: 'none',
                borderRadius: 11,
                padding: '14px 30px',
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: '#ffffff',
                textDecoration: 'none',
              }}
            >
              {LANDING_CONTENT.hero.primaryCTA}
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/onboarding"
              className="hero-cta-secondary inline-flex items-center justify-center"
              style={{
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 11,
                padding: '14px 30px',
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: 'rgba(245,240,232,0.9)',
                textDecoration: 'none',
              }}
            >
              {LANDING_CONTENT.hero.secondaryCTA}
            </Link>
          </div>
        </div>

        {/* Right column — illustration */}
        <div className="flex-1 min-w-0 flex justify-center items-center">
          <img
            src="/people_berdoa.svg"
            alt="People praying together"
            className="w-full h-auto drop-shadow-2xl"
          />
        </div>

      </div>
    </section>
  )
}
