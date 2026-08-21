'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface CardItem {
  id: string | number
  url: string
  title: string
}

export interface DiagonalMarqueeCarouselProps {
  cards?: CardItem[]
  angle?: number
  baseSpeed?: number
  alternateDirections?: boolean
  className?: string
  cardClassName?: string
  fadeClassName?: string
}

const DEFAULT_CARDS: CardItem[] = [
  {
    id: 1,
    url: 'https://i.ebayimg.com/images/g/UNgAAOSwDNdVmUMa/s-l1200.jpg',
    title: 'Mountain landscape',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
    title: 'Aerial nature',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    title: 'Forest',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    title: 'Valley road',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    title: 'Ocean sunset',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    title: 'Mountain ridge',
  },
]

const Card = ({ card, className }: { card: CardItem; className?: string }) => (
  <div
    className={cn(
      'group relative h-[300px] w-[400px] shrink-0 cursor-pointer overflow-hidden rounded-xl shadow-2xl',
      className,
    )}
  >
    <img src={card.url} alt={card.title} className="h-full w-full object-cover" />
    <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/10" />
  </div>
)

const MarqueeRow = ({
  cards,
  speed,
  direction,
  cardClassName,
}: {
  cards: CardItem[]
  speed: number
  direction: 1 | -1
  cardClassName?: string
}) => {
  const animationClass = direction === -1 ? 'animate-marquee-left' : 'animate-marquee-right'

  return (
    <div className="flex w-full overflow-hidden">
      <div
        className={cn('flex shrink-0 cursor-pointer hover:[animation-play-state:paused]', animationClass)}
        style={{ '--speed': `${speed}s` } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div className="flex shrink-0" key={copy}>
            {cards.map((card, index) => (
              <div key={`${card.id}-${copy}-${index}`} className="shrink-0 pr-8">
                <Card card={card} className={cardClassName} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DiagonalMarqueeCarousel({
  cards = DEFAULT_CARDS,
  angle = -25,
  baseSpeed = 120,
  alternateDirections = true,
  className = '',
  cardClassName = '',
  fadeClassName = '',
}: DiagonalMarqueeCarouselProps) {
  const rotationStyle = { transform: `rotate(${angle}deg)` }
  const rowCards = [...cards, ...cards, ...cards]
  const rowCardsReverse = [...rowCards].reverse()
  const rows = [
    { cards: rowCards, speed: baseSpeed, direction: -1 as const },
    { cards: rowCardsReverse, speed: Math.max(baseSpeed - 15, 30), direction: alternateDirections ? 1 as const : -1 as const },
    { cards: rowCards, speed: baseSpeed + 15, direction: -1 as const },
    { cards: rowCardsReverse, speed: Math.max(baseSpeed - 6, 35), direction: alternateDirections ? 1 as const : -1 as const },
    { cards: rowCards, speed: baseSpeed + 24, direction: -1 as const },
  ]

  return (
    <div className={cn('relative flex h-screen w-full items-center justify-center overflow-hidden', className)}>
      <style>{`
        @keyframes marquee-left {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          from { transform: translate3d(-50%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-left { animation: marquee-left var(--speed) linear infinite; }
        .animate-marquee-right { animation: marquee-right var(--speed) linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-left, .animate-marquee-right { animation-play-state: paused; }
        }
      `}</style>
      <div className="absolute z-0 flex w-[200vw] flex-col gap-8" style={rotationStyle}>
        {rows.map((row, index) => (
          <MarqueeRow key={index} {...row} cardClassName={cardClassName} />
        ))}
      </div>
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 z-10 h-1/4 bg-gradient-to-b from-[#151713] to-transparent', fadeClassName)} />
      <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/4 bg-gradient-to-t from-[#151713] to-transparent', fadeClassName)} />
    </div>
  )
}