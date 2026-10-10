import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import { useSpring } from 'framer-motion'
import {
  CanvasTexture,
  Color,
  LinearFilter,
  SRGBColorSpace,
  type Group,
  type Texture,
} from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { heroMark } from '../../content/hero'
import { useMotionPreferences } from '../../hooks/useMotionPreferences'

const EXTRUDE_OPTIONS = {
  depth: 13,
  bevelEnabled: true,
  bevelSegments: 8,
  steps: 1,
  bevelSize: 2,
  bevelThickness: 2,
  curveSegments: 32,
}

function HeadingRefractionBackground({
  headingKey,
  onTextureReady,
}: {
  headingKey: string
  onTextureReady: (texture: CanvasTexture) => void
}) {
  const { gl, invalidate } = useThree()
  const canvas = useMemo(() => document.createElement('canvas'), [])
  const texture = useMemo(() => {
    const background = new CanvasTexture(canvas)
    background.colorSpace = SRGBColorSpace
    background.minFilter = LinearFilter
    background.magFilter = LinearFilter
    background.generateMipmaps = false
    return background
  }, [canvas])

  useEffect(() => {
    let active = true
    const draw = () => {
      if (!active) return
      const heading = document.getElementById('next-step-heading')
      if (!heading) return

      const canvasBounds = gl.domElement.getBoundingClientRect()
      if (!canvasBounds.width || !canvasBounds.height) return

      const resolution = 1024
      canvas.width = resolution
      canvas.height = resolution
      const context = canvas.getContext('2d')
      if (!context) return

      context.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-warm-white')
        .trim()
      context.fillRect(0, 0, resolution, resolution)

      const scale = resolution / canvasBounds.height
      context.save()
      context.scale(canvasBounds.height / canvasBounds.width, 1)
      context.textBaseline = 'top'

      heading.querySelectorAll('span').forEach((word) => {
        const text = word.textContent?.trim()
        if (!text) return

        const bounds = word.getBoundingClientRect()
        const style = getComputedStyle(word)
        context.font = `${style.fontStyle} ${style.fontWeight} ${
          Number.parseFloat(style.fontSize) * scale
        }px ${style.fontFamily}`
        context.fillStyle = style.color
        context.fillText(
          text,
          (bounds.left - canvasBounds.left) * scale,
          (bounds.top - canvasBounds.top) * scale,
        )
      })

      context.restore()
      texture.needsUpdate = true
      onTextureReady(texture)
      invalidate()
    }

    draw()
    const heading = document.getElementById('next-step-heading')
    const observer = new ResizeObserver(draw)
    observer.observe(gl.domElement)
    if (heading) observer.observe(heading)
    window.addEventListener('resize', draw)
    void document.fonts.ready.then(draw)

    return () => {
      active = false
      observer.disconnect()
      window.removeEventListener('resize', draw)
    }
  }, [canvas, gl, headingKey, invalidate, onTextureReady, texture])

  useEffect(() => () => texture.dispose(), [texture])

  return null
}

function Mark({ background }: { background: Texture | Color }) {
  const group = useRef<Group>(null)
  const { gl, invalidate } = useThree()
  const { reducedMotion, canHover } = useMotionPreferences()
  const tiltX = useSpring(0, { stiffness: 420, damping: 32, mass: 0.6 })
  const tiltY = useSpring(0, { stiffness: 420, damping: 32, mass: 0.6 })

  useEffect(() => {
    const surface = gl.domElement.closest('section')
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
  const warmWhite = useMemo(
    () =>
      new Color(
        getComputedStyle(document.documentElement).getPropertyValue('--color-warm-white').trim(),
      ),
    [],
  )

  return (
    <group ref={group} scale={heroMark.scale}>
      <mesh scale={[0.012, -0.012, 0.012]} position={[-2.91, 2.28, -0.08]}>
        <extrudeGeometry args={[shapes, EXTRUDE_OPTIONS]} />
        <MeshTransmissionMaterial
          backside
          resolution={512}
          backsideResolution={512}
          samples={4}
          background={background}
          color={warmWhite}
          metalness={0}
          roughness={0.08}
          transmission={0.78}
          thickness={13}
          backsideThickness={2}
          ior={1.45}
          chromaticAberration={0.055}
          anisotropicBlur={0}
          distortion={0}
          temporalDistortion={0}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.2}
        />
      </mesh>
    </group>
  )
}

function RenderQuality({ onContextLost }: { onContextLost: () => void }) {
  const { gl, size, setDpr, invalidate } = useThree()
  const onContextLostEvent = useEffectEvent(onContextLost)

  useEffect(() => {
    setDpr(Math.min(3, Math.max(1, 1080 / Math.max(1, size.height))))
    invalidate()
  }, [invalidate, setDpr, size.height])

  useEffect(() => {
    const canvas = gl.domElement
    const handleContextLost = () => onContextLostEvent()
    canvas.addEventListener('webglcontextlost', handleContextLost, { once: true })
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost)
  }, [gl])

  return null
}

export default function NextStepScene({
  fallback,
  heading,
}: {
  fallback: ReactNode
  heading: [string, string, string]
}) {
  const [lost, setLost] = useState(false)
  const [refractionBackground, setRefractionBackground] = useState<CanvasTexture | null>(null)
  const handleContextLost = useCallback(() => setLost(true), [])
  const handleTextureReady = useCallback((texture: CanvasTexture) => {
    setRefractionBackground(texture)
  }, [])
  const warmWhite = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-warm-white')
    .trim()
  const warmWhiteColor = useMemo(() => new Color(warmWhite), [warmWhite])
  const headingKey = heading.join('\u0000')

  if (lost) return fallback

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      frameloop="demand"
      fallback={fallback}
    >
      <RenderQuality onContextLost={handleContextLost} />
      <HeadingRefractionBackground
        headingKey={headingKey}
        onTextureReady={handleTextureReady}
      />
      <ambientLight color={warmWhite} intensity={0.3} />
      <Environment resolution={512} frames={1}>
        <Lightformer color={warmWhite} intensity={5} position={[-4, 1, 2]} scale={[1.2, 8, 1]} />
        <Lightformer color={warmWhite} intensity={2} position={[0, 4, 1]} scale={[12, 1.6, 1]} />
        <Lightformer color={warmWhite} intensity={4} position={[4, 0, 2]} scale={[2, 7, 1]} />
        <Lightformer color={warmWhite} intensity={1} position={[0, 0, -5]} scale={[6, 6, 1]} />
      </Environment>
      <directionalLight color={warmWhite} position={[-3, 4, 5]} intensity={1.5} />
      <directionalLight color={warmWhite} position={[4, 2, 1]} intensity={1.2} />
      <Mark background={refractionBackground ?? warmWhiteColor} />
    </Canvas>
  )
}
