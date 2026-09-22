import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import { useSpring } from 'framer-motion'
import { Color, type Group } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { heroMark } from '../../content/hero'
import { useMotionPreferences } from '../../hooks/useMotionPreferences'

function Mark() {
  const group = useRef<Group>(null)
  const { gl, invalidate } = useThree()
  const { reducedMotion, canHover } = useMotionPreferences()
  const tiltX = useSpring(0, { stiffness: 85, damping: 22, mass: 1 })
  const tiltY = useSpring(0, { stiffness: 85, damping: 22, mass: 1 })

  useEffect(() => {
    const surface = gl.domElement.closest('.hero')
    if (!surface) return
    let visible = true
    const apply = () => {
      if (!group.current) return
      group.current.rotation.set(0.06 + tiltX.get(), -0.22 + tiltY.get(), -0.025)
      if (visible && !document.hidden) invalidate()
    }
    const reset = () => {
      tiltX.jump(0)
      tiltY.jump(0)
      apply()
    }
    const rest = () => {
      tiltX.set(0)
      tiltY.set(0)
    }
    const move = (event: PointerEvent) => {
      if (!visible || document.hidden || document.querySelector('dialog[open]')) return
      if (event.pointerType !== 'mouse') return
      const bounds = surface.getBoundingClientRect()
      const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1))
      const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1))
      tiltX.set(y * 0.14)
      tiltY.set(x * 0.3)
    }
    const unsubscribeX = tiltX.on('change', apply)
    const unsubscribeY = tiltY.on('change', apply)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) reset()
      else invalidate()
    })
    observer.observe(surface)
    if (!reducedMotion && canHover) {
      window.addEventListener('pointermove', move)
      document.documentElement.addEventListener('pointerleave', rest)
    }
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    reset()
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', rest)
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', reset)
      observer.disconnect()
      unsubscribeX()
      unsubscribeY()
      tiltX.stop()
      tiltY.stop()
    }
  }, [canHover, reducedMotion, gl, invalidate, tiltX, tiltY])

  const shapes = useMemo(() => {
    const svg = new SVGLoader().parse(
      `<svg xmlns="http://www.w3.org/2000/svg"><path d="${heroMark.path}" /></svg>`,
    )
    return svg.paths.flatMap((path) => SVGLoader.createShapes(path))
  }, [])
  const colors = getComputedStyle(document.documentElement)
  return (
    <group ref={group} rotation={[0.06, -0.22, -0.025]}>
      <mesh scale={[0.012, -0.012, 0.012]} position={[-2.91, 2.28, -0.08]}>
        <extrudeGeometry
          args={[
            shapes,
            {
              depth: 13,
              bevelEnabled: true,
              bevelSegments: 6,
              steps: 1,
              bevelSize: 2,
              bevelThickness: 2,
              curveSegments: 24,
            },
          ]}
        />
        <MeshTransmissionMaterial
          background={new Color(colors.getPropertyValue('--color-graphite').trim())}
          resolution={256}
          samples={6}
          backside
          backsideThickness={0.2}
          chromaticAberration={0}
          distortion={0.12}
          distortionScale={0.3}
          temporalDistortion={0}
          color={colors.getPropertyValue('--color-warm-white').trim()}
          metalness={0}
          roughness={0.12}
          transmission={1}
          thickness={0.65}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.2}
          attenuationColor={colors.getPropertyValue('--color-warm-white').trim()}
          attenuationDistance={2.5}
        />
      </mesh>
    </group>
  )
}

export default function HeroScene({ fallback }: { fallback: ReactNode }) {
  const [lost, setLost] = useState(false)
  const colors = getComputedStyle(document.documentElement)
  const white = colors.getPropertyValue('--color-warm-white').trim()
  const burgundy = colors.getPropertyValue('--color-burgundy').trim()
  if (lost) return fallback
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      fallback={fallback}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', () => setLost(true), { once: true })
      }}
    >
      <ambientLight color={white} intensity={1.5} />
      <Environment resolution={128} frames={1}>
        <Lightformer color={white} intensity={0.6} position={[0, 1, 5]} scale={[10, 10, 1]} />
        <Lightformer
          color={white}
          intensity={2}
          position={[0, 0, -4]}
          rotation={[0, Math.PI, 0]}
          scale={[6, 6, 1]}
        />
        <Lightformer color={white} intensity={4} position={[-3, 2, 4]} scale={[1.5, 7, 1]} />
        <Lightformer color={white} intensity={3} position={[2, -3, 3]} scale={[4, 1, 1]} />
        <Lightformer
          color={burgundy}
          intensity={5}
          position={[4, 1, 2]}
          rotation={[0, -0.8, 0]}
          scale={[3, 6, 1]}
        />
      </Environment>
      <directionalLight color={white} position={[-3, 4, 5]} intensity={9} />
      <directionalLight color={white} position={[3, -1, 4]} intensity={5} />
      <directionalLight color={burgundy} position={[4, 2, 1]} intensity={15} />
      <Mark />
    </Canvas>
  )
}
