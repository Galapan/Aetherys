import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
  const tiltX = useSpring(0, { stiffness: 420, damping: 32, mass: 0.6 })
  const tiltY = useSpring(0, { stiffness: 420, damping: 32, mass: 0.6 })

  useEffect(() => {
    const surface = gl.domElement.closest('.hero')
    if (!surface) return
    let visible = true
    const apply = () => {
      if (!group.current) return
      group.current.rotation.set(tiltX.get(), tiltY.get(), 0)
      if (visible && !document.hidden) invalidate()
    }
    const reset = () => {
      tiltX.jump(0)
      tiltY.jump(0)
      apply()
    }
    const hold = () => {
      tiltX.jump(tiltX.get())
      tiltY.jump(tiltY.get())
    }
    const visibility = () => {
      if (document.hidden) hold()
      else if (visible) invalidate()
    }
    const move = (event: PointerEvent) => {
      if (!visible || document.hidden || document.querySelector('dialog[open]')) return
      if (event.pointerType !== 'mouse') return
      const bounds = surface.getBoundingClientRect()
      const markBounds = gl.domElement.getBoundingClientRect()
      const x = Math.max(
        -1,
        Math.min(1, (event.clientX - markBounds.left - markBounds.width / 2) / (bounds.width / 2)),
      )
      const y = Math.max(
        -1,
        Math.min(1, (event.clientY - markBounds.top - markBounds.height / 2) / (bounds.height / 2)),
      )
      tiltX.set(y * 0.28)
      tiltY.set(x * 0.5)
    }
    const unsubscribeX = tiltX.on('change', apply)
    const unsubscribeY = tiltY.on('change', apply)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) hold()
      else invalidate()
    })
    observer.observe(surface)
    if (!reducedMotion && canHover) {
      // On pointer exit, let the springs settle at the last cursor target.
      window.addEventListener('pointermove', move)
    }
    document.addEventListener('visibilitychange', visibility)
    reset()
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('visibilitychange', visibility)
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
  const graphite = new Color(colors.getPropertyValue('--color-graphite').trim())
  const body = new Color(colors.getPropertyValue('--color-warm-white').trim()).lerp(graphite, 0.15)
  return (
    <group ref={group} scale={heroMark.scale}>
      <mesh scale={[0.012, -0.012, 0.012]} position={[-2.91, 2.28, -0.08]}>
        <extrudeGeometry
          args={[
            shapes,
            {
              depth: 13,
              bevelEnabled: true,
              bevelSegments: 8,
              steps: 1,
              bevelSize: 2,
              bevelThickness: 2,
              curveSegments: 32,
            },
          ]}
        />
        <MeshTransmissionMaterial
          backside
          resolution={512}
          backsideResolution={512}
          samples={4}
          color={body}
          metalness={0}
          roughness={0.04}
          transmission={1}
          // Thickness uses the SVG's local units, before the mesh scale.
          thickness={13}
          backsideThickness={2}
          backsideEnvMapIntensity={1.2}
          attenuationColor={graphite}
          attenuationDistance={0.85}
          ior={1.5}
          chromaticAberration={0}
          anisotropicBlur={0}
          distortion={0}
          temporalDistortion={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  )
}

function RenderQuality({
  onContextLost,
  onResolutionChange,
}: {
  onContextLost: () => void
  onResolutionChange: (dpr: number) => void
}) {
  const { gl, size } = useThree()

  useEffect(() => {
    // Target a 1080px-high drawing buffer, with a bounded cost on small screens.
    onResolutionChange(Math.min(3, Math.max(1, 1080 / Math.max(1, size.height))))
  }, [onResolutionChange, size.height])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('webglcontextlost', onContextLost, { once: true })
    return () => canvas.removeEventListener('webglcontextlost', onContextLost)
  }, [gl, onContextLost])

  return null
}

export default function HeroScene({ fallback }: { fallback: ReactNode }) {
  const [lost, setLost] = useState(false)
  const [dpr, setDpr] = useState(1)
  const handleContextLost = useCallback(() => setLost(true), [])
  const colors = getComputedStyle(document.documentElement)
  const white = colors.getPropertyValue('--color-warm-white').trim()
  const burgundy = colors.getPropertyValue('--color-burgundy').trim()
  if (lost) return fallback
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: true }}
      frameloop="demand"
      fallback={fallback}
    >
      <RenderQuality onContextLost={handleContextLost} onResolutionChange={setDpr} />
      <ambientLight color={white} intensity={0.25} />
      <Environment resolution={512} frames={1}>
        <Lightformer color={white} intensity={5} position={[-4, 1, 2]} scale={[1.2, 8, 1]} />
        <Lightformer color={white} intensity={2} position={[0, 4, 1]} scale={[12, 1.6, 1]} />
        <Lightformer color={burgundy} intensity={5} position={[4, 0, 2]} scale={[2, 7, 1]} />
        <Lightformer color={white} intensity={1} position={[0, 0, -5]} scale={[6, 6, 1]} />
      </Environment>
      <directionalLight color={white} position={[-3, 4, 5]} intensity={1.5} />
      <directionalLight color={burgundy} position={[4, 2, 1]} intensity={2.5} />
      <Mark />
    </Canvas>
  )
}
