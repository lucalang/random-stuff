'use client'

import {
  Activity,
  Atom,
  CircleDot,
  Clock3,
  CornerDownLeft,
  Cpu,
  LockKeyhole,
  Magnet,
  MousePointer2,
  Orbit,
  Pause,
  Play,
  Shuffle,
  Sparkles,
  Terminal,
  Trash2,
  Unlock,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'

type OrganismMode = 'attract' | 'repel'

type OrganismParticle = {
  x: number
  y: number
  originX: number
  originY: number
  velocityX: number
  velocityY: number
  radius: number
  phase: number
  family: number
}

type PointerState = {
  x: number
  y: number
  previousX: number
  previousY: number
  active: boolean
  burst: number
  speed: number
}

type SequencerVoice = {
  name: string
  code: string
  frequency: number
  type: OscillatorType
  color: string
}

type TerminalTone = 'system' | 'user' | 'signal' | 'warning' | 'success'

type TerminalLine = {
  id: number
  tone: TerminalTone
  label?: string
  text: string
}

const SEQUENCER_STEPS = 12

const SEQUENCER_VOICES: SequencerVoice[] = [
  { name: 'Pulse', code: 'P-01', frequency: 110, type: 'sine', color: '#ff3d00' },
  { name: 'Nerve', code: 'N-02', frequency: 164.81, type: 'triangle', color: '#79f7ff' },
  { name: 'Spark', code: 'S-03', frequency: 220, type: 'square', color: '#eaff00' },
  { name: 'Ghost', code: 'G-04', frequency: 329.63, type: 'sawtooth', color: '#e9e5d8' },
]

const STARTER_PATTERN = [
  [true, false, false, true, false, false, true, false, false, true, false, false],
  [false, false, true, false, false, true, false, false, true, false, false, true],
  [false, true, false, false, true, false, false, true, false, false, true, false],
  [true, false, false, false, false, false, true, false, false, false, false, false],
]

const INITIAL_TERMINAL_LINES: TerminalLine[] = [
  { id: 1, tone: 'system', label: 'BOOT', text: 'PRIMATE FIELD KERNEL 6.8.12 / ONLINE' },
  { id: 2, tone: 'system', label: 'LINK', text: 'REMOTE BIOGRAPH / LATENCY 18MS' },
  { id: 3, tone: 'signal', label: 'NOTE', text: 'TYPE HELP TO QUERY THE LIVING INDEX.' },
]

function emptyPattern() {
  return SEQUENCER_VOICES.map(() => Array.from({ length: SEQUENCER_STEPS }, () => false))
}

function seededValue(seed: number) {
  const value = Math.sin(seed * 91.173 + 18.761) * 47453.5453
  return value - Math.floor(value)
}

function createParticles(width: number, height: number, count: number): OrganismParticle[] {
  return Array.from({ length: count }, (_, index) => {
    const x = seededValue(index * 5 + 1) * width
    const y = seededValue(index * 5 + 2) * height

    return {
      x,
      y,
      originX: x,
      originY: y,
      velocityX: (seededValue(index * 5 + 3) - 0.5) * 0.4,
      velocityY: (seededValue(index * 5 + 4) - 0.5) * 0.4,
      radius: 0.8 + seededValue(index * 5 + 5) * 2.4,
      phase: seededValue(index * 7 + 9) * Math.PI * 2,
      family: index % 4,
    }
  })
}

function NeuralOrganism() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const modeRef = useRef<OrganismMode>('attract')
  const energyRef = useRef(72)
  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    active: false,
    burst: 0,
    speed: 0,
  })
  const [mode, setMode] = useState<OrganismMode>('attract')
  const [energy, setEnergy] = useState(72)
  const [contactCount, setContactCount] = useState(0)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    energyRef.current = energy
  }, [energy])

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return

    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let particles: OrganismParticle[] = []
    let animationFrame = 0
    let previousTime = performance.now()

    const resize = () => {
      const bounds = stage.getBoundingClientRect()
      const density = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(bounds.width, 1)
      height = Math.max(bounds.height, 1)
      canvas.width = Math.round(width * density)
      canvas.height = Math.round(height * density)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(density, 0, 0, density, 0, 0)
      particles = createParticles(width, height, width < 600 ? 64 : 112)
      pointerRef.current.x = width / 2
      pointerRef.current.y = height / 2
      pointerRef.current.previousX = width / 2
      pointerRef.current.previousY = height / 2
    }

    const draw = (time: number) => {
      const delta = Math.min((time - previousTime) / 16.667, 2)
      previousTime = time
      const pointer = pointerRef.current
      const energyScale = energyRef.current / 100
      const motionScale = reducedMotion.matches ? 0 : 1
      const influenceRadius = 135 + energyScale * 120

      context.clearRect(0, 0, width, height)
      context.fillStyle = '#090907'
      context.fillRect(0, 0, width, height)

      const backdrop = context.createRadialGradient(
        pointer.active ? pointer.x : width * 0.5,
        pointer.active ? pointer.y : height * 0.5,
        0,
        pointer.active ? pointer.x : width * 0.5,
        pointer.active ? pointer.y : height * 0.5,
        Math.max(width, height) * 0.72,
      )
      backdrop.addColorStop(0, pointer.active ? 'rgba(121,247,255,0.12)' : 'rgba(255,61,0,0.08)')
      backdrop.addColorStop(0.48, 'rgba(9,9,7,0.15)')
      backdrop.addColorStop(1, 'rgba(9,9,7,0.96)')
      context.fillStyle = backdrop
      context.fillRect(0, 0, width, height)

      particles.forEach((particle, index) => {
        const driftX = Math.cos(time * 0.00042 + particle.phase) * (0.035 + energyScale * 0.07)
        const driftY = Math.sin(time * 0.00036 + particle.phase * 1.3) * (0.035 + energyScale * 0.07)
        const pointerDeltaX = pointer.x - particle.x
        const pointerDeltaY = pointer.y - particle.y
        const pointerDistance = Math.max(Math.hypot(pointerDeltaX, pointerDeltaY), 0.01)

        if (pointer.active && pointerDistance < influenceRadius) {
          const proximity = 1 - pointerDistance / influenceRadius
          const direction = modeRef.current === 'attract' ? 1 : -1
          const force = proximity * (0.018 + energyScale * 0.045) * direction
          particle.velocityX += (pointerDeltaX / pointerDistance) * force * delta * motionScale
          particle.velocityY += (pointerDeltaY / pointerDistance) * force * delta * motionScale

          const tangentForce = pointer.speed * proximity * 0.0005
          particle.velocityX += (-pointerDeltaY / pointerDistance) * tangentForce * motionScale
          particle.velocityY += (pointerDeltaX / pointerDistance) * tangentForce * motionScale
        }

        if (pointer.burst > 0) {
          const burstDistance = Math.max(pointerDistance, 28)
          const burstForce = Math.max(0, 1 - burstDistance / 380) * pointer.burst * 0.36
          particle.velocityX -= (pointerDeltaX / burstDistance) * burstForce * motionScale
          particle.velocityY -= (pointerDeltaY / burstDistance) * burstForce * motionScale
        }

        const springForce = 0.00035 + (1 - energyScale) * 0.00045
        particle.velocityX += (particle.originX - particle.x) * springForce * delta * motionScale
        particle.velocityY += (particle.originY - particle.y) * springForce * delta * motionScale
        particle.velocityX += driftX * delta * motionScale
        particle.velocityY += driftY * delta * motionScale
        particle.velocityX *= 0.982
        particle.velocityY *= 0.982
        particle.x += particle.velocityX * delta
        particle.y += particle.velocityY * delta

        if (particle.x < -24) particle.x = width + 24
        if (particle.x > width + 24) particle.x = -24
        if (particle.y < -24) particle.y = height + 24
        if (particle.y > height + 24) particle.y = -24

        for (let connectionIndex = index + 1; connectionIndex < particles.length; connectionIndex += 1) {
          const neighbor = particles[connectionIndex]
          const distance = Math.hypot(neighbor.x - particle.x, neighbor.y - particle.y)
          const connectionRadius = 78 + energyScale * 42
          if (distance >= connectionRadius) continue

          const opacity = (1 - distance / connectionRadius) * (0.08 + energyScale * 0.18)
          const color = particle.family === 0
            ? `rgba(255,61,0,${opacity})`
            : particle.family === 1
              ? `rgba(121,247,255,${opacity})`
              : `rgba(233,229,216,${opacity * 0.7})`

          context.beginPath()
          context.moveTo(particle.x, particle.y)
          context.lineTo(neighbor.x, neighbor.y)
          context.strokeStyle = color
          context.lineWidth = 0.65
          context.stroke()
        }

        const pulse = 0.72 + Math.sin(time * 0.0022 + particle.phase) * 0.28
        const particleColor = ['#ff3d00', '#79f7ff', '#eaff00', '#e9e5d8'][particle.family]
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius * (0.8 + pulse * 0.42), 0, Math.PI * 2)
        context.fillStyle = particleColor
        context.globalAlpha = 0.56 + pulse * 0.42
        context.fill()
        context.globalAlpha = 1
      })

      if (pointer.active) {
        const orbitRadius = 25 + Math.sin(time * 0.004) * 5 + pointer.speed * 0.06
        context.beginPath()
        context.arc(pointer.x, pointer.y, orbitRadius, 0, Math.PI * 2)
        context.strokeStyle = modeRef.current === 'attract' ? '#79f7ff' : '#ff3d00'
        context.lineWidth = 1
        context.stroke()

        context.beginPath()
        context.arc(pointer.x, pointer.y, 4 + pointer.burst * 11, 0, Math.PI * 2)
        context.fillStyle = '#eaff00'
        context.fill()
      }

      pointer.speed *= 0.9
      pointer.burst *= 0.925
      animationFrame = window.requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    resize()
    animationFrame = window.requestAnimationFrame(draw)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  const updatePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointer = pointerRef.current
    const nextX = event.clientX - bounds.left
    const nextY = event.clientY - bounds.top
    pointer.speed = Math.min(Math.hypot(nextX - pointer.previousX, nextY - pointer.previousY), 80)
    pointer.previousX = pointer.x
    pointer.previousY = pointer.y
    pointer.x = nextX
    pointer.y = nextY
    pointer.active = true
  }

  const triggerBurst = (event: ReactPointerEvent<HTMLDivElement>) => {
    updatePointer(event)
    pointerRef.current.burst = 1
    setContactCount((current) => current + 1)
  }

  return (
    <article className="organism-console">
      <header className="organism-console__header">
        <span><Atom aria-hidden="true" /> NEURAL ORGANISM / N-112</span>
        <strong>{mode.toUpperCase()} FIELD</strong>
      </header>

      <div
        ref={stageRef}
        className="organism-stage"
        onPointerMove={updatePointer}
        onPointerEnter={updatePointer}
        onPointerLeave={() => {
          pointerRef.current.active = false
        }}
        onPointerDown={triggerBurst}
        role="img"
        aria-label="Interactive particle organism. Move the pointer to influence it and press to send a pulse."
      >
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="organism-stage__corners" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="organism-stage__instruction" aria-hidden="true">
          <MousePointer2 /> MOVE / PRESS / DISRUPT
        </div>
        <div className="organism-stage__readout" aria-hidden="true">
          <span>CELLS / 112</span>
          <span>CONTACT / {contactCount.toString().padStart(3, '0')}</span>
        </div>
      </div>

      <footer className="organism-console__controls">
        <div className="organism-mode" role="group" aria-label="Organism field mode">
          <button
            className={mode === 'attract' ? 'is-active' : ''}
            type="button"
            onClick={() => setMode('attract')}
            aria-pressed={mode === 'attract'}
          >
            <Magnet aria-hidden="true" /> Attract
          </button>
          <button
            className={mode === 'repel' ? 'is-active' : ''}
            type="button"
            onClick={() => setMode('repel')}
            aria-pressed={mode === 'repel'}
          >
            <Orbit aria-hidden="true" /> Repel
          </button>
        </div>
        <label className="organism-energy" htmlFor="organism-energy">
          <span><Zap aria-hidden="true" /> ENERGY</span>
          <input
            id="organism-energy"
            type="range"
            min="12"
            max="100"
            value={energy}
            onChange={(event) => setEnergy(Number(event.target.value))}
          />
          <output>{energy}%</output>
        </label>
      </footer>
    </article>
  )
}

