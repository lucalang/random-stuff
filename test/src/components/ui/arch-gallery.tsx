'use client'

import { useState, type CSSProperties } from 'react'

type GalleryItem = {
  image: { src: string; alt?: string }
}

type ArchGalleryProps = {
  items?: GalleryItem[]
  cardWidth?: number
  cardHeight?: number
  cornerRadius?: number
  className?: string
}

const DEFAULT_ITEMS: GalleryItem[] = [
  {
    image: {
      src: 'https://image.stern.de/7561920/t/5H/v4/w1440/r1/-/affen-selfie-peta-david-slater.jpg',
      alt: 'Monkey looking very cool',
    },
  },
  {
    image: {
      src: 'https://cdn.unitycms.io/images/EdRyNSHwagU9lTts9waV2h.jpg',
      alt: 'Monkey looking very funny',
    },
  },
  {
    image: {
      src: 'https://media.licdn.com/dms/image/v2/D4E03AQH35i-8ZaDPlQ/profile-displayphoto-scale_200_200/B4EZiEwUzSHIAY-/0/1754573919269?e=2147483647&v=beta&t=Rn8WykT0qyVXRlZJ3QPbwR1qR8x5pXefTkq_gwkx9cs',
      alt: 'Monkey sitting on a branch',
    },
  },
  {
    image: {
      src: 'https://media.licdn.com/dms/image/v2/D4D03AQGw4v28e2ycpA/profile-displayphoto-crop_800_800/B4DZq0gjmCH0AI-/0/1763965187512?e=1788998400&v=beta&t=EuXXe1oNJ5Gr5fRXVJ1SrmZBUfwbFKvSQHyAW_tTJY0',
      alt: 'Monkey sitting on a branch',
    },
  },
  {
    image: {
      src: 'https://media.licdn.com/dms/image/v2/D4D03AQGw4v28e2ycpA/profile-displayphoto-crop_800_800/B4DZq0gjmCH0AI-/0/1763965187512?e=1788998400&v=beta&t=EuXXe1oNJ5Gr5fRXVJ1SrmZBUfwbFKvSQHyAW_tTJY0',
      alt: 'Monkey sitting on a branch',
    },
  },
]

const ROTATE_STEP = 6
const Y_STEP = 18
const OVERLAP = 0.58
const HOVER_SCALE = 1.08
const HOVER_LIFT = 16

export function ArchGallery({
  items = DEFAULT_ITEMS,
  cardWidth = 180,
  cardHeight = 240,
  cornerRadius = 18,
  className = '',
}: ArchGalleryProps) {
  const deck = items.length ? items : DEFAULT_ITEMS
  const total = deck.length
  const mid = (total - 1) / 2
  const [hovered, setHovered] = useState<number | null>(null)
  const stageWidth = cardWidth + Math.abs(mid) * 2 * cardWidth * OVERLAP + cardWidth * 0.2
  const stageHeight = cardHeight + Math.abs(mid) * Y_STEP + 48

  return (
    <div
      className={['flex w-full items-center justify-center overflow-x-auto py-10', className].filter(Boolean).join(' ')}
      role="group"
      aria-label="Image gallery"
    >
      <div className="relative shrink-0" style={{ width: stageWidth, height: stageHeight }}>
        {deck.map((entry, index) => {
          const offset = index - mid
          const rotate = offset * ROTATE_STEP
          const translateY = Math.abs(offset) * Y_STEP
          const translateX = offset * cardWidth * OVERLAP
          const baseZ = total - Math.abs(offset)
          const isHovered = hovered === index
          const cardStyle: CSSProperties = {
            position: 'absolute', left: '50%', top: '50%', width: cardWidth, height: cardHeight,
            marginLeft: -cardWidth / 2, marginTop: -cardHeight / 2, borderRadius: cornerRadius,
            overflow: 'hidden', transformOrigin: 'center center',
            transform: isHovered
              ? `translate(${translateX}px, ${translateY - HOVER_LIFT}px) rotate(0deg) scale(${HOVER_SCALE})`
              : `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(1)`,
            zIndex: isHovered ? total + 1 : baseZ,
            transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), z-index 0ms',
            boxShadow: '0 12px 28px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18)',
            cursor: 'pointer', backgroundColor: '#f3f4f6',
          }

          return (
            <div
              key={`${entry.image.src}-${index}`}
              style={cardStyle}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              aria-label={entry.image.alt || `Photo ${index + 1}`}
            >
              <img src={entry.image.src} alt={entry.image.alt || ''} draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover" />
            </div>
          )
        })}
      </div>
    </div>
  )
}