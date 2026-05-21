/**
 * Canvas-based decorative pattern renderer.
 * All patterns are programmatically drawn - no image assets needed.
 */

import type {PatternId} from '@/types/image-customization.types';
import { PATTERNS  } from '@/types/image-customization.types'

interface PatternConfig {
  width: number
  height: number
  primaryColor: string
  secondaryColor?: string
  opacity?: number
}

type PatternRenderer = (ctx: CanvasRenderingContext2D, config: PatternConfig) => void

/**
 * Draw an 8-point star pattern (Islamic geometric).
 */
function draw8PointStar(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.15 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 2

  const size = 60
  const padding = 40

  for (let x = padding; x < width - padding; x += size * 1.5) {
    for (let y = padding; y < height - padding; y += size * 1.5) {
      // Only draw in border areas
      if (
        x > padding + size * 2 &&
        x < width - padding - size * 2 &&
        y > padding + size * 2 &&
        y < height - padding - size * 2
      ) {
        continue
      }

      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4
        const innerRadius = size * 0.3
        const outerRadius = size * 0.5

        const innerX = x + Math.cos(angle) * innerRadius
        const innerY = y + Math.sin(angle) * innerRadius
        const outerX = x + Math.cos(angle + Math.PI / 8) * outerRadius
        const outerY = y + Math.sin(angle + Math.PI / 8) * outerRadius

        if (i === 0) ctx.moveTo(innerX, innerY)
        else ctx.lineTo(innerX, innerY)
        ctx.lineTo(outerX, outerY)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }

  ctx.restore()
}

/**
 * Draw diamond lattice pattern.
 */
function drawDiamondLattice(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.12 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 1

  const size = 40
  const borderWidth = 80

  // Draw lattice only in border area
  for (let x = 0; x < width; x += size) {
    for (let y = 0; y < height; y += size) {
      // Skip center area
      if (
        x > borderWidth &&
        x < width - borderWidth &&
        y > borderWidth &&
        y < height - borderWidth
      ) {
        continue
      }

      ctx.beginPath()
      ctx.moveTo(x + size / 2, y)
      ctx.lineTo(x + size, y + size / 2)
      ctx.lineTo(x + size / 2, y + size)
      ctx.lineTo(x, y + size / 2)
      ctx.closePath()
      ctx.stroke()
    }
  }

  ctx.restore()
}

/**
 * Draw mihrab arch pattern (architectural).
 */
function drawMihrabArch(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.2 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 3

  const centerX = width / 2
  const archWidth = Math.min(width * 0.8, 600)
  const archHeight = height * 0.15

  // Draw pointed arch at top
  ctx.beginPath()
  ctx.moveTo(centerX - archWidth / 2, archHeight + 50)
  ctx.quadraticCurveTo(centerX - archWidth / 4, 30, centerX, 20)
  ctx.quadraticCurveTo(centerX + archWidth / 4, 30, centerX + archWidth / 2, archHeight + 50)
  ctx.stroke()

  // Draw inner arch
  ctx.beginPath()
  ctx.moveTo(centerX - archWidth / 2 + 20, archHeight + 50)
  ctx.quadraticCurveTo(centerX - archWidth / 4 + 10, 50, centerX, 40)
  ctx.quadraticCurveTo(
    centerX + archWidth / 4 - 10,
    50,
    centerX + archWidth / 2 - 20,
    archHeight + 50,
  )
  ctx.stroke()

  ctx.restore()
}

/**
 * Draw crescent moon and stars (organic).
 */
function drawCrescentMoon(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, primaryColor, opacity = 0.15 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = primaryColor

  // Crescent in top-right corner
  const moonX = width - 80
  const moonY = 80
  const moonRadius = 40

  ctx.beginPath()
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = config.secondaryColor || '#ffffff'
  ctx.beginPath()
  ctx.arc(moonX + 15, moonY - 5, moonRadius * 0.85, 0, Math.PI * 2)
  ctx.fill()

  // Small stars
  ctx.fillStyle = primaryColor
  const starPositions = [
    [moonX - 60, moonY - 20],
    [moonX - 40, moonY + 40],
    [moonX + 20, moonY - 50],
  ]

  for (const [sx, sy] of starPositions) {
    drawStar(ctx, sx, sy, 8, 4)
  }

  ctx.restore()
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR: number,
) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const px = x + Math.cos(angle) * r
    const py = y + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

/**
 * Draw simple corner brackets (minimalist).
 */
function drawCornerBrackets(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.3 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 3

  const bracketSize = 60
  const margin = 30

  // Top-left
  ctx.beginPath()
  ctx.moveTo(margin, margin + bracketSize)
  ctx.lineTo(margin, margin)
  ctx.lineTo(margin + bracketSize, margin)
  ctx.stroke()

  // Top-right
  ctx.beginPath()
  ctx.moveTo(width - margin - bracketSize, margin)
  ctx.lineTo(width - margin, margin)
  ctx.lineTo(width - margin, margin + bracketSize)
  ctx.stroke()

  // Bottom-left
  ctx.beginPath()
  ctx.moveTo(margin, height - margin - bracketSize)
  ctx.lineTo(margin, height - margin)
  ctx.lineTo(margin + bracketSize, height - margin)
  ctx.stroke()

  // Bottom-right
  ctx.beginPath()
  ctx.moveTo(width - margin - bracketSize, height - margin)
  ctx.lineTo(width - margin, height - margin)
  ctx.lineTo(width - margin, height - margin - bracketSize)
  ctx.stroke()

  ctx.restore()
}

/**
 * Draw double line frame (minimalist).
 */
function drawDoubleLineFrame(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.2 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor

  // Outer frame
  ctx.lineWidth = 2
  ctx.strokeRect(20, 20, width - 40, height - 40)

  // Inner frame
  ctx.lineWidth = 1
  ctx.strokeRect(30, 30, width - 60, height - 60)

  ctx.restore()
}

/**
 * Draw hexagonal tessellation pattern.
 */
function drawHexagonalTessellation(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.12 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 1

  const size = 30
  const borderWidth = 80

  const drawHexagon = (cx: number, cy: number, r: number) => {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  const hSpacing = size * 1.5
  const vSpacing = size * Math.sqrt(3)

  for (let row = 0; row * vSpacing < height; row++) {
    for (let col = 0; col * hSpacing < width; col++) {
      const x = col * hSpacing + (row % 2 === 0 ? 0 : hSpacing / 2)
      const y = row * (vSpacing / 2)

      // Skip center area
      if (
        x > borderWidth &&
        x < width - borderWidth &&
        y > borderWidth &&
        y < height - borderWidth
      ) {
        continue
      }

      drawHexagon(x, y, size * 0.5)
    }
  }

  ctx.restore()
}

/**
 * Draw wavy lines pattern.
 */
function drawWavyLines(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.15 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 2

  const waveHeight = 15
  const waveLength = 60
  const margin = 40

  // Draw wavy lines at top and bottom
  for (const yBase of [margin, height - margin]) {
    ctx.beginPath()
    for (let x = 0; x <= width; x += 5) {
      const y = yBase + Math.sin((x / waveLength) * Math.PI * 2) * waveHeight
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * Draw dotted border pattern.
 */
function drawDottedBorder(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.2 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = primaryColor

  const dotRadius = 3
  const spacing = 20
  const margin = 30

  // Top and bottom borders
  for (let x = margin; x < width - margin; x += spacing) {
    ctx.beginPath()
    ctx.arc(x, margin, dotRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, height - margin, dotRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  // Left and right borders
  for (let y = margin; y < height - margin; y += spacing) {
    ctx.beginPath()
    ctx.arc(margin, y, dotRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(width - margin, y, dotRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

// Pattern registry
const PATTERN_RENDERERS: Record<PatternId, PatternRenderer> = {
  'eight-point-star': draw8PointStar,
  'diamond-lattice': drawDiamondLattice,
  'hexagonal-tessellation': drawHexagonalTessellation,
  'interlocking-squares': drawDiamondLattice, // Similar to diamond lattice
  'mihrab-arch': drawMihrabArch,
  'mosque-dome': drawMihrabArch, // Uses same arch base
  minarets: drawMihrabArch, // Uses same arch base
  'arabesque-border': drawDiamondLattice, // Uses lattice base
  'crescent-moon': drawCrescentMoon,
  'vine-border': drawWavyLines, // Uses wavy lines as vine simulation
  'floral-corners': drawCornerBrackets, // Uses corner brackets
  'olive-branches': drawWavyLines, // Uses wavy lines
  'wavy-lines': drawWavyLines,
  'dotted-border': drawDottedBorder,
  'gradient-halo': drawCrescentMoon, // Uses crescent base
  'geometric-rays': draw8PointStar, // Uses star pattern
  'corner-brackets': drawCornerBrackets,
  'double-line-frame': drawDoubleLineFrame,
  'simple-border': drawDoubleLineFrame,
  'elegant-divider': drawCornerBrackets,
}

/**
 * Render a pattern onto a canvas context.
 */
export function renderPattern(
  ctx: CanvasRenderingContext2D,
  patternId: PatternId,
  config: PatternConfig,
): void {
  const renderer = PATTERN_RENDERERS[patternId]
  renderer(ctx, config)
}

/**
 * Get all available patterns.
 */
export function getAvailablePatterns(): Array<PatternId> {
  return PATTERNS.map((p) => p.id)
}
