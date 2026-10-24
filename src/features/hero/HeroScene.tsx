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
import { CanvasTexture, Color, LinearFilter, SRGBColorSpace, type Group, type Texture } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { heroMark } from '@/content/hero'
import { useMotionPreferences } from '@/hooks/useMotionPreferences'
import { useSceneQuality } from '../sceneQuality'

// The glass lifts the dark page with its reflections, which flattens the faint grid; each
// line is composited this many times so it reads inside the mark as it does beside it.
const LINE_GAIN = 3

const EXTRUDE_OPTIONS = {
  depth: 13,
  bevelEnabled: true,
  bevelSegments: 8,
  steps: 1,
  bevelSize: 2,
  bevelThickness: 2,
  curveSegments: 32,
}

function readToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// The transmission pass only sees the WebGL scene, so the DOM grid behind the canvas is
// redrawn into its background for the glass to refract.
function GridRefractionBackground({
  resolution,
  onTextureReady,
}: {
  resolution: number
  onTextureReady: (texture: CanvasTexture) => void
}) {
  const { gl, invalidate } = useThree()

  useEffect(() => {
    // Owned by this effect, so drawing into them never mutates a hook value.
    const canvas = document.createElement('canvas')
    // Sized and read once: resizing a canvas reallocates it, which scroll redraws can't afford.
    canvas.width = resolution
    canvas.height = resolution
    const context = canvas.getContext('2d')
    const background = readToken('--color-graphite')
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    texture.generateMipmaps = false
    let active = true
    let visible = true
    let layout = ''
    let frame = 0
    const draw = () => {
      if (!active) return
      const canvasBounds = gl.domElement.getBoundingClientRect()
      if (!canvasBounds.width || !canvasBounds.height) return

      // Lines hidden at this breakpoint measure zero.
      const lines = [...document.querySelectorAll<HTMLElement>('.hero-rule-grid > span')]
        .map((line) => ({ line, bounds: line.getBoundingClientRect() }))
        .filter(({ bounds }) => bounds.width > 0)
      // Grid and mark are pinned in the same stage; only their relative layout matters.
      const nextLayout = [
        canvasBounds.width,
        canvasBounds.height,
        ...lines.map(({ bounds }) => bounds.left - canvasBounds.left),
      ]
        .map((value) => value.toFixed(1))
        .join()
      if (nextLayout === layout) return
      layout = nextLayout

      if (!context) return

      context.fillStyle = background
      context.fillRect(0, 0, resolution, resolution)

      const scale = resolution / canvasBounds.height
      context.save()
      context.scale(canvasBounds.height / canvasBounds.width, 1)
      lines.forEach(({ line, bounds }) => {
        // The translucent line colour composites over graphite as it does on the page.
        context.fillStyle = getComputedStyle(line).backgroundColor
        for (let pass = 0; pass < LINE_GAIN; pass += 1) {
          context.fillRect(
            (bounds.left - canvasBounds.left) * scale,
            0,
            Math.max(1, bounds.width * scale),
            resolution,
          )
        }
      })
      context.restore()
      texture.needsUpdate = true
      onTextureReady(texture)
      invalidate()
    }

    const redraw = () => {
      layout = ''
      draw()
    }
    const scroll = () => {
      if (!visible || frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        draw()
      })
    }

    draw()
    const observer = new ResizeObserver(redraw)
    observer.observe(gl.domElement)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) scroll()
    })
    visibility.observe(gl.domElement)
    window.addEventListener('resize', redraw)
    window.addEventListener('scroll', scroll, { passive: true })

    return () => {
      active = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      visibility.disconnect()
      window.removeEventListener('resize', redraw)
      window.removeEventListener('scroll', scroll)
      texture.dispose()
    }
  }, [gl, invalidate, onTextureReady, resolution])

  return null
}

