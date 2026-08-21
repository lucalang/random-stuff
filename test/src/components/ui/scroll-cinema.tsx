'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Crosshair, Orbit, Radio, ScanLine } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'

type ScrollWorldProps = {
  progressRef: RefObject<number>
}

type Shard = {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: number
  color: string
}

const COLORS = ['#ff3d00', '#79f7ff', '#eaff00', '#e9e5d8']

function randomUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function ScrollWorld({ progressRef }: ScrollWorldProps) {
  const worldRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Group>(null)
  const shardRefs = useRef<Array<THREE.Mesh | null>>([])
  const { camera } = useThree()

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(620 * 3)

    for (let index = 0; index < positions.length; index += 3) {
      positions[index] = (randomUnit(index + 1) - 0.5) * 16
      positions[index + 1] = (randomUnit(index + 2) - 0.5) * 10
      positions[index + 2] = (randomUnit(index + 3) - 0.5) * 12
    }

    return positions
  }, [])

  const shards = useMemo<Shard[]>(
    () => Array.from({ length: 22 }, (_, index) => {
      const angle = (index / 22) * Math.PI * 2
      const radius = 1.65 + randomUnit(index + 40) * 1.35

      return {
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          (randomUnit(index + 70) - 0.5) * 4.2,
          Math.sin(angle) * radius,
        ),
        rotation: new THREE.Euler(
          randomUnit(index + 100) * Math.PI,
          randomUnit(index + 120) * Math.PI,
          randomUnit(index + 140) * Math.PI,
        ),
        scale: 0.08 + randomUnit(index + 170) * 0.22,
        color: COLORS[index % COLORS.length],
      }
    }),
    [],
  )

  useFrame((state, delta) => {
    const progress = progressRef.current ?? 0
    const elapsed = state.clock.getElapsedTime()
    const expansion = THREE.MathUtils.smoothstep(progress, 0.22, 0.72)
    const collapse = THREE.MathUtils.smoothstep(progress, 0.78, 1)

    // oxlint-disable-next-line react/immutability -- Three.js camera transforms are mutable inside the frame loop.
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      Math.sin(progress * Math.PI * 2) * 1.65 + state.pointer.x * 0.24,
      0.045,
    )
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      Math.cos(progress * Math.PI) * 0.72 + state.pointer.y * 0.18,
      0.045,
    )
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7.2 - progress * 2.25, 0.045)
    camera.lookAt(0, 0, 0)

    if (worldRef.current) {
      worldRef.current.rotation.y += delta * (0.12 + progress * 0.8)
      worldRef.current.rotation.x = Math.sin(elapsed * 0.18) * 0.12 + progress * 0.65
      worldRef.current.rotation.z = progress * Math.PI * 1.5
      const worldScale = 1 + Math.sin(progress * Math.PI) * 0.22 - collapse * 0.32
      worldRef.current.scale.setScalar(worldScale)
    }

    if (coreRef.current) {
      coreRef.current.rotation.x = elapsed * 0.12 + progress * Math.PI * 2
      coreRef.current.rotation.y = elapsed * 0.16 - progress * Math.PI * 3
      const pulse = 1 + Math.sin(elapsed * 1.8) * 0.025 + collapse * 0.5
      coreRef.current.scale.setScalar(pulse)
    }

    if (wireRef.current) {
      wireRef.current.rotation.x = -elapsed * 0.15
      wireRef.current.rotation.y = elapsed * 0.21 + progress * Math.PI * 2
      wireRef.current.scale.setScalar(1.08 + expansion * 0.45)
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = progress * Math.PI * 3
      ringRef.current.rotation.y = elapsed * 0.1 + progress * Math.PI * 2
    }

    shardRefs.current.forEach((mesh, index) => {
      const shard = shards[index]
      if (!mesh || !shard) return

      const distance = 0.28 + expansion * 1.7 - collapse * 1.25
      mesh.position.copy(shard.position).multiplyScalar(distance)
      mesh.position.y += Math.sin(elapsed * 0.7 + index) * 0.08
      mesh.rotation.x = shard.rotation.x + elapsed * (0.12 + index * 0.004)
      mesh.rotation.y = shard.rotation.y - elapsed * (0.1 + index * 0.003)
      mesh.scale.setScalar(shard.scale * (0.7 + expansion * 1.4))
    })
  })

  return (
    <>
      <color attach="background" args={['#070705']} />
      <fog attach="fog" args={['#070705', 6, 15]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 4]} intensity={3.5} color="#e9e5d8" />
      <pointLight position={[-4, 1, 2]} intensity={28} distance={9} color="#ff3d00" />
      <pointLight position={[4, -2, 1]} intensity={22} distance={8} color="#79f7ff" />

      <points rotation={[0.25, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#e9e5d8" size={0.022} transparent opacity={0.64} />
      </points>

      <gridHelper args={[20, 38, '#ff3d00', '#24241f']} position={[0, -3.2, -2]} />

      <group ref={worldRef}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.28, 5]} />
          <meshPhysicalMaterial
            color="#d9d7ce"
            metalness={0.78}
            roughness={0.16}
            clearcoat={1}
            clearcoatRoughness={0.1}
            iridescence={1}
            iridescenceIOR={1.8}
          />
        </mesh>

        <mesh ref={wireRef}>
          <icosahedronGeometry args={[1.3, 2]} />
          <meshBasicMaterial color="#eaff00" wireframe transparent opacity={0.42} />
        </mesh>

        <group ref={ringRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.85, 0.016, 8, 220]} />
            <meshBasicMaterial color="#ff3d00" />
          </mesh>
          <mesh rotation={[0.35, Math.PI / 2, 0.8]}>
            <torusGeometry args={[2.25, 0.009, 8, 220]} />
            <meshBasicMaterial color="#79f7ff" transparent opacity={0.72} />
          </mesh>
          <mesh rotation={[1.2, 0.4, -0.6]}>
            <torusGeometry args={[2.72, 0.006, 8, 220]} />
            <meshBasicMaterial color="#e9e5d8" transparent opacity={0.3} />
          </mesh>
        </group>

        {shards.map((shard, index) => (
          <mesh
            key={index}
            ref={(mesh) => {
              shardRefs.current[index] = mesh
            }}
          >
            <tetrahedronGeometry args={[1, index % 3 === 0 ? 1 : 0]} />
            <meshPhysicalMaterial
              color={shard.color}
              metalness={0.68}
              roughness={0.2}
              emissive={shard.color}
              emissiveIntensity={0.08}
            />
          </mesh>
        ))}
      </group>
    </>
  )
}

