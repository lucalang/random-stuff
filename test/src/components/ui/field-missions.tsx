'use client'

import {
  Aperture,
  ArrowRight,
  Camera,
  Check,
  CircleDot,
  Crosshair,
  Eye,
  Focus,
  Grid3X3,
  Lightbulb,
  Map,
  Radio,
  RefreshCw,
  Route,
  ScanLine,
  Satellite,
  Sparkles,
  Target,
  Thermometer,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

type OpticalMode = 'optic' | 'thermal' | 'night'

type CameraFeed = {
  id: string
  name: string
  location: string
  coordinates: string
  image: string
  alt: string
  temperature: string
  motion: string
}

type CapturedFrame = {
  id: number
  feedId: string
  mode: OpticalMode
  timestamp: string
}

const IMAGE_PARAMS = '?auto=format&fit=crop&w=1600&q=90'

const CAMERA_FEEDS: CameraFeed[] = [
  {
    id: 'CAM-01',
    name: 'Observer Ridge',
    location: 'Yakushima / Japan',
    coordinates: '30.358 N / 130.528 E',
    image: `https://images.unsplash.com/photo-1540573133985-87b6da6d54a9${IMAGE_PARAMS}`,
    alt: 'Japanese macaque in a forest',
    temperature: '12.4 C',
    motion: 'LOW',
  },
  {
    id: 'CAM-02',
    name: 'Red Corridor',
    location: 'Breckland / England',
    coordinates: '52.464 N / 0.786 E',
    image: `https://images.unsplash.com/photo-1474511320723-9a56873867b5${IMAGE_PARAMS}`,
    alt: 'Red fox standing in grass',
    temperature: '08.7 C',
    motion: 'HIGH',
  },
  {
    id: 'CAM-03',
    name: 'Memory Plain',
    location: 'Amboseli / Kenya',
    coordinates: '2.652 S / 37.260 E',
    image: `https://images.unsplash.com/photo-1549366021-9f761d450615${IMAGE_PARAMS}`,
    alt: 'Elephant walking through an open landscape',
    temperature: '31.1 C',
    motion: 'NOMINAL',
  },
  {
    id: 'CAM-04',
    name: 'Canopy Shadow',
    location: 'Sabi Sands / South Africa',
    coordinates: '24.793 S / 31.474 E',
    image: `https://images.unsplash.com/photo-1456926631375-92c8ce872def${IMAGE_PARAMS}`,
    alt: 'Leopard resting in a tree',
    temperature: '27.6 C',
    motion: 'LOCKED',
  },
]

const ROUTE_COLUMNS = 9
const ROUTE_ROWS = 7
const ROUTE_START = 27
const ROUTE_GOAL = 35
const BLOCKED_CELLS = new Set([1, 5, 7, 12, 16, 19, 23, 29, 33, 40, 46, 51, 57, 61])

function cellCoordinates(index: number) {
  return {
    column: index % ROUTE_COLUMNS,
    row: Math.floor(index / ROUTE_COLUMNS),
  }
}

function areAdjacent(first: number, second: number) {
  const firstCell = cellCoordinates(first)
  const secondCell = cellCoordinates(second)
  return Math.abs(firstCell.column - secondCell.column) + Math.abs(firstCell.row - secondCell.row) === 1
}

function emitDiscovery(id: string, label: string) {
  window.dispatchEvent(new CustomEvent('primate:discovery', { detail: { id, label } }))
}

function LiveFieldCamera() {
  const [activeFeedId, setActiveFeedId] = useState(CAMERA_FEEDS[0].id)
  const [mode, setMode] = useState<OpticalMode>('optic')
  const [zoom, setZoom] = useState(112)
  const [timestamp, setTimestamp] = useState('00:00:00')
  const [frame, setFrame] = useState(12840)
  const [flash, setFlash] = useState(false)
  const [captures, setCaptures] = useState<CapturedFrame[]>([])
  const flashTimerRef = useRef<number | null>(null)

  const activeFeed = CAMERA_FEEDS.find((feed) => feed.id === activeFeedId) ?? CAMERA_FEEDS[0]

  useEffect(() => {
    const updateClock = () => {
      setTimestamp(new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date()))
    }

    updateClock()
    const clockInterval = window.setInterval(updateClock, 1000)
    const frameInterval = window.setInterval(() => {
      setFrame((current) => current >= 99999 ? 10000 : current + 6)
    }, 240)

    return () => {
      window.clearInterval(clockInterval)
      window.clearInterval(frameInterval)
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
    }
  }, [])

  const captureFrame = () => {
    const nextCapture: CapturedFrame = {
      id: Date.now(),
      feedId: activeFeed.id,
      mode,
      timestamp,
    }
    setCaptures((current) => [nextCapture, ...current].slice(0, 4))
    setFlash(true)
    emitDiscovery('photographer', 'FIELD PHOTOGRAPHER')
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
    flashTimerRef.current = window.setTimeout(() => setFlash(false), 180)
  }

  const restoreCapture = (capture: CapturedFrame) => {
    setActiveFeedId(capture.feedId)
    setMode(capture.mode)
  }

  return (
    <article className={`field-camera is-${mode}${flash ? ' is-flashing' : ''}`}>
      <header className="field-camera__header">
        <span><Satellite aria-hidden="true" /> LIVE BIOGRAPH / FOUR CHANNEL ARRAY</span>
        <strong><i aria-hidden="true" /> REC {timestamp}</strong>
      </header>

      <div className="field-camera__viewport">
        <img
          key={activeFeed.id}
          src={activeFeed.image}
          alt={activeFeed.alt}
          style={{ '--camera-zoom': zoom / 100 } as CSSProperties}
        />
        <div className="field-camera__wash" aria-hidden="true" />
        <div className="field-camera__scan" aria-hidden="true"><ScanLine /></div>
        <div className="field-camera__reticle" aria-hidden="true">
          <i /><i /><Crosshair />
        </div>
        <div className="field-camera__brackets" aria-hidden="true"><i /><i /><i /><i /></div>

        <div className="field-camera__topline" aria-hidden="true">
          <span>{activeFeed.id} / {activeFeed.name}</span>
          <span>FRAME {frame}</span>
          <span>ZOOM {(zoom / 100).toFixed(2)}X</span>
        </div>

        <div className="field-camera__subject" aria-hidden="true">
          <span>SUBJECT LOCK</span>
          <strong>{activeFeed.motion}</strong>
        </div>

        <div className="field-camera__telemetry" aria-hidden="true">
          <span>LOC / {activeFeed.location}</span>
          <span>GPS / {activeFeed.coordinates}</span>
          <span>TEMP / {activeFeed.temperature}</span>
          <span>MODE / {mode.toUpperCase()}</span>
        </div>

        <div className="field-camera__flash" aria-hidden="true" />
      </div>

      <div className="field-camera__channels" role="group" aria-label="Live camera channels">
        {CAMERA_FEEDS.map((feed) => (
          <button
            className={feed.id === activeFeed.id ? 'is-active' : ''}
            key={feed.id}
            type="button"
            onClick={() => setActiveFeedId(feed.id)}
            aria-pressed={feed.id === activeFeed.id}
          >
            <img src={feed.image} alt="" aria-hidden="true" />
            <span>{feed.id}</span>
            <strong>{feed.name}</strong>
            <i aria-hidden="true" />
          </button>
        ))}
      </div>

      <footer className="field-camera__controls">
        <div className="optical-modes" role="group" aria-label="Optical mode">
          <button className={mode === 'optic' ? 'is-active' : ''} type="button" onClick={() => setMode('optic')} aria-pressed={mode === 'optic'}>
            <Eye aria-hidden="true" /> Optic
          </button>
          <button className={mode === 'thermal' ? 'is-active' : ''} type="button" onClick={() => setMode('thermal')} aria-pressed={mode === 'thermal'}>
            <Thermometer aria-hidden="true" /> Thermal
          </button>
          <button className={mode === 'night' ? 'is-active' : ''} type="button" onClick={() => setMode('night')} aria-pressed={mode === 'night'}>
            <CircleDot aria-hidden="true" /> Night
          </button>
        </div>

        <label className="camera-zoom" htmlFor="camera-zoom">
          <Focus aria-hidden="true" />
          <span>OPTICAL ZOOM</span>
          <input
            id="camera-zoom"
            type="range"
            min="100"
            max="175"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <output>{zoom}%</output>
        </label>

        <button className="camera-capture" type="button" onClick={captureFrame}>
          <Camera aria-hidden="true" /> Capture
        </button>
      </footer>

      <div className="capture-reel" aria-label="Captured field frames">
        <span><Aperture aria-hidden="true" /> CAPTURE REEL / {captures.length.toString().padStart(2, '0')}</span>
        <div>
          {captures.length === 0 && <p>NO FRAMES STORED IN LOCAL BUFFER</p>}
          {captures.map((capture) => {
            const feed = CAMERA_FEEDS.find((candidate) => candidate.id === capture.feedId) ?? CAMERA_FEEDS[0]
            return (
              <button key={capture.id} type="button" onClick={() => restoreCapture(capture)}>
                <img src={feed.image} alt={`Captured ${feed.name}`} />
                <span>{capture.feedId} / {capture.timestamp}</span>
                <strong>{capture.mode.toUpperCase()}</strong>
              </button>
            )
          })}
        </div>
      </div>
    </article>
  )
}

