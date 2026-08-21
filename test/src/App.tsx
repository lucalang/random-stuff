import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowUpRight,
  Asterisk,
  Crosshair,
  Fingerprint,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { ArchGallery } from '@/components/ui/arch-gallery'
import DiscoveryLayer from '@/components/ui/discovery-layer'
import DiagonalMarqueeCarousel from '@/components/ui/great-ui-diagonal-marquee-carousel'
import FieldMissions from '@/components/ui/field-missions'
import HeroFuturistic from '@/components/ui/hero-futuristic'
import KineticAtmosphere from '@/components/ui/kinetic-atmosphere'
import NeuralPlayground from '@/components/ui/neural-playground'
import ScrollCinema from '@/components/ui/scroll-cinema'
import SignalGames from '@/components/ui/signal-games'

const IMAGE_PARAMS = '?auto=format&fit=crop&w=1200&q=88'

const ARCHIVE_ITEMS = [
  {
    image: {
      src: `https://images.unsplash.com/photo-1540573133985-87b6da6d54a9${IMAGE_PARAMS}`,
      alt: 'Japanese macaque looking toward the camera',
    },
  },
  {
    image: {
      src: `https://images.unsplash.com/photo-1564349683136-77e08dba1ef7${IMAGE_PARAMS}`,
      alt: 'Giant panda resting in green foliage',
    },
  },
  {
    image: {
      src: `https://images.unsplash.com/photo-1549366021-9f761d450615${IMAGE_PARAMS}`,
      alt: 'Elephant walking through an open landscape',
    },
  },
  {
    image: {
      src: `https://images.unsplash.com/photo-1474511320723-9a56873867b5${IMAGE_PARAMS}`,
      alt: 'Red fox standing in the wild',
    },
  },
  {
    image: {
      src: `https://images.unsplash.com/photo-1557050543-4d5f4e07ef46${IMAGE_PARAMS}`,
      alt: 'Giraffe framed against the sky',
    },
  },
  {
    image: {
      src: `https://images.unsplash.com/photo-1484406566174-9da000fda645${IMAGE_PARAMS}`,
      alt: 'Deer standing in tall grass',
    },
  },
  {
    image: {
      src: `https://images.unsplash.com/photo-1456926631375-92c8ce872def${IMAGE_PARAMS}`,
      alt: 'Leopard watching from a tree',
    },
  },
]

const SPECIMENS = [
  {
    id: '001',
    name: 'The Observer',
    taxonomy: 'Macaca fuscata',
    signal: 'Curiosity',
    image: ARCHIVE_ITEMS[0].image.src,
  },
  {
    id: '002',
    name: 'Soft Machine',
    taxonomy: 'Ailuropoda melanoleuca',
    signal: 'Stillness',
    image: ARCHIVE_ITEMS[1].image.src,
  },
  {
    id: '003',
    name: 'Long Memory',
    taxonomy: 'Loxodonta africana',
    signal: 'Kinship',
    image: ARCHIVE_ITEMS[2].image.src,
  },
  {
    id: '004',
    name: 'Red Frequency',
    taxonomy: 'Vulpes vulpes',
    signal: 'Adaptation',
    image: ARCHIVE_ITEMS[3].image.src,
  },
  {
    id: '005',
    name: 'High Signal',
    taxonomy: 'Giraffa camelopardalis',
    signal: 'Perspective',
    image: ARCHIVE_ITEMS[4].image.src,
  },
]

