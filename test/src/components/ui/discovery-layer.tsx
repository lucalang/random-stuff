'use client'

import {
  AudioWaveform,
  Camera,
  Check,
  Eye,
  Film,
  Footprints,
  Gamepad2,
  LockKeyhole,
  MousePointer2,
  Radio,
  RotateCcw,
  Route,
  Sparkles,
  Terminal,
  Trophy,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

type DiscoveryDefinition = {
  id: string
  index: string
  name: string
  clue: string
  unlockedCopy: string
  icon: LucideIcon
}

type DiscoveryEvent = CustomEvent<{ id?: string; label?: string }>

const STORAGE_KEY = 'primate-os-discoveries-v1'

const DISCOVERIES: DiscoveryDefinition[] = [
  {
    id: 'contact',
    index: 'D-01',
    name: 'First Contact',
    clue: 'Touch the unfinished mind.',
    unlockedCopy: 'The organism changed direction when you arrived.',
    icon: Waves,
  },
  {
    id: 'cinema',
    index: 'D-02',
    name: 'Frame Walker',
    clue: 'Stay inside the moving object.',
    unlockedCopy: 'You watched matter remember every version of itself.',
    icon: Film,
  },
  {
    id: 'specimens',
    index: 'D-03',
    name: 'Field Naturalist',
    clue: 'Inspect every way of knowing.',
    unlockedCopy: 'Five subjects observed. Five signals returned.',
    icon: Eye,
  },
  {
    id: 'player',
    index: 'D-04',
    name: 'Still Awake',
    clue: 'Answer one human-input test.',
    unlockedCopy: 'Reflex is older than explanation.',
    icon: Gamepad2,
  },
  {
    id: 'composer',
    index: 'D-05',
    name: 'Instinct Composer',
    clue: 'Change the pulse until it is yours.',
    unlockedCopy: 'Eight edits turned a loop into a signature.',
    icon: AudioWaveform,
  },
  {
    id: 'terminal',
    index: 'D-06',
    name: 'Anomaly Decoder',
    clue: 'Follow the unlisted carrier.',
    unlockedCopy: 'The living checksum opened Channel 008.',
    icon: Terminal,
  },
  {
    id: 'restless',
    index: 'D-07',
    name: 'Restless Signal',
    clue: 'Leave a long trail through the interface.',
    unlockedCopy: 'Your pointer travelled farther than the archive expected.',
    icon: MousePointer2,
  },
  {
    id: 'photographer',
    index: 'D-08',
    name: 'Field Photographer',
    clue: 'Take one living frame out of the feed.',
    unlockedCopy: 'The archive now holds a moment that did not repeat.',
    icon: Camera,
  },
  {
    id: 'navigator',
    index: 'D-09',
    name: 'Signal Navigator',
    clue: 'Carry the line through every obstruction.',
    unlockedCopy: 'The route survived interference and reached the far edge.',
    icon: Route,
  },
  {
    id: 'deep',
    index: 'D-10',
    name: 'Deep Descent',
    clue: 'Reach the last quarter of the field.',
    unlockedCopy: 'You kept descending after the spectacle should have ended.',
    icon: Footprints,
  },
]

function readStoredDiscoveries() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (!value) return []
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => (
      typeof id === 'string' && DISCOVERIES.some((discovery) => discovery.id === id)
    ))
  } catch {
    return []
  }
}