function PulseSequencer() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const patternRef = useRef(STARTER_PATTERN)
  const [pattern, setPattern] = useState<boolean[][]>(STARTER_PATTERN)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [tempo, setTempo] = useState(116)
  const [activeStep, setActiveStep] = useState(-1)
  const [loopCount, setLoopCount] = useState(0)

  useEffect(() => {
    patternRef.current = pattern
  }, [pattern])

  useEffect(() => {
    return () => {
      const audioContext = audioContextRef.current
      audioContextRef.current = null
      if (audioContext && audioContext.state !== 'closed') void audioContext.close()
    }
  }, [])

  useEffect(() => {
    if (!playing) return

    const stepDuration = 60000 / tempo / 3
    const interval = window.setInterval(() => {
      setActiveStep((currentStep) => {
        const nextStep = (currentStep + 1) % SEQUENCER_STEPS
        if (nextStep === 0 && currentStep >= 0) setLoopCount((current) => current + 1)

        if (!muted) {
          patternRef.current.forEach((voicePattern, voiceIndex) => {
            if (!voicePattern[nextStep]) return
            const voice = SEQUENCER_VOICES[voiceIndex]
            const audioContext = audioContextRef.current
            if (!audioContext || audioContext.state === 'closed') return

            const oscillator = audioContext.createOscillator()
            const gain = audioContext.createGain()
            const filter = audioContext.createBiquadFilter()
            const now = audioContext.currentTime
            const duration = voiceIndex === 3 ? 0.22 : 0.11

            oscillator.type = voice.type
            oscillator.frequency.setValueAtTime(voice.frequency, now)
            if (voiceIndex === 2) {
              oscillator.frequency.exponentialRampToValueAtTime(voice.frequency * 1.85, now + duration)
            }
            filter.type = 'lowpass'
            filter.frequency.setValueAtTime(voiceIndex === 3 ? 900 : 1800 + voiceIndex * 700, now)
            gain.gain.setValueAtTime(0.0001, now)
            gain.gain.exponentialRampToValueAtTime(voiceIndex === 3 ? 0.035 : 0.055, now + 0.008)
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
            oscillator.connect(filter)
            filter.connect(gain)
            gain.connect(audioContext.destination)
            oscillator.start(now)
            oscillator.stop(now + duration + 0.02)
          })
        }

        return nextStep
      })
    }, stepDuration)

    return () => window.clearInterval(interval)
  }, [muted, playing, tempo])

  const togglePlayback = () => {
    if (!playing) {
      const audioContext = audioContextRef.current ?? new AudioContext()
      audioContextRef.current = audioContext
      if (audioContext.state === 'suspended') void audioContext.resume()
      setActiveStep(-1)
    }
    setPlaying((current) => !current)
  }

  const toggleStep = (voiceIndex: number, stepIndex: number) => {
    setPattern((currentPattern) => currentPattern.map((voicePattern, currentVoice) => (
      currentVoice === voiceIndex
        ? voicePattern.map((isActive, currentStep) => currentStep === stepIndex ? !isActive : isActive)
        : voicePattern
    )))
  }

  const mutatePattern = () => {
    setPattern(SEQUENCER_VOICES.map((_, voiceIndex) => (
      Array.from({ length: SEQUENCER_STEPS }, (_, stepIndex) => {
        const structuralBeat = stepIndex % (voiceIndex + 2) === 0
        return Math.random() > (structuralBeat ? 0.32 : 0.76)
      })
    )))
    setLoopCount(0)
  }

  const clearPattern = () => {
    setPattern(emptyPattern())
    setLoopCount(0)
  }

  const activeCells = pattern.flat().filter(Boolean).length
  const density = Math.round((activeCells / (SEQUENCER_STEPS * SEQUENCER_VOICES.length)) * 100)

  return (
    <article className="sequencer-console">
      <header className="sequencer-console__header">
        <span><Activity aria-hidden="true" /> INSTINCT SEQUENCER / SQ-12</span>
        <strong>{playing ? 'TRANSMITTING' : 'STANDBY'}</strong>
      </header>

      <div className="sequencer-display">
        <div className="sequencer-display__timeline" aria-hidden="true">
          <span>VOICE</span>
          {Array.from({ length: SEQUENCER_STEPS }, (_, index) => (
            <i className={index === activeStep ? 'is-current' : ''} key={index}>
              {(index + 1).toString().padStart(2, '0')}
            </i>
          ))}
        </div>

        <div className="sequencer-grid">
          {SEQUENCER_VOICES.map((voice, voiceIndex) => (
            <div className="sequencer-row" key={voice.code}>
              <div className="sequencer-voice" style={{ '--voice-color': voice.color } as React.CSSProperties}>
                <i aria-hidden="true" />
                <span>{voice.name}</span>
                <strong>{voice.code}</strong>
              </div>
              {pattern[voiceIndex].map((isActive, stepIndex) => (
                <button
                  className={`${isActive ? 'is-active' : ''}${stepIndex === activeStep ? ' is-current' : ''}`}
                  key={stepIndex}
                  type="button"
                  onClick={() => toggleStep(voiceIndex, stepIndex)}
                  aria-pressed={isActive}
                  aria-label={`${voice.name} step ${stepIndex + 1}`}
                  style={{ '--voice-color': voice.color } as React.CSSProperties}
                >
                  <span aria-hidden="true" />
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="sequencer-wave" aria-hidden="true">
          {Array.from({ length: 56 }, (_, index) => (
            <i
              className={playing && index % SEQUENCER_STEPS === activeStep ? 'is-hot' : ''}
              key={index}
              style={{ '--wave-cell': index } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      <footer className="sequencer-controls">
        <div className="sequencer-actions">
          <button type="button" onClick={togglePlayback} aria-label={playing ? 'Pause sequence' : 'Play sequence'}>
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            {playing ? 'Pause' : 'Transmit'}
          </button>
          <button type="button" onClick={() => setMuted((current) => !current)} aria-pressed={muted}>
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            {muted ? 'Muted' : 'Audio'}
          </button>
          <button type="button" onClick={mutatePattern}>
            <Shuffle aria-hidden="true" /> Mutate
          </button>
          <button type="button" onClick={clearPattern}>
            <Trash2 aria-hidden="true" /> Clear
          </button>
        </div>

        <label className="sequencer-tempo" htmlFor="sequencer-tempo">
          <span>TEMPO</span>
          <input
            id="sequencer-tempo"
            type="range"
            min="70"
            max="190"
            value={tempo}
            onChange={(event) => setTempo(Number(event.target.value))}
          />
          <output>{tempo} BPM</output>
        </label>

        <div className="sequencer-stats" aria-label="Sequence statistics">
          <span>LOOPS <strong>{loopCount.toString().padStart(2, '0')}</strong></span>
          <span>DENSITY <strong>{density}%</strong></span>
        </div>
      </footer>
    </article>
  )
}

function FieldTerminal() {
  const inputRef = useRef<HTMLInputElement>(null)
  const lineIdRef = useRef(INITIAL_TERMINAL_LINES.length + 1)
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_TERMINAL_LINES)
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [puzzleStep, setPuzzleStep] = useState(0)
  const [packets, setPackets] = useState(128)
  const [timestamp, setTimestamp] = useState('00:00:00')

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
    const interval = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPackets((current) => current >= 999 ? 128 : current + Math.floor(Math.random() * 4) + 1)
    }, 1400)
    return () => window.clearInterval(interval)
  }, [])

  const appendLines = (...nextLines: Array<Omit<TerminalLine, 'id'>>) => {
    setLines((currentLines) => {
      const additions = nextLines.map((line) => ({ ...line, id: lineIdRef.current++ }))
      return [...currentLines, ...additions].slice(-14)
    })
  }

  const emitDiscovery = () => {
    window.dispatchEvent(new CustomEvent('primate:discovery', {
      detail: { id: 'terminal', label: 'ANOMALY DECODER' },
    }))
  }

  const executeCommand = (rawCommand: string) => {
    const normalized = rawCommand.trim().toLowerCase()
    const [verb, ...argumentsList] = normalized.split(/\s+/)
    const argument = argumentsList.join(' ')

    appendLines({ tone: 'user', label: 'YOU', text: rawCommand.trim().toUpperCase() })

    if (!verb) return

    switch (verb) {
      case 'help':
        appendLines(
          { tone: 'system', label: 'CMDS', text: 'SCAN / STATUS / TRACE [CHANNEL] / DECODE [KEY]' },
          { tone: 'system', label: 'CMDS', text: 'SPECIMEN [001-005] / PULSE / CLEAR / OPEN [CHANNEL]' },
        )
        break

      case 'status':
        appendLines(
          { tone: 'signal', label: 'CORE', text: 'FIELD STABLE / ENTROPY 74% / ORGANISM LISTENING' },
          { tone: puzzleStep === 3 ? 'success' : 'system', label: 'LOCK', text: puzzleStep === 3 ? 'CHANNEL 008 AUTHORIZED' : `DECODER PHASE ${puzzleStep}/3` },
        )
        break

      case 'scan':
        if (puzzleStep < 1) setPuzzleStep(1)
        appendLines(
          { tone: 'signal', label: 'SCAN', text: '005 REGISTERED SUBJECTS RESPONDING.' },
          { tone: 'warning', label: 'ERR', text: 'UNLISTED CARRIER DETECTED AT CHANNEL 008.' },
          { tone: 'system', label: 'NEXT', text: 'TRACE THE ANOMALOUS CHANNEL.' },
        )
        break

      case 'trace':
        if (argument !== '008') {
          appendLines({ tone: 'warning', label: 'TRACE', text: argument ? `CHANNEL ${argument.toUpperCase()} RETURNS NO LIVING SIGNAL.` : 'CHANNEL IDENTIFIER REQUIRED.' })
          break
        }
        if (puzzleStep < 1) {
          appendLines({ tone: 'warning', label: 'DENY', text: 'NO CARRIER MAP. RUN SCAN FIRST.' })
          break
        }
        if (puzzleStep < 2) setPuzzleStep(2)
        appendLines(
          { tone: 'signal', label: 'TRACE', text: '008 / ORIGIN LOOPS THROUGH LOCAL OBSERVER.' },
          { tone: 'warning', label: 'HASH', text: '49 4E 53 54 49 4E 43 54' },
          { tone: 'system', label: 'NEXT', text: 'DECODE THE HASH AS A WORD.' },
        )
        break

      case 'decode':
        if (puzzleStep < 2) {
          appendLines({ tone: 'warning', label: 'DENY', text: 'NO CAPTURED HASH. TRACE A CARRIER FIRST.' })
          break
        }
        if (argument !== 'instinct') {
          appendLines({ tone: 'warning', label: 'FAIL', text: `${argument.toUpperCase() || 'NULL'} DOES NOT MATCH THE LIVING CHECKSUM.` })
          break
        }
        setPuzzleStep(3)
        emitDiscovery()
        appendLines(
          { tone: 'success', label: 'MATCH', text: 'INSTINCT / CHECKSUM ACCEPTED.' },
          { tone: 'success', label: 'OPEN', text: 'CHANNEL 008 AUTHORIZED. THE OBSERVER IS WAITING.' },
        )
        break

      case 'specimen': {
        const specimens: Record<string, string> = {
          '001': 'THE OBSERVER / CURIOSITY / SIGNAL CLEAN',
          '002': 'SOFT MACHINE / STILLNESS / SIGNAL SLOW',
          '003': 'LONG MEMORY / KINSHIP / SIGNAL DEEP',
          '004': 'RED FREQUENCY / ADAPTATION / SIGNAL MOBILE',
          '005': 'HIGH SIGNAL / PERSPECTIVE / SIGNAL DISTANT',
        }
        appendLines(argument in specimens
          ? { tone: 'signal', label: argument, text: specimens[argument] }
          : { tone: 'warning', label: '404', text: 'SPECIMEN RANGE IS 001 THROUGH 005.' })
        break
      }

      case 'pulse':
        setPackets((current) => current + 32)
        appendLines(
          { tone: 'signal', label: 'TX', text: 'MANUAL PULSE RELEASED INTO THE ARCHIVE.' },
          { tone: 'system', label: 'ECHO', text: `${Math.floor(20 + Math.random() * 70)}MS / SOMETHING ANSWERED.` },
        )
        break

      case 'open':
        if (argument === '008' && puzzleStep === 3) {
          appendLines({ tone: 'success', label: 'ROUTE', text: 'OPENING PRIVATE CHANNEL 008...' })
          window.setTimeout(() => window.location.assign('/easter-egg'), 420)
        } else if (argument === '008') {
          appendLines({ tone: 'warning', label: 'LOCK', text: 'CHANNEL 008 REQUIRES A VALID CHECKSUM.' })
        } else {
          appendLines({ tone: 'warning', label: 'ROUTE', text: 'UNKNOWN CHANNEL.' })
        }
        break

      case 'clear':
        setLines([])
        break

      default:
        appendLines({ tone: 'warning', label: 'NULL', text: `COMMAND '${verb.toUpperCase()}' NOT RECOGNIZED. TRY HELP.` })
    }
  }

  const submitCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextCommand = command.trim()
    if (!nextCommand) return
    setHistory((currentHistory) => [...currentHistory, nextCommand].slice(-20))
    setHistoryIndex(-1)
    setCommand('')
    executeCommand(nextCommand)
  }

  const navigateHistory = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    if (history.length === 0) return

    const nextIndex = event.key === 'ArrowUp'
      ? Math.min(historyIndex + 1, history.length - 1)
      : Math.max(historyIndex - 1, -1)
    setHistoryIndex(nextIndex)
    setCommand(nextIndex === -1 ? '' : history[history.length - 1 - nextIndex])
  }

  return (
    <article className={`field-terminal${puzzleStep === 3 ? ' is-unlocked' : ''}`}>
      <header className="field-terminal__header">
        <span><Terminal aria-hidden="true" /> FIELD TERMINAL / ROOT</span>
        <div><i aria-hidden="true" /> LIVE / {timestamp}</div>
      </header>

      <div className="field-terminal__body" onClick={() => inputRef.current?.focus()}>
        <div className="field-terminal__output" role="log" aria-live="polite">
          {lines.length === 0 && <p className="is-empty">BUFFER CLEARED. CURSOR AWAITS.</p>}
          {lines.map((line) => (
            <p className={`is-${line.tone}`} key={line.id}>
              {line.label && <strong>[{line.label}]</strong>}
              <span>{line.text}</span>
            </p>
          ))}
        </div>

        <form className="field-terminal__input" onSubmit={submitCommand}>
          <span>visitor@primate:~$</span>
          <input
            ref={inputRef}
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={navigateHistory}
            aria-label="Field terminal command"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" aria-label="Run command" title="Run command">
            <CornerDownLeft aria-hidden="true" />
          </button>
        </form>
      </div>

      <aside className="field-terminal__map" aria-label="Anomaly decoder status">
        <div className="terminal-orbit" aria-hidden="true">
          <i /><i /><i />
          <CircleDot />
        </div>
        <div className="terminal-phase">
          <span>DECODER PHASE</span>
          <strong>{puzzleStep} / 3</strong>
          <div aria-hidden="true">
            {[1, 2, 3].map((step) => <i className={step <= puzzleStep ? 'is-on' : ''} key={step} />)}
          </div>
        </div>
        <dl>
          <div><dt><Cpu /> PACKETS</dt><dd>{packets.toString().padStart(4, '0')}</dd></div>
          <div><dt><Clock3 /> LATENCY</dt><dd>18MS</dd></div>
          <div>
            <dt>{puzzleStep === 3 ? <Unlock /> : <LockKeyhole />} ACCESS</dt>
            <dd>{puzzleStep === 3 ? 'OPEN' : 'SEALED'}</dd>
          </div>
        </dl>
        <button
          type="button"
          disabled={puzzleStep !== 3}
          onClick={() => window.location.assign('/easter-egg')}
        >
          {puzzleStep === 3 ? <Unlock aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
          CHANNEL 008
        </button>
      </aside>
    </article>
  )
}

export function NeuralPlayground() {
  return (
    <section id="neural" className="neural-playground">
      <div className="neural-playground__header">
        <div className="section-heading__index">
          <span>06</span>
          <span>NEURAL PLAYGROUND</span>
        </div>
        <h2>TOUCH THE<br /><em>UNFINISHED MIND.</em></h2>
        <p><Sparkles aria-hidden="true" /> Three unstable instruments. Every input leaves a trace.</p>
      </div>
      <div className="neural-playground__systems">
        <NeuralOrganism />
        <PulseSequencer />
        <FieldTerminal />
      </div>
    </section>
  )
}

export default NeuralPlayground