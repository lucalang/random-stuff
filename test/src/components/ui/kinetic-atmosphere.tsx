import type { CSSProperties } from 'react'

const MOTES = [
  [7, 14, 3, 14, -8, 0.22],
  [18, 72, 2, 19, -14, 0.14],
  [29, 36, 4, 17, -4, 0.26],
  [39, 84, 2, 13, -11, 0.18],
  [48, 18, 3, 22, -17, 0.16],
  [57, 63, 2, 16, -6, 0.3],
  [68, 29, 4, 20, -13, 0.2],
  [76, 77, 2, 15, -2, 0.15],
  [88, 44, 3, 18, -10, 0.28],
  [95, 9, 2, 24, -20, 0.16],
  [12, 48, 2, 21, -7, 0.18],
  [24, 92, 3, 16, -3, 0.24],
  [34, 6, 2, 18, -15, 0.16],
  [44, 55, 4, 23, -9, 0.13],
  [61, 94, 3, 19, -16, 0.2],
  [72, 12, 2, 14, -5, 0.26],
  [83, 66, 4, 21, -12, 0.17],
  [91, 88, 2, 17, -1, 0.22],
] as const

type MoteStyle = CSSProperties & {
  '--mote-x': string
  '--mote-y': string
  '--mote-size': string
  '--mote-duration': string
  '--mote-delay': string
  '--mote-opacity': number
}

export function KineticAtmosphere() {
  return (
    <div className="kinetic-field" aria-hidden="true">
      <div className="kinetic-field__grain" />
      <div className="kinetic-field__beams">
        <i><span /></i>
        <i><span /></i>
        <i><span /></i>
      </div>

      <div className="kinetic-field__swarm">
        {MOTES.map(([x, y, size, duration, delay, opacity], index) => (
          <i
            key={`${x}-${y}`}
            style={{
              '--mote-x': `${x}%`,
              '--mote-y': `${y}%`,
              '--mote-size': `${size}px`,
              '--mote-duration': `${duration}s`,
              '--mote-delay': `${delay}s`,
              '--mote-opacity': opacity,
            } as MoteStyle}
          >
            <span className={index % 3 === 0 ? 'is-signal' : ''} />
          </i>
        ))}
      </div>

      <div className="kinetic-field__orbit">
        <i />
        <i />
        <span />
      </div>

      <div className="kinetic-field__stream kinetic-field__stream--left">
        <span>BIOGRAPH / LIVE / FORM / MEMORY / INSTINCT / </span>
        <span>BIOGRAPH / LIVE / FORM / MEMORY / INSTINCT / </span>
      </div>
      <div className="kinetic-field__stream kinetic-field__stream--right">
        <span>001 / 008 / 013 / 021 / SIGNAL CONTINUES / </span>
        <span>001 / 008 / 013 / 021 / SIGNAL CONTINUES / </span>
      </div>
    </div>
  )
}

export default KineticAtmosphere