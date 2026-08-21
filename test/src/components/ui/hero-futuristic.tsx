'use client'

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { useAspect, useTexture } from '@react-three/drei'
import { ArrowDown, Crosshair, Radio } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three/webgpu'
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js'
import {
  abs,
  add,
  blendScreen,
  float,
  mix,
  mod,
  mx_cell_noise_float,
  oneMinus,
  pass,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl'

const TEXTURE_MAP = 'https://i.postimg.cc/XYwvXN8D/img-4.png'
const DEPTH_MAP = 'https://i.postimg.cc/2SHKQh2q/raw-4.webp'
const TITLE_WORDS = ['WILD', 'INTELLIGENCE']

extend(THREE as unknown as Parameters<typeof extend>[0])

function PostProcessing({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number
  threshold?: number
  fullScreenEffect?: boolean
}) {
  const { gl, scene, camera } = useThree()
  const scanProgress = useMemo(() => uniform(0), [])

  const postProcessing = useMemo(() => {
    const renderer = new THREE.PostProcessing(gl as unknown as THREE.WebGPURenderer)
    const scenePass = pass(scene, camera)
    const sceneColor = scenePass.getTextureNode('output')
    const bloomPass = bloom(sceneColor, strength, 0.5, threshold)
    const scanLine = smoothstep(
      0,
      float(0.05),
      abs(uv().y.sub(scanProgress)),
    )
    const redOverlay = vec3(1, 0, 0).mul(oneMinus(scanLine)).mul(0.4)
    const scanMask = fullScreenEffect
      ? smoothstep(0.9, 1, oneMinus(scanLine))
      : float(1)
    const scannedScene = mix(
      sceneColor,
      add(sceneColor, redOverlay),
      scanMask,
    )

    renderer.outputNode = scannedScene.add(bloomPass)
    return renderer
  }, [camera, fullScreenEffect, gl, scanProgress, scene, strength, threshold])

  useFrame(({ clock }) => {
    // oxlint-disable-next-line react/immutability -- TSL uniforms are mutable by design.
    scanProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5
    void postProcessing.renderAsync()
  }, 1)

  return null
}

function Scene() {
  const [colorMap, depthMap] = useTexture([TEXTURE_MAP, DEPTH_MAP])
  const meshRef = useRef<THREE.Mesh>(null)
  const worldRef = useRef<THREE.Group>(null)
  const orbitRef = useRef<THREE.Group>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(360 * 3)
    let seed = 17

    for (let index = 0; index < positions.length; index += 3) {
      seed = (seed * 16807) % 2147483647
      positions[index] = ((seed / 2147483647) - 0.5) * 12
      seed = (seed * 16807) % 2147483647
      positions[index + 1] = ((seed / 2147483647) - 0.5) * 8
      seed = (seed * 16807) % 2147483647
      positions[index + 2] = -1 - (seed / 2147483647) * 5
    }

    return positions
  }, [])

  const { material, pointer, progress } = useMemo(() => {
    const pointerUniform = uniform(new THREE.Vector2(0))
    const progressUniform = uniform(0)
    const depthTexture = texture(depthMap)
    const displacedTexture = texture(
      colorMap,
      uv().add(depthTexture.r.mul(pointerUniform).mul(0.01)),
    )

    const tiledUv = mod(
      vec2(uv().x, uv().y).mul(vec2(120)),
      2,
    ).sub(1)
    const brightness = mx_cell_noise_float(vec2(uv().x, uv().y).mul(60))
    const dot = smoothstep(0.5, 0.49, tiledUv.length()).mul(brightness)
    const flow = oneMinus(
      smoothstep(0, 0.02, abs(depthTexture.r.sub(progressUniform))),
    )
    const scanMask = dot.mul(flow).mul(vec3(10, 0, 0))

    return {
      material: new THREE.MeshBasicNodeMaterial({
        colorNode: blendScreen(displacedTexture, scanMask),
      }),
      pointer: pointerUniform,
      progress: progressUniform,
    }
  }, [colorMap, depthMap])

  const [width, height] = useAspect(300, 300)

  useFrame(({ clock, pointer: cursor }) => {
    const elapsed = clock.getElapsedTime()
    // oxlint-disable-next-line react/immutability -- TSL uniforms are mutable by design.
    progress.value = Math.sin(elapsed * 0.5) * 0.5 + 0.5
    pointer.value.copy(cursor)

    if (worldRef.current) {
      worldRef.current.rotation.y = THREE.MathUtils.lerp(
        worldRef.current.rotation.y,
        cursor.x * 0.12,
        0.035,
      )
      worldRef.current.rotation.x = THREE.MathUtils.lerp(
        worldRef.current.rotation.x,
        cursor.y * -0.08,
        0.035,
      )
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.z = elapsed * 0.08
      orbitRef.current.rotation.y = elapsed * -0.06
    }
  })

  return (
    <group ref={worldRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ff3d00" size={0.018} transparent opacity={0.75} />
      </points>

      <gridHelper
        args={[14, 28, '#ff3d00', '#26231f']}
        position={[0, -2.65, -1.7]}
        rotation={[0.08, 0, 0]}
      />

      <group ref={orbitRef}>
        <mesh rotation={[Math.PI / 2.3, 0.2, 0]}>
          <torusGeometry args={[2.05, 0.008, 6, 180]} />
          <meshBasicMaterial color="#ff3d00" transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[0.4, Math.PI / 2.1, 0.8]}>
          <torusGeometry args={[2.42, 0.005, 6, 180]} />
          <meshBasicMaterial color="#7df9ff" transparent opacity={0.42} />
        </mesh>
        <mesh position={[-2.05, 0.72, -0.5]} rotation={[0.3, 0.4, 0]}>
          <icosahedronGeometry args={[0.16, 1]} />
          <meshBasicMaterial color="#f7ff00" wireframe />
        </mesh>
        <mesh position={[2.18, -0.62, -0.4]} rotation={[0.8, 0.1, 0.4]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshBasicMaterial color="#ff3d00" wireframe />
        </mesh>
      </group>

      <mesh
        ref={meshRef}
        scale={[width * 0.4, height * 0.4, 1]}
        material={material}
      >
        <planeGeometry />
      </mesh>
    </group>
  )
}

