import {
  ArrowLeft,
  ArrowRight,
  Check,
  Fingerprint,
  Radio,
  RotateCcw,
  ScanLine,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

const SIGNAL_NODES = [
  { id: 'instinct', label: 'Instinct', code: 'I', x: '24%', y: '31%', frequency: 220 },
  { id: 'memory', label: 'Memory', code: 'II', x: '69%', y: '24%', frequency: 330 },
  { id: 'mischief', label: 'Mischief', code: 'III', x: '31%', y: '72%', frequency: 440 },
] as const

const KONAMI_SEQUENCE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
]

const FIELD_NOTES = [
  {
    number: '01',
    label: 'INSTINCT',
    copy: 'You moved before the interface finished explaining itself.',
  },
  {
    number: '02',
    label: 'MEMORY',
    copy: 'You remembered that every polished system has a loose floorboard.',
  },
  {
    number: '03',
    label: 'MISCHIEF',
    copy: 'You looked where nobody asked you to look. This is how doors appear.',
  },
]

function scrollImmediately(target: HTMLElement | null = null) {
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  if (target) target.scrollIntoView()
  else window.scrollTo({ top: 0 })
  root.style.scrollBehavior = previousBehavior
}

function EasterEgg() {
  const shellRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const konamiIndexRef = useRef(0)
  const [activeNodes, setActiveNodes] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isSpectral, setIsSpectral] = useState(false)
  const [timestamp, setTimestamp] = useState('00:00:00')

  const allNodesFound = activeNodes.length === SIGNAL_NODES.length

  useEffect(() => {
    const updateClock = () => {
      setTimestamp(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()),
      )
    }

    updateClock()
    const interval = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const shell = shellRef.current
    if (!shell) return

    const trackPointer = (event: PointerEvent) => {
      const bounds = shell.getBoundingClientRect()
      shell.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`)
      shell.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`)
    }

    shell.addEventListener('pointermove', trackPointer, { passive: true })
    return () => shell.removeEventListener('pointermove', trackPointer)
  }, [])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveNodes([])
        setIsRevealed(false)
        setIsSpectral(false)
        konamiIndexRef.current = 0
        scrollImmediately()
        return
      }

      const key = event.key.toLowerCase()
      const expectedKey = KONAMI_SEQUENCE[konamiIndexRef.current]

      if (key === expectedKey) {
        konamiIndexRef.current += 1
        if (konamiIndexRef.current === KONAMI_SEQUENCE.length) {
          setActiveNodes(SIGNAL_NODES.map((node) => node.id))
          setIsRevealed(true)
          setIsSpectral(true)
          konamiIndexRef.current = 0
        }
      } else {
        konamiIndexRef.current = key === KONAMI_SEQUENCE[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  useEffect(() => {
    return () => {
      const context = audioContextRef.current
      audioContextRef.current = null
      if (context && context.state !== 'closed') void context.close()
    }
  }, [])

  useEffect(() => {
    if (!isRevealed) return
    scrollImmediately(document.getElementById('subject-008'))
  }, [isRevealed])

  const playTone = (frequency: number, force = false) => {
    if (!soundEnabled && !force) return

    const context = audioContextRef.current ?? new AudioContext()
    audioContextRef.current = context
    if (context.state === 'suspended') void context.resume()

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const now = context.currentTime

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.4, now + 0.12)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.18)
  }

  const toggleSound = () => {
    const nextValue = !soundEnabled
    setSoundEnabled(nextValue)
    if (nextValue) playTone(196, true)
  }

  const activateNode = (id: string, frequency: number) => {
    if (activeNodes.includes(id)) return
    setActiveNodes((current) => [...current, id])
    playTone(frequency)
  }

  const revealSubject = () => {
    if (!allNodesFound) return
    setIsRevealed(true)
    playTone(523)
  }

  const resetSignal = () => {
    setActiveNodes([])
    setIsRevealed(false)
    setIsSpectral(false)
    scrollImmediately()
  }

  return (
    <div
      ref={shellRef}
      className={`egg-shell${isRevealed ? ' is-revealed' : ''}${isSpectral ? ' is-spectral' : ''}`}
      style={{ '--signal-progress': activeNodes.length / SIGNAL_NODES.length } as CSSProperties}
    >
      <a className="skip-link" href="#egg-main">
        Skip to transmission
      </a>
      <div className="egg-noise" aria-hidden="true" />
      <div className="pointer-crosshair" aria-hidden="true" />

      <header className="egg-header">
        <a className="egg-brand" href="/" aria-label="Return to PRIMATE.OS">
          <Fingerprint aria-hidden="true" />
          <span>PRIMATE.OS</span>
          <i>OFF-GRID</i>
        </a>
        <div className="egg-status" aria-label="Transmission status">
          <span className="status-pulse" aria-hidden="true" />
          PRIVATE CHANNEL / {timestamp}
        </div>
        <div className="egg-tools">
          <span>CH. 00/NULL</span>
          <button
            className="icon-button"
            type="button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Mute signal audio' : 'Enable signal audio'}
            title={soundEnabled ? 'Mute signal audio' : 'Enable signal audio'}
          >
            {soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main id="egg-main">
        <section className="transmission" aria-labelledby="transmission-title">
          <div className="transmission-index" aria-hidden="true">
            <span>UNLISTED TRANSMISSION</span>
            <strong>008</strong>
            <span>51.5072 N / UNKNOWN ORIGIN</span>
          </div>

          <div className="transmission-copy">
            <p className="eyebrow">
              <Radio aria-hidden="true" /> SIGNAL FOUND BETWEEN CHANNELS
            </p>
            <h1 id="transmission-title">
              SOMETHING
              <span>LOOKED</span>
              BACK.
            </h1>
            <p className="transmission-deck">
              The archive indexed seven subjects. The machine insists there were eight.
            </p>
          </div>

          <figure className="subject-frame">
            <img
              src="https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1800&q=90"
              alt="A Japanese macaque looking directly toward the camera"
            />
            <div className="image-wash" aria-hidden="true" />
            <div className="scan-beam" aria-hidden="true">
              <ScanLine />
            </div>
            <div className="frame-corners" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            {SIGNAL_NODES.map((node) => {
              const isActive = activeNodes.includes(node.id)
              return (
                <button
                  className={`signal-node${isActive ? ' is-active' : ''}`}
                  key={node.id}
                  type="button"
                  style={{ '--node-x': node.x, '--node-y': node.y } as CSSProperties}
                  onClick={() => activateNode(node.id, node.frequency)}
                  aria-pressed={isActive}
                  aria-label={`${node.label} signal node${isActive ? ' acquired' : ''}`}
                  title={`${node.label} signal node`}
                >
                  <span className="signal-node__ring" aria-hidden="true" />
                  <span className="signal-node__code">{node.code}</span>
                  <span className="signal-node__label">{node.label}</span>
                </button>
              )
            })}
            <figcaption>
              <span>OPTICAL FEED / UNSANCTIONED</span>
              <span>SUBJECT STATUS / AWAKE</span>
            </figcaption>
          </figure>

          <aside className="decoder" aria-label="Signal decoder">
            <div className="decoder-heading">
              <span><ScanLine aria-hidden="true" /> PATTERN LOCK</span>
              <strong>{String(activeNodes.length).padStart(2, '0')} / 03</strong>
            </div>
            <div className="decoder-meter" aria-hidden="true">
              <i />
              <span />
            </div>
            <ol className="decoder-list">
              {SIGNAL_NODES.map((node, index) => {
                const isActive = activeNodes.includes(node.id)
                return (
                  <li className={isActive ? 'is-active' : ''} key={node.id}>
                    <span>0{index + 1}</span>
                    <strong>{node.label}</strong>
                    {isActive ? <Check aria-label="Acquired" /> : <i aria-hidden="true" />}
                  </li>
                )
              })}
            </ol>
            <p className="decoder-clue">
              Instinct wakes the signal. Memory gives it shape. Mischief opens the door.
            </p>
            <button
              className="decode-button"
              type="button"
              disabled={!allNodesFound}
              onClick={revealSubject}
            >
              <span>{allNodesFound ? 'DECODE SUBJECT' : 'AWAITING SIGNALS'}</span>
              <ArrowRight aria-hidden="true" />
            </button>
          </aside>

          <div className="transmission-ticker" aria-hidden="true">
            <div>
              <span>INSTINCT PRECEDES INSTRUCTION</span>
              <i />
              <span>CURIOSITY IS A NAVIGATION SYSTEM</span>
              <i />
              <span>NOT ALL DOORS LOOK LIKE DOORS</span>
              <i />
              <span>INSTINCT PRECEDES INSTRUCTION</span>
              <i />
              <span>CURIOSITY IS A NAVIGATION SYSTEM</span>
            </div>
          </div>
        </section>

        <section
          id="subject-008"
          className="reveal"
          aria-hidden={!isRevealed}
          aria-labelledby="reveal-title"
        >
          <div className="reveal-scan" aria-hidden="true" />
          <div className="reveal-orbit" aria-hidden="true">
            <Fingerprint />
            <span />
            <span />
          </div>
          <div className="reveal-label">
            <Sparkles aria-hidden="true" />
            ARCHIVE CORRECTION / SUBJECT 008
          </div>
          <div className="reveal-copy">
            <p>{isSpectral ? 'SPECTRAL OVERRIDE ACCEPTED' : 'IDENTITY MATCH CONFIRMED'}</p>
            <h2 id="reveal-title">
              THE OBSERVER
              <span>WAS YOU.</span>
            </h2>
            <div className="classification">
              <span>CLASS / HOMO LUDENS</span>
              <span>TRAIT / UNAUTHORIZED CURIOSITY</span>
              <span>STATUS / STILL LOOKING</span>
            </div>
          </div>

          <div className="field-notes">
            {FIELD_NOTES.map((note) => (
              <article key={note.number}>
                <span>{note.number}</span>
                <h3>{note.label}</h3>
                <p>{note.copy}</p>
              </article>
            ))}
          </div>

          <blockquote>
            <p>Every archive is changed by the person curious enough to enter it.</p>
            <cite>Field note 008 / recovered intact</cite>
          </blockquote>

          <div className="reveal-actions">
            <a href="/">
              <ArrowLeft aria-hidden="true" />
              RETURN TO THE ARCHIVE
            </a>
            <button type="button" onClick={resetSignal} title="Reset transmission">
              <RotateCcw aria-hidden="true" />
              <span>RESET SIGNAL</span>
            </button>
          </div>

          <p className="deep-code" aria-label="Secondary archive checksum">
            CHECKSUM / UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A
          </p>
        </section>
      </main>
    </div>
  )
}

export default EasterEgg