function Mark({ background, resolution }: { background: Texture | Color; resolution: number }) {
  const group = useRef<Group>(null)
  const { gl, invalidate } = useThree()
  const { reducedMotion, canHover } = useMotionPreferences()
  const tiltX = useSpring(0, { stiffness: 420, damping: 32, mass: 0.6 })
  const tiltY = useSpring(0, { stiffness: 420, damping: 32, mass: 0.6 })

  useEffect(() => {
    const surface = gl.domElement.closest('.sticky-stage')
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
  // Pale glass as in NextStep: warm white with a breath of graphite, so the grid reads through.
  const glassTint = useMemo(
    () =>
      new Color(readToken('--color-warm-white')).lerp(
        new Color(readToken('--color-graphite')),
        0.05,
      ),
    [],
  )
  return (
    <group ref={group} scale={heroMark.scale}>
      <mesh scale={[0.012, -0.012, 0.012]} position={[-2.91, 2.28, -0.08]}>
        <extrudeGeometry args={[shapes, EXTRUDE_OPTIONS]} />
        <MeshTransmissionMaterial
          // A backside pass renders the far faces against the dark page first, which inks the
          // body to black and hides the grid; the front faces alone keep it see-through.
          resolution={resolution}
          samples={6}
          background={background}
          color={glassTint}
          metalness={0}
          roughness={0.02}
          transmission={1}
          // Thickness uses the SVG's local units, before the mesh scale.
          thickness={EXTRUDE_OPTIONS.depth}
          ior={1.5}
          chromaticAberration={0.18}
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

function RenderQuality({ maxDpr, onContextLost }: { maxDpr: number; onContextLost: () => void }) {
  const { gl, size, setDpr, invalidate } = useThree()
  const onContextLostEvent = useEffectEvent(onContextLost)

  useEffect(() => {
    // Target a 1080px-high drawing buffer, with a bounded cost on small screens.
    setDpr(Math.min(maxDpr, Math.max(1, 1080 / Math.max(1, size.height))))
    invalidate()
  }, [invalidate, maxDpr, setDpr, size.height])

  useEffect(() => {
    const canvas = gl.domElement
    const handleContextLost = () => onContextLostEvent()
    canvas.addEventListener('webglcontextlost', handleContextLost, { once: true })
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost)
  }, [gl])

  return null
}

export default function HeroScene({ fallback }: { fallback: ReactNode }) {
  const [lost, setLost] = useState(false)
  const quality = useSceneQuality()
  const [refractionBackground, setRefractionBackground] = useState<CanvasTexture | null>(null)
  const handleContextLost = useCallback(() => setLost(true), [])
  const handleTextureReady = useCallback((texture: CanvasTexture) => {
    setRefractionBackground(texture)
  }, [])
  const white = readToken('--color-warm-white')
  const burgundy = readToken('--color-burgundy')
  const graphite = readToken('--color-graphite')
  const graphiteColor = useMemo(() => new Color(graphite), [graphite])
  // NextStep's light room, dimmed for the dark page: a full warm-white room would mirror
  // into the faces and fog the glass grey, hiding the grid behind it.
  const room = useMemo(() => new Color(white).lerp(graphiteColor, 0.75), [white, graphiteColor])
  if (lost) return fallback
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      dpr={quality.dpr}
      // Without tone mapping the refracted grid keeps the page's exact graphite and line
      // contrast; ACES would crush both to black inside the glass.
      flat
      frameloop="demand"
      // Pointer tilt reads window coordinates, so the canvas offset is never needed.
      // Without this, every scroll pause re-measures, reconfigures and re-renders the
      // transmission passes.
      resize={{ scroll: false }}
      fallback={fallback}
    >
      <RenderQuality maxDpr={quality.maxDpr} onContextLost={handleContextLost} />
      <GridRefractionBackground
        resolution={quality.refraction}
        onTextureReady={handleTextureReady}
      />
      <ambientLight color={white} intensity={0.3} />
      <Environment resolution={512} frames={1}>
        {/* Grazing reflections brighten the edges instead of inking them, while the burgundy
            panel keeps the secondary light on the right. */}
        <color attach="background" args={[room]} />
        <Lightformer color={white} intensity={5} position={[-4, 1, 2]} scale={[1.2, 8, 1]} />
        <Lightformer color={white} intensity={2} position={[0, 4, 1]} scale={[12, 1.6, 1]} />
        <Lightformer color={burgundy} intensity={5} position={[4, 0, 2]} scale={[2, 7, 1]} />
        <Lightformer color={white} intensity={1} position={[0, 0, -5]} scale={[6, 6, 1]} />
      </Environment>
      <directionalLight color={white} position={[-3, 4, 5]} intensity={1.5} />
      <directionalLight color={burgundy} position={[4, 2, 1]} intensity={2.5} />
      <Mark background={refractionBackground ?? graphiteColor} resolution={quality.transmission} />
    </Canvas>
  )
}