export function HeroFuturistic() {
  const [visibleWords, setVisibleWords] = useState(0)
  const [subtitleVisible, setSubtitleVisible] = useState(false)

  useEffect(() => {
    if (visibleWords < TITLE_WORDS.length) {
      const timeout = window.setTimeout(
        () => setVisibleWords((current) => current + 1),
        600,
      )
      return () => window.clearTimeout(timeout)
    }

    const timeout = window.setTimeout(() => setSubtitleVisible(true), 800)
    return () => window.clearTimeout(timeout)
  }, [visibleWords])

  const scrollToCollection = () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="top" className="hero-futuristic" aria-label="Wild Intelligence">
      <div className="hero-futuristic__grid" aria-hidden="true" />
      <div className="hero-futuristic__scan" aria-hidden="true" />

      <div className="hero-hud hero-hud--left" aria-hidden="true">
        <span>PRIMATE.OS</span>
        <span>GEN / 001</span>
      </div>
      <div className="hero-hud hero-hud--right" aria-hidden="true">
        <span className="hero-live"><i /> SIGNAL LIVE</span>
        <span>51.5072 N</span>
      </div>

      <div className="hero-futuristic__copy">
        <p className="hero-kicker">
          <Radio aria-hidden="true" size={14} />
          A speculative archive of beautiful instincts
        </p>
        <h1>
          {TITLE_WORDS.map((word, index) => (
            <span
              key={word}
              className={index < visibleWords ? 'hero-word is-visible' : 'hero-word'}
              style={{ animationDelay: `${index * 130}ms` }}
              data-text={word}
            >
              {word}
            </span>
          ))}
        </h1>
        <p className={subtitleVisible ? 'hero-subtitle is-visible' : 'hero-subtitle'}>
          Organic memory. Synthetic dreams. One unstable frequency.
        </p>
      </div>

      <div className="hero-orbit-label hero-orbit-label--one" aria-hidden="true">
        <Crosshair size={13} /> FORM
      </div>
      <div className="hero-orbit-label hero-orbit-label--two" aria-hidden="true">
        0.0042 / PULSE
      </div>

      <div className="hero-side-note" aria-hidden="true">
        <span>Move to distort</span>
        <span>Scroll to descend</span>
      </div>

      <button className="hero-explore" type="button" onClick={scrollToCollection}>
        <span>Enter the archive</span>
        <ArrowDown aria-hidden="true" size={20} strokeWidth={1.5} />
      </button>

      <Canvas
        flat
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(
            props as unknown as THREE.WebGPURendererParameters,
          )
          await renderer.init()
          return renderer
        }}
      >
        <PostProcessing />
        <Scene />
      </Canvas>
    </section>
  )
}

export default HeroFuturistic