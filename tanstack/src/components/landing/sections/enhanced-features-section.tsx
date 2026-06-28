import { useState } from 'react'
import type React from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Image as PhotoIcon,
  Pencil,
  Download,
  Languages,
  QrCode,
  Heart,
} from 'lucide-react'
import { useSession } from '@/lib/auth-client'

// Arabesque circle pattern — transparent bg, amber strokes on warm light gradient
const SECTION_PATTERN_SVG = `url("data:image/svg+xml,<svg id='patternId' width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='30' height='30' patternTransform='scale(2) rotate(0)'><rect x='0' y='0' width='100%25' height='100%25' fill='hsla(0,0%25,0%25,0)'/><path d='M9 20.502h0A7.5 7.5 0 0 1 1.5 28 7.5 7.5 0 0 0-6 35.5h0a7.5 7.5 0 0 1-7.5 7.499 7.476 7.476 0 0 1-5.304-2.196A7.482 7.482 0 0 1-21 35.5h0a7.5 7.5 0 0 1 7.5-7.5A7.5 7.5 0 0 0-6 20.502h0a7.5 7.5 0 1 1 15 0zm15 0h0A7.5 7.5 0 0 1 16.5 28a7.476 7.476 0 0 1-5.304-2.196A7.482 7.482 0 0 1 9 20.502h0c0-2.072-.84-3.947-2.197-5.303A7.477 7.477 0 0 0 1.5 13.002a7.476 7.476 0 0 1-5.304-2.196A7.482 7.482 0 0 1-6 5.503h0a7.5 7.5 0 1 1 15 0h0c0 2.07.84 3.945 2.196 5.303a7.476 7.476 0 0 0 5.304 2.196c2.07 0 3.945.84 5.303 2.197A7.471 7.471 0 0 1 24 20.502zm15 0h0A7.5 7.5 0 0 1 31.5 28a7.5 7.5 0 0 0-7.5 7.5h0a7.5 7.5 0 0 1-7.5 7.499 7.476 7.476 0 0 1-5.304-2.196A7.482 7.482 0 0 1 9 35.5h0a7.5 7.5 0 0 1 7.5-7.5 7.5 7.5 0 0 0 7.5-7.498h0a7.5 7.5 0 1 1 15 0zm0-30h0A7.5 7.5 0 0 1 31.5-2 7.5 7.5 0 0 0 24 5.5h0a7.5 7.5 0 0 1-7.5 7.499 7.476 7.476 0 0 1-5.304-2.196A7.482 7.482 0 0 1 9 5.5h0A7.5 7.5 0 0 1 16.5-2 7.5 7.5 0 0 0 24-9.498h0a7.5 7.5 0 1 1 15 0zm-22.5 37.5a7.5 7.5 0 0 0-7.5 7.5c0-2.072-.84-3.947-2.197-5.303A7.477 7.477 0 0 0 1.5 28.002 7.5 7.5 0 0 0 9 20.503c0 2.07.84 3.945 2.196 5.303a7.476 7.476 0 0 0 5.304 2.196zm15-15a7.5 7.5 0 0 0-7.5 7.5c0-2.072-.84-3.947-2.197-5.303a7.477 7.477 0 0 0-5.303-2.197A7.5 7.5 0 0 0 24 5.503c0 2.07.84 3.945 2.196 5.303a7.476 7.476 0 0 0 5.304 2.196z' stroke-width='1' stroke='hsla(47,80.9%25,61%25,1)' fill='none'/></pattern></defs><rect width='800%25' height='800%25' transform='translate(0,0)' fill='url(%23a)'/></svg>")`

const CARDS = [
  {
    Icon: Pencil,
    title: 'Compose your prayers',
    description: 'Create and personalise supplications in your own words.',
  },
  {
    Icon: PhotoIcon,
    title: 'Generate doa images',
    description: 'Turn prayer lists into beautiful shareable image cards.',
  },
  {
    Icon: Download,
    title: 'Download your cards',
    description: 'Save prayer cards to your device to share anytime.',
  },
  {
    Icon: Languages,
    title: 'Write in your language',
    description: 'Craft prayers in Malay or English freely.',
  },
  {
    Icon: QrCode,
    title: 'Give via mosque QR',
    description: 'Give back using SedekahJe QR codes effortlessly.',
  },
  {
    Icon: Heart,
    title: 'Bookmark favourites',
    description: 'Keep beloved duas organised and within reach.',
  },
]

function FeatureCard({
  Icon,
  title,
  description,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>
  title: string
  description: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.10)'}`,
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        boxSizing: 'border-box',
        minHeight: 160,
        boxShadow: hovered
          ? '0 12px 40px rgba(0,0,0,0.35)'
          : '0 8px 32px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Amber icon tile */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: 'rgba(245,158,11,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          flexShrink: 0,
        }}
      >
        <Icon size={18} color="#d97706" strokeWidth={1.75} />
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: '#f5f0e8',
          lineHeight: 1.3,
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: 12,
          fontStyle: 'italic',
          color: 'rgba(245,240,232,0.55)',
          lineHeight: 1.6,
          margin: 0,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {description}
      </p>
    </div>
  )
}

export function EnhancedFeaturesSection() {
  const [btnHovered, setBtnHovered] = useState(false)
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  return (
    <section
      className="relative overflow-hidden py-16 px-5 sm:px-10 lg:py-[88px] lg:px-12"
      style={{ background: 'linear-gradient(135deg, #0e2e24 0%, #173d30 100%)' }}
    >
      {/* Arabesque pattern overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: SECTION_PATTERN_SVG,
          opacity: 0.1,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Content wrapper */}
      <div
        className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-14 relative"
        style={{ zIndex: 1 }}
      >
        {/* ── Left column ───────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col justify-center w-full">
          {/* Eyebrow */}
          <span
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 10,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#e5b96f',
              alignSelf: 'flex-start',
              marginBottom: 16,
              display: 'block',
            }}
          >
            Discover GetDoa
          </span>

          {/* Headline */}
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 40,
              fontWeight: 400,
              color: '#f5f0e8',
              lineHeight: 1.15,
              margin: '0 0 16px',
            }}
          >
            Your doa practice,{' '}
            <em style={{ fontStyle: 'italic', color: '#cd9c54' }}>
              deepened.
            </em>
          </h2>

          {/* Body */}
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: 17,
              fontStyle: 'italic',
              color: 'rgba(245,240,232,0.60)',
              lineHeight: 1.8,
              margin: '0 0 40px',
            }}
          >
            Create a free account and unlock intelligent tools built around
            your practice.
          </p>

          {/* CTA — amber button to stand out from dark green bg */}
          <Link
            to={isLoggedIn ? '/dashboard' : '/login'}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: btnHovered ? '#b8893e' : '#cd9c54',
              border: 'none',
              borderRadius: 11,
              padding: '14px 30px',
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              color: '#ffffff',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              whiteSpace: 'nowrap',
            }}
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Sign up for free'}
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Hairline divider — desktop only */}
        <div
          aria-hidden
          className="hidden lg:block"
          style={{
            width: 0.5,
            backgroundColor: 'rgba(255,255,255,0.12)',
            alignSelf: 'stretch',
            flexShrink: 0,
          }}
        />

        {/* ── Right column — responsive card grid ───────────────── */}
        <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-[14px]">
          {CARDS.map(({ Icon, title, description }, i) => (
            <FeatureCard key={i} Icon={Icon} title={title} description={description} />
          ))}
        </div>
      </div>
    </section>
  )
}
