'use client'

import {
  ArrowUpRight,
  BrainCircuit,
  Crosshair,
  Play,
  Radio,
  RotateCcw,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

type TargetPosition = {
  x: number
  y: number
}

type MemoryPhase = 'idle' | 'showing' | 'input' | 'won' | 'failed'

const PAD_COLORS = ['#ff3d00', '#79f7ff', '#eaff00', '#e9e5d8']

function nextTarget(): TargetPosition {
  return {
    x: 9 + Math.random() * 78,
    y: 13 + Math.random() * 68,
  }
}

function ReflexGame() {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [running, setRunning] = useState(false)
  const [target, setTarget] = useState<TargetPosition>({ x: 50, y: 50 })

  useEffect(() => {
    if (!running) return

    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          setRunning(false)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [running])

  const start = () => {
    setScore(0)
    setTimeLeft(15)
    setTarget(nextTarget())
    setRunning(true)
  }

  const capture = () => {
    if (!running) return
    setScore((current) => current + 1)
    setTarget(nextTarget())
  }

  return (
    <article className="game-console game-console--reflex">
      <header>
        <span><Crosshair /> REFLEX FIELD</span>
        <strong>GAME / 01</strong>
      </header>

      <div className="reflex-stage">
        <div className="reflex-stage__grid" aria-hidden="true" />
        <span className="reflex-stage__status">
          {running ? 'TARGET UNLOCKED' : timeLeft === 0 ? 'SEQUENCE CLOSED' : 'FIELD DORMANT'}
        </span>
        {running && (
          <button
            className="reflex-target"
            type="button"
            aria-label="Capture signal"
            onClick={capture}
            style={{ '--target-x': `${target.x}%`, '--target-y': `${target.y}%` } as CSSProperties}
          >
            <Crosshair aria-hidden="true" />
          </button>
        )}
        {!running && (
          <button className="game-start" type="button" onClick={start}>
            {timeLeft === 0 ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" />}
            {timeLeft === 0 ? 'Reopen field' : 'Release signal'}
          </button>
        )}
        <div className="reflex-stage__sweep" aria-hidden="true" />
      </div>

      <footer>
        <div><Trophy aria-hidden="true" /><span>Captured</span><strong>{score.toString().padStart(2, '0')}</strong></div>
        <div><Timer aria-hidden="true" /><span>Window</span><strong>{timeLeft.toString().padStart(2, '0')}</strong></div>
        <p>15 seconds. One pulse. No mercy.</p>
      </footer>
    </article>
  )
}

function MemoryGame() {
  const [level, setLevel] = useState(1)
  const [phase, setPhase] = useState<MemoryPhase>('idle')
  const [sequence, setSequence] = useState<number[]>([])
  const [inputIndex, setInputIndex] = useState(0)
  const [litPad, setLitPad] = useState<number | null>(null)
  const timersRef = useRef<number[]>([])

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }

  useEffect(() => clearTimers, [])

  const beginRound = (round = level) => {
    clearTimers()
    const nextSequence = Array.from(
      { length: Math.min(3 + round, 9) },
      () => Math.floor(Math.random() * PAD_COLORS.length),
    )

    setSequence(nextSequence)
    setInputIndex(0)
    setPhase('showing')

    nextSequence.forEach((pad, index) => {
      const onTimer = window.setTimeout(() => setLitPad(pad), 360 + index * 620)
      const offTimer = window.setTimeout(() => setLitPad(null), 720 + index * 620)
      timersRef.current.push(onTimer, offTimer)
    })

    const readyTimer = window.setTimeout(
      () => setPhase('input'),
      430 + nextSequence.length * 620,
    )
    timersRef.current.push(readyTimer)
  }

  const selectPad = (pad: number) => {
    if (phase !== 'input') return

    setLitPad(pad)
    const offTimer = window.setTimeout(() => setLitPad(null), 180)
    timersRef.current.push(offTimer)

    if (sequence[inputIndex] !== pad) {
      setPhase('failed')
      return
    }

    if (inputIndex === sequence.length - 1) {
      setPhase('won')
      return
    }

    setInputIndex((current) => current + 1)
  }

  const advance = () => {
    const nextLevel = Math.min(level + 1, 6)
    setLevel(nextLevel)
    beginRound(nextLevel)
  }

  const status = {
    idle: 'PATTERN OFFLINE',
    showing: 'RECEIVING PATTERN',
    input: `REPEAT / ${inputIndex.toString().padStart(2, '0')}`,
    won: 'PATTERN LOCKED',
    failed: 'SIGNAL CORRUPTED',
  }[phase]

  return (
    <article className="game-console game-console--memory">
      <header>
        <span><BrainCircuit /> MEMORY DECODER</span>
        <strong>GAME / 02</strong>
      </header>

      <div className="memory-stage">
        <div className="memory-stage__status">
          <span>{status}</span>
          <strong>LVL {level.toString().padStart(2, '0')}</strong>
        </div>
        <div className="memory-pads">
          {PAD_COLORS.map((color, index) => (
            <button
              key={color}
              className={litPad === index ? 'is-lit' : ''}
              type="button"
              aria-label={`Memory node ${index + 1}`}
              disabled={phase !== 'input'}
              onClick={() => selectPad(index)}
              style={{ '--pad-color': color } as CSSProperties}
            >
              <span>0{index + 1}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>

        {(phase === 'idle' || phase === 'failed') && (
          <button className="game-start" type="button" onClick={() => beginRound()}>
            {phase === 'failed' ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" />}
            {phase === 'failed' ? 'Decode again' : 'Transmit pattern'}
          </button>
        )}
        {phase === 'won' && (
          <button className="game-start" type="button" onClick={advance}>
            <Zap aria-hidden="true" /> Raise difficulty
          </button>
        )}
      </div>

      <footer>
        <div><Zap aria-hidden="true" /><span>Nodes</span><strong>{sequence.length || 4}</strong></div>
        <div><BrainCircuit aria-hidden="true" /><span>Depth</span><strong>{level}/6</strong></div>
        <p>Watch. Hold. Return the pattern intact.</p>
      </footer>
    </article>
  )
}

export function SignalGames() {
  const [entropy, setEntropy] = useState(74)

  return (
    <section id="lab" className="signal-lab">
      <div className="signal-lab__header" data-reveal>
        <div className="section-heading__index">
          <span>05</span>
          <span>HUMAN INPUT LAB</span>
        </div>
        <h2>PROVE YOU ARE<br /><em>STILL AWAKE.</em></h2>
        <div className="entropy-control">
          <label htmlFor="entropy">ENTROPY / <output>{entropy}%</output></label>
          <input
            id="entropy"
            type="range"
            min="1"
            max="100"
            value={entropy}
            onChange={(event) => setEntropy(Number(event.target.value))}
          />
          <div aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => (
              <i
                key={index}
                className={index < Math.round(entropy / 5.6) ? 'is-on' : ''}
                style={{ '--entropy-index': index } as CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="signal-lab__games" data-reveal>
        <ReflexGame />
        <MemoryGame />
      </div>

      <a className="unknown-channel" href="/easter-egg">
        <span><Radio aria-hidden="true" /> UNLISTED TRANSMISSION DETECTED</span>
        <strong>ENTER CHANNEL 008</strong>
        <ArrowUpRight aria-hidden="true" />
      </a>
    </section>
  )
}

export default SignalGames