function SignalRouteGame() {
  const invalidTimerRef = useRef<number | null>(null)
  const hintTimerRef = useRef<number | null>(null)
  const [route, setRoute] = useState<number[]>([ROUTE_START])
  const [moves, setMoves] = useState(0)
  const [invalidCell, setInvalidCell] = useState<number | null>(null)
  const [hintCell, setHintCell] = useState<number | null>(null)
  const [won, setWon] = useState(false)
  const [signal, setSignal] = useState(100)

  useEffect(() => () => {
    if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current)
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current)
  }, [])

  const reset = () => {
    setRoute([ROUTE_START])
    setMoves(0)
    setInvalidCell(null)
    setHintCell(null)
    setWon(false)
    setSignal(100)
  }

  const rejectCell = (index: number) => {
    setInvalidCell(index)
    setSignal((current) => Math.max(0, current - 4))
    if (invalidTimerRef.current) window.clearTimeout(invalidTimerRef.current)
    invalidTimerRef.current = window.setTimeout(() => setInvalidCell(null), 420)
  }

  const selectCell = (index: number) => {
    if (won || BLOCKED_CELLS.has(index)) {
      if (BLOCKED_CELLS.has(index)) rejectCell(index)
      return
    }

    const existingIndex = route.indexOf(index)
    if (existingIndex >= 0) {
      if (existingIndex === route.length - 1) return
      setRoute((current) => current.slice(0, existingIndex + 1))
      setMoves((current) => current + 1)
      return
    }

    const currentCell = route[route.length - 1]
    if (!areAdjacent(currentCell, index)) {
      rejectCell(index)
      return
    }

    const nextRoute = [...route, index]
    setRoute(nextRoute)
    setMoves((current) => current + 1)
    setSignal((current) => Math.max(0, current - 1))
    setHintCell(null)

    if (index === ROUTE_GOAL) {
      setWon(true)
      setSignal((current) => Math.min(100, current + 20))
      emitDiscovery('navigator', 'SIGNAL NAVIGATOR')
    }
  }

  const showHint = () => {
    if (won || signal < 10) return
    const currentCell = route[route.length - 1]
    const currentCoordinates = cellCoordinates(currentCell)
    const candidates = Array.from({ length: ROUTE_COLUMNS * ROUTE_ROWS }, (_, index) => index)
      .filter((index) => areAdjacent(currentCell, index))
      .filter((index) => !BLOCKED_CELLS.has(index))
      .filter((index) => !route.includes(index))
      .sort((first, second) => {
        const firstCoordinates = cellCoordinates(first)
        const secondCoordinates = cellCoordinates(second)
        const firstDistance = Math.abs(8 - firstCoordinates.column) + Math.abs(3 - firstCoordinates.row)
        const secondDistance = Math.abs(8 - secondCoordinates.column) + Math.abs(3 - secondCoordinates.row)
        return firstDistance - secondDistance
      })

    const candidate = candidates.find((index) => {
      const coordinates = cellCoordinates(index)
      return coordinates.column >= currentCoordinates.column
    }) ?? candidates[0]

    if (candidate === undefined) return
    setHintCell(candidate)
    setSignal((current) => Math.max(0, current - 10))
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current)
    hintTimerRef.current = window.setTimeout(() => setHintCell(null), 1600)
  }

  const furthestColumn = Math.max(...route.map((index) => cellCoordinates(index).column))
  const routeProgress = Math.round((furthestColumn / (ROUTE_COLUMNS - 1)) * 100)

  return (
    <article className={`route-console${won ? ' is-won' : ''}`}>
      <header className="route-console__header">
        <span><Route aria-hidden="true" /> SIGNAL ROUTER / PATH-09</span>
        <strong>{won ? 'UPLINK COMPLETE' : 'ROUTE REQUIRED'}</strong>
      </header>

      <div className="route-stage">
        <div className="route-stage__topline">
          <span>ORIGIN / A-04</span>
          <span>DESTINATION / I-04</span>
          <span>INTERFERENCE / 14 NODES</span>
        </div>

        <div
          className="route-grid"
          role="grid"
          aria-label="Signal route grid. Build a connected path from origin to destination while avoiding interference."
          style={{ '--route-columns': ROUTE_COLUMNS } as CSSProperties}
        >
          {Array.from({ length: ROUTE_COLUMNS * ROUTE_ROWS }, (_, index) => {
            const coordinates = cellCoordinates(index)
            const routeIndex = route.indexOf(index)
            const isBlocked = BLOCKED_CELLS.has(index)
            const isStart = index === ROUTE_START
            const isGoal = index === ROUTE_GOAL
            const isRoute = routeIndex >= 0
            const isHead = routeIndex === route.length - 1
            const isInvalid = invalidCell === index
            const isHint = hintCell === index

            return (
              <button
                className={[
                  isBlocked ? 'is-blocked' : '',
                  isStart ? 'is-start' : '',
                  isGoal ? 'is-goal' : '',
                  isRoute ? 'is-route' : '',
                  isHead ? 'is-head' : '',
                  isInvalid ? 'is-invalid' : '',
                  isHint ? 'is-hint' : '',
                ].filter(Boolean).join(' ')}
                key={index}
                type="button"
                role="gridcell"
                onClick={() => selectCell(index)}
                aria-label={isBlocked
                  ? `Interference at column ${coordinates.column + 1}, row ${coordinates.row + 1}`
                  : isStart
                    ? 'Signal origin'
                    : isGoal
                      ? 'Signal destination'
                      : `Route cell column ${coordinates.column + 1}, row ${coordinates.row + 1}`}
                aria-pressed={isRoute}
              >
                <span>{String.fromCharCode(65 + coordinates.column)}{coordinates.row + 1}</span>
                {isBlocked && <Zap aria-hidden="true" />}
                {isStart && <Radio aria-hidden="true" />}
                {isGoal && <Target aria-hidden="true" />}
                {isRoute && !isStart && !isGoal && <i aria-hidden="true" />}
              </button>
            )
          })}
        </div>

        {won && (
          <div className="route-victory" role="status">
            <div><Check aria-hidden="true" /></div>
            <span>PATH LOCKED</span>
            <strong>THE SIGNAL SURVIVED.</strong>
            <button type="button" onClick={reset}><RefreshCw aria-hidden="true" /> Route again</button>
          </div>
        )}

        <div className="route-stage__legend" aria-hidden="true">
          <span><i className="is-origin" /> Origin</span>
          <span><i className="is-path" /> Path</span>
          <span><i className="is-noise" /> Interference</span>
        </div>
      </div>

      <footer className="route-console__controls">
        <div className="route-stat"><Map aria-hidden="true" /><span>Progress</span><strong>{routeProgress}%</strong></div>
        <div className="route-stat"><Grid3X3 aria-hidden="true" /><span>Moves</span><strong>{moves.toString().padStart(2, '0')}</strong></div>
        <div className="route-stat"><Zap aria-hidden="true" /><span>Signal</span><strong>{signal}%</strong></div>
        <div className="route-actions">
          <button type="button" onClick={showHint} disabled={won || signal < 10}>
            <Lightbulb aria-hidden="true" /> Hint -10
          </button>
          <button type="button" onClick={reset}>
            <RefreshCw aria-hidden="true" /> Reset
          </button>
        </div>
      </footer>
    </article>
  )
}

export function FieldMissions() {
  return (
    <section id="missions" className="field-missions">
      <div className="field-missions__header" data-reveal>
        <div className="section-heading__index">
          <span>07</span>
          <span>REMOTE FIELD MISSIONS</span>
        </div>
        <h2>WATCH THE WILD.<br /><em>KEEP THE LINE OPEN.</em></h2>
        <p><Sparkles aria-hidden="true" /> Capture a living frame. Then carry its signal through the noise.</p>
      </div>

      <div className="field-missions__systems" data-reveal>
        <LiveFieldCamera />
        <SignalRouteGame />
      </div>

      <div className="field-missions__ticker" aria-hidden="true">
        <div>
          {[0, 1].map((copy) => (
            <span key={copy}>
              LIVE FIELD / NO REPLAY <ArrowRight /> ROUTE THE IMPOSSIBLE <ArrowRight /> SIGNAL STILL BREATHING <ArrowRight />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FieldMissions