const CHAPTERS = [
  {
    index: '03.1',
    eyebrow: 'THE FIRST IMPULSE',
    title: 'A POINT\nWAKES UP.',
    copy: 'Before form, there is pressure. Before language, a pulse.',
  },
  {
    index: '03.2',
    eyebrow: 'MULTIPLICATION EVENT',
    title: 'THE PATTERN\nNOTICES ITSELF.',
    copy: 'One signal becomes a system. The system starts to dream in color.',
  },
  {
    index: '03.3',
    eyebrow: 'ESCAPE VELOCITY',
    title: 'INSTINCT\nBREAKS ORBIT.',
    copy: 'Fragments become choices. Motion turns memory into architecture.',
  },
  {
    index: '03.4',
    eyebrow: 'REASSEMBLY / UNKNOWN',
    title: 'NOTHING RETURNS\nTHE SAME.',
    copy: 'The object remembers every version of itself at once.',
  },
]

export function ScrollCinema() {
  const sectionRef = useRef<HTMLElement>(null)
  const progressRef = useRef(0)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressTextRef = useRef<HTMLSpanElement>(null)
  const [activeChapter, setActiveChapter] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = THREE.MathUtils.clamp(-rect.top / distance, 0, 1)
      const nextChapter = Math.min(CHAPTERS.length - 1, Math.floor(progress * CHAPTERS.length))

      progressRef.current = progress
      progressBarRef.current?.style.setProperty('--cinema-progress', `${progress}`)
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${Math.round(progress * 100).toString().padStart(2, '0')}%`
      }
      setActiveChapter((current) => current === nextChapter ? current : nextChapter)
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section ref={sectionRef} id="cinema" className="scroll-cinema" aria-label="Scroll-driven signal evolution">
      <div className="scroll-cinema__sticky">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.6, 7.2], fov: 42 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <ScrollWorld progressRef={progressRef} />
        </Canvas>

        <div className="scroll-cinema__noise" aria-hidden="true" />
        <div className="scroll-cinema__scan" aria-hidden="true" />

        <div className="scroll-cinema__topline" aria-hidden="true">
          <span><Radio /> REALTIME MORPHOLOGY</span>
          <span>OBJECT / 0X-7F</span>
          <span><Orbit /> ORBIT UNLOCKED</span>
        </div>

        <div className="scroll-cinema__chapters">
          {CHAPTERS.map((chapter, index) => (
            <article className={index === activeChapter ? 'is-active' : ''} key={chapter.index}>
              <span>{chapter.index} / {chapter.eyebrow}</span>
              <h2>{chapter.title.split('\n').map((line) => <i key={line}>{line}</i>)}</h2>
              <p>{chapter.copy}</p>
            </article>
          ))}
        </div>

        <div className="scroll-cinema__progress" aria-hidden="true">
          <span ref={progressTextRef}>00%</span>
          <div ref={progressBarRef}><i /></div>
          <Crosshair />
        </div>

        <div className="scroll-cinema__telemetry" aria-hidden="true">
          <span>ROT / X 44.20</span>
          <span>VEL / 09.82</span>
          <span>MAT / IRIDESCENT</span>
          <ScanLine />
        </div>
      </div>
    </section>
  )
}

export default ScrollCinema