export function DiscoveryLayer() {
  const [unlocked, setUnlocked] = useState<string[]>(() => readStoredDiscoveries())
  const unlockedRef = useRef<Set<string>>(new Set(unlocked))
  const toastTimerRef = useRef<number | null>(null)
  const previousPointerRef = useRef<{ x: number; y: number } | null>(null)
  const pointerDistanceRef = useRef(0)
  const specimenIdsRef = useRef(new Set<string>())
  const sequencerEditsRef = useRef(0)
  const [toast, setToast] = useState<DiscoveryDefinition | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    const unlock = (id: string, announce = true) => {
      const definition = DISCOVERIES.find((discovery) => discovery.id === id)
      if (!definition || unlockedRef.current.has(id)) return

      unlockedRef.current.add(id)
      const nextUnlocked = DISCOVERIES
        .filter((discovery) => unlockedRef.current.has(discovery.id))
        .map((discovery) => discovery.id)
      setUnlocked(nextUnlocked)

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUnlocked))
      } catch {
        // The field log still works for this session when storage is unavailable.
      }

      if (!announce) return
      setToast(definition)
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = window.setTimeout(() => setToast(null), 4800)
    }

    const handleDiscovery = (event: Event) => {
      const discoveryEvent = event as DiscoveryEvent
      if (discoveryEvent.detail?.id) unlock(discoveryEvent.detail.id)
    }

    const handleScroll = () => {
      const available = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const progress = window.scrollY / available
      if (progress >= 0.76) unlock('deep')
    }

    const handlePointerMove = (event: PointerEvent) => {
      const previous = previousPointerRef.current
      if (previous) {
        pointerDistanceRef.current += Math.min(
          Math.hypot(event.clientX - previous.x, event.clientY - previous.y),
          120,
        )
        if (pointerDistanceRef.current >= 5200) unlock('restless')
      }
      previousPointerRef.current = { x: event.clientX, y: event.clientY }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (target?.closest('.organism-stage')) unlock('contact')
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (!target) return

      if (target.closest('.game-console button')) unlock('player')

      if (target.closest('.sequencer-row > button')) {
        sequencerEditsRef.current += 1
        if (sequencerEditsRef.current >= 8) unlock('composer')
      }
    }

    const handleSpecimenFocus = (event: Event) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest<HTMLButtonElement>('.signal-list button')
      if (!button) return
      const specimenId = button.querySelector('.signal-list__id')?.textContent?.trim()
      if (!specimenId) return
      specimenIdsRef.current.add(specimenId)
      if (specimenIdsRef.current.size >= 5) unlock('specimens')
    }

    const cinema = document.getElementById('cinema')
    const cinemaObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) unlock('cinema')
      },
      { rootMargin: '-38% 0px -38% 0px', threshold: 0 },
    )
    if (cinema) cinemaObserver.observe(cinema)

    window.addEventListener('primate:discovery', handleDiscovery)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerdown', handlePointerDown, { passive: true })
    document.addEventListener('click', handleClick)
    document.addEventListener('mouseover', handleSpecimenFocus)
    document.addEventListener('focusin', handleSpecimenFocus)
    handleScroll()

    return () => {
      cinemaObserver.disconnect()
      window.removeEventListener('primate:discovery', handleDiscovery)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mouseover', handleSpecimenFocus)
      document.removeEventListener('focusin', handleSpecimenFocus)
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  const resetDiscoveries = () => {
    unlockedRef.current = new Set()
    specimenIdsRef.current.clear()
    sequencerEditsRef.current = 0
    pointerDistanceRef.current = 0
    previousPointerRef.current = null
    setUnlocked([])
    setToast(null)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Session state has already been reset.
    }
  }

  const progress = unlocked.length / DISCOVERIES.length

  return (
    <>
      <div className={`discovery-toast${toast ? ' is-visible' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <div className="discovery-toast__icon"><toast.icon aria-hidden="true" /></div>
            <div>
              <span>DISCOVERY UNLOCKED / {toast.index}</span>
              <strong>{toast.name}</strong>
              <p>{toast.unlockedCopy}</p>
            </div>
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss discovery">
              <X aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <button
        className="field-log-trigger"
        type="button"
        onClick={() => setPanelOpen((current) => !current)}
        aria-expanded={panelOpen}
        aria-controls="field-log-panel"
      >
        <span className="field-log-trigger__ring" style={{ '--discovery-progress': progress } as CSSProperties}>
          <Trophy aria-hidden="true" />
        </span>
        <span>
          <i>FIELD LOG</i>
          <strong>{unlocked.length.toString().padStart(2, '0')} / {DISCOVERIES.length.toString().padStart(2, '0')}</strong>
        </span>
      </button>

      <aside
        id="field-log-panel"
        className={`field-log-panel${panelOpen ? ' is-open' : ''}`}
        aria-hidden={!panelOpen}
        inert={!panelOpen}
      >
        <header>
          <div>
            <span><Radio aria-hidden="true" /> PERSISTENT FIELD LOG</span>
            <strong>{Math.round(progress * 100)}% RECOVERED</strong>
          </div>
          <button type="button" onClick={() => setPanelOpen(false)} aria-label="Close field log">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="field-log-panel__meter" aria-hidden="true">
          <i style={{ '--discovery-progress': progress } as CSSProperties} />
          {DISCOVERIES.map((discovery) => (
            <span className={unlocked.includes(discovery.id) ? 'is-on' : ''} key={discovery.id} />
          ))}
        </div>

        <div className="field-log-list">
          {DISCOVERIES.map((discovery) => {
            const isUnlocked = unlocked.includes(discovery.id)
            const Icon = discovery.icon
            return (
              <article className={isUnlocked ? 'is-unlocked' : ''} key={discovery.id}>
                <div className="field-log-list__icon">
                  {isUnlocked ? <Icon aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
                </div>
                <div>
                  <span>{discovery.index}</span>
                  <h3>{isUnlocked ? discovery.name : 'ENCRYPTED FINDING'}</h3>
                  <p>{isUnlocked ? discovery.unlockedCopy : discovery.clue}</p>
                </div>
                {isUnlocked && <Check aria-label="Unlocked" />}
              </article>
            )
          })}
        </div>

        <footer>
          <span><Sparkles aria-hidden="true" /> The archive remembers this browser.</span>
          <button type="button" onClick={resetDiscoveries}>
            <RotateCcw aria-hidden="true" /> Reset
          </button>
        </footer>
      </aside>

      <div
        className={`field-log-scrim${panelOpen ? 'is-visible' : ''}`}
        onClick={() => setPanelOpen(false)}
        aria-hidden="true"
      />
    </>
  )
}

export default DiscoveryLayer