const MOTION_CARDS = [
  { id: 'm-1', url: ARCHIVE_ITEMS[0].image.src, title: 'The Observer' },
  {
    id: 'm-2',
    url: `https://images.unsplash.com/photo-1448375240586-882707db888b${IMAGE_PARAMS}`,
    title: 'Ancient Forest',
  },
  { id: 'm-3', url: ARCHIVE_ITEMS[6].image.src, title: 'Night Hunter' },
  {
    id: 'm-4',
    url: `https://images.unsplash.com/photo-1464822759023-fed622ff2c3b${IMAGE_PARAMS}`,
    title: 'High Ground',
  },
  { id: 'm-5', url: ARCHIVE_ITEMS[2].image.src, title: 'Long Memory' },
  {
    id: 'm-6',
    url: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee${IMAGE_PARAMS}`,
    title: 'Open Frequency',
  },
]

const TRANSMISSIONS = ['INSTINCT', 'MEMORY', 'KINSHIP', 'MOTION', 'DREAM', 'SIGNAL']

function App() {
  const [activeSpecimen, setActiveSpecimen] = useState(0)
  const cursorRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const pagePercentRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const progress = progressRef.current
    const revealTargets = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const depthTargets = document.querySelectorAll<HTMLElement>('[data-depth]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-revealed')
        })
      },
      { threshold: 0.16 },
    )

    revealTargets.forEach((target) => observer.observe(target))

    const updatePointer = (event: PointerEvent) => {
      cursor?.style.setProperty('--cursor-x', `${event.clientX}px`)
      cursor?.style.setProperty('--cursor-y', `${event.clientY}px`)
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
    }

    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight
      const value = available > 0 ? window.scrollY / available : 0
      progress?.style.setProperty('--scroll-progress', `${value}`)
      document.documentElement.style.setProperty('--field-drift-a', `${(window.scrollY * -0.07) % 180}px`)
      document.documentElement.style.setProperty('--field-drift-b', `${(window.scrollY * 0.11) % 240}px`)
      document.documentElement.style.setProperty('--field-rotation', `${value * 320}deg`)
      depthTargets.forEach((target) => {
        const bounds = target.getBoundingClientRect()
        if (bounds.bottom < -160 || bounds.top > window.innerHeight + 160) return

        const viewportOffset = (
          bounds.top + bounds.height / 2 - window.innerHeight / 2
        ) / window.innerHeight
        const depth = Number(target.dataset.depth ?? 0)
        target.style.setProperty('--depth-y', `${viewportOffset * depth}px`)
        target.style.setProperty('--depth-rotate', `${viewportOffset * depth * 0.012}deg`)
      })
      if (pagePercentRef.current) {
        pagePercentRef.current.textContent = `${Math.round(value * 100).toString().padStart(2, '0')}%`
      }
    }

    window.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('scroll', updateProgress)
    }
  }, [])

  const specimen = SPECIMENS[activeSpecimen]

  return (
    <main className="primate-app">
      <DiscoveryLayer />
      <KineticAtmosphere />
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
      <div ref={cursorRef} className="cursor-signal" aria-hidden="true" />
      <div className="page-telemetry" aria-hidden="true">
        <span ref={pagePercentRef}>00%</span>
        <div>{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
        <b>DEPTH FEED</b>
      </div>
      <header className="site-header">
        <a className="site-mark" href="#top" aria-label="Primate OS home">
          <Fingerprint aria-hidden="true" size={19} />
          <span>PRIMATE.OS</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#collection">Archive</a>
          <a href="#signal">Signals</a>
          <a href="#cinema">Film</a>
          <a href="#motion">Motion</a>
          <a href="#lab">Play</a>
          <a href="#neural">Neural</a>
          <a href="#missions">Missions</a>
        </nav>
        <a className="site-status" href="#signal">
          <i aria-hidden="true" />
          Live index
        </a>
      </header>
      <HeroFuturistic />
      <div className="transmission-strip" aria-label="Archive themes">
        <div className="transmission-strip__track">
          {[0, 1].map((copy) => (
            <div className="transmission-strip__set" aria-hidden={copy === 1} key={copy}>
              {TRANSMISSIONS.map((word) => (
                <span key={`${copy}-${word}`}>
                  {word}
                  <Asterisk aria-hidden="true" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <section id="collection" className="archive-section">
        <div className="section-heading" data-reveal>
          <div className="section-heading__index">
            <span>01</span>
            <span>THE LIVING INDEX</span>
          </div>
          <h2 data-depth="-34">
            BEAUTIFUL
            <span>ANIMALS.</span>
            UNSTABLE IDEAS.
          </h2>
          <p data-depth="18">
            Seven field notes on creatures who mastered collaboration, memory,
            mischief, and survival before we taught machines to imitate them.
          </p>
        </div>
        <div className="archive-gallery-wrap" data-reveal>
          <div className="archive-radar" aria-hidden="true">
            <span />
            <span />
            <Crosshair />
          </div>
          <ArchGallery
            items={ARCHIVE_ITEMS}
            cardWidth={188}
            cardHeight={264}
            cornerRadius={3}
          />
          <div className="archive-caption">
            <span>Seven observations / Vol. 01</span>
            <span>Hover to isolate</span>
          </div>
        </div>
        <div className="telemetry-grid" data-reveal>
          <div>
            <strong>07</strong>
            <span>living subjects</span>
          </div>
          <div>
            <strong>20</strong>
            <span>active signals</span>
          </div>
          <div>
            <strong>∞</strong>
            <span>possible futures</span>
          </div>
          <div className="telemetry-grid__wave" aria-hidden="true">
            {Array.from({ length: 28 }, (_, index) => (
              <i key={index} style={{ '--wave-index': index } as CSSProperties} />
            ))}
          </div>
        </div>
      </section>
      <section id="signal" className="signal-section">
        <div className="signal-preview" data-reveal>
          <div className="signal-preview__frame" data-depth="-42">
            <img key={specimen.id} src={specimen.image} alt={specimen.name} />
            <div className="signal-preview__reticle" aria-hidden="true">
              <ScanLine />
            </div>
            <div className="signal-preview__meta">
              <span>SUBJECT / {specimen.id}</span>
              <span>{specimen.taxonomy}</span>
            </div>
          </div>
        </div>
        <div className="signal-index" data-reveal>
          <div className="section-heading__index">
            <span>02</span>
            <span>SIGNAL DIRECTORY</span>
          </div>
          <h2 data-depth="28">FIVE WAYS OF KNOWING.</h2>
          <div className="signal-list">
            {SPECIMENS.map((entry, index) => (
              <button
                className={index === activeSpecimen ? 'is-active' : ''}
                key={entry.id}
                type="button"
                onMouseEnter={() => setActiveSpecimen(index)}
                onFocus={() => setActiveSpecimen(index)}
                onClick={() => setActiveSpecimen(index)}
              >
                <span className="signal-list__id">{entry.id}</span>
                <span className="signal-list__name">{entry.name}</span>
                <span className="signal-list__value">{entry.signal}</span>
                <ArrowUpRight aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>
      <ScrollCinema />
      <section id="motion" className="motion-section">
        <div className="motion-title" aria-hidden="true">
          <span data-depth="-72">KEEP</span>
          <span data-depth="72">MOVING</span>
        </div>
        <div className="motion-label">
          <span>04 / PERPETUAL FIELD</span>
          <span><Sparkles aria-hidden="true" /> MOTION IS MEMORY</span>
        </div>
        <DiagonalMarqueeCarousel
          cards={MOTION_CARDS}
          angle={-18}
          baseSpeed={86}
          className="motion-carousel"
          cardClassName="motion-card"
          fadeClassName="motion-fade"
        />
      </section>
      <SignalGames />
      <NeuralPlayground />
      <FieldMissions />
      <section className="manifesto-section">
        <div className="manifesto-shard" aria-hidden="true">
          <span>WILD / WILD / WILD /</span>
        </div>
        <div className="manifesto-copy" data-reveal>
          <div className="section-heading__index">
            <span>08</span>
            <span>FIELD MANIFESTO</span>
          </div>
          <h2 data-depth="-44">
            INSTINCT IS
            <em>OLDER</em>
            THAN CODE.
          </h2>
          <p data-depth="24">
            The future does not arrive polished. It arrives breathing, watching,
            adapting. Stay strange enough to notice it.
          </p>
        </div>
        <div className="manifesto-coordinate" aria-hidden="true">
          <Crosshair />
          <span>ENDLESS LOOP / 20.26</span>
        </div>
      </section>
      <footer className="site-footer">
        <a href="#top" className="site-footer__title">
          PRIMATE.OS
          <ArrowUpRight aria-hidden="true" />
        </a>
        <div className="site-footer__meta">
          <span>Built for beautiful chaos</span>
          <span>Earth / Signal 001 / 2026</span>
          <span>All instincts reserved</span>
        </div>
      </footer>
    </main>
  )
}

export default App
