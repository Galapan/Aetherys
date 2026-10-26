import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { useSpring } from 'framer-motion'
import { Color, Vector3, type Group, type Mesh, type Texture } from 'three'
import { heroMark } from '@/content/hero'
import { useMotionPreferences } from '@/hooks/useMotionPreferences'
import { getMarkShapes } from '../markShapes'
import { CompileBeforeFirstFrame } from '../CompileBeforeFirstFrame'
import { createGlassMaterial, type GlassUniforms } from '../glassMaterial'
import { createRefractionCanvas } from '../refractionCanvas'
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
const PATH_SCALE = 0.012
// Rays cross the whole slab before they reach the grid.
const GLASS_THICKNESS = EXTRUDE_OPTIONS.depth * PATH_SCALE * heroMark.scale
// Red, green and blue bend apart as they did with the transmission material's aberration.
const GLASS_IOR = new Vector3(1.5, 1.635, 1.77)
// Tinted glass: burgundy covers this share of the grid head-on and more on slanted faces,
// so the lines still read faintly through it.
const BODY_DENSITY = 0.5
// One pass of glass no longer needs the extra pixels a 3x screen would ask for.
const MAX_DPR = 2

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
  onTextureReady: (texture: Texture) => void
}) {
  const { gl, invalidate } = useThree()

  useEffect(() => {
    // Owned by this effect, so drawing into it never mutates a hook value.
    const refraction = createRefractionCanvas(gl, resolution)
    const { context } = refraction
    const background = readToken('--color-graphite')
    let active = true
    let layout = ''
    const draw = () => {
      if (!active) return
      const canvasBounds = gl.domElement.getBoundingClientRect()
      if (!canvasBounds.width || !canvasBounds.height) return

      // Lines hidden at this breakpoint measure zero.
      const lines = [...document.querySelectorAll<HTMLElement>('.hero-rule-grid > span')]
        .map((line) => ({ line, bounds: line.getBoundingClientRect() }))
        .filter(({ bounds }) => bounds.width > 0)
      // Grid and mark are pinned in the same stage and only their horizontal layout matters,
      // which vertical scrolling never changes: only a resize redraws.
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
      refraction.update()
      onTextureReady(refraction.texture)
      invalidate()
    }

    const redraw = () => {
      layout = ''
      draw()
    }

    draw()
    const observer = new ResizeObserver(redraw)
    observer.observe(gl.domElement)
    window.addEventListener('resize', redraw)

    return () => {
      active = false
      observer.disconnect()
      window.removeEventListener('resize', redraw)
      refraction.dispose()
    }
  }, [gl, invalidate, onTextureReady, resolution])

  return null
}

function Mark({ background }: { background: Texture | null }) {
  const group = useRef<Group>(null)
  const mesh = useRef<Mesh>(null)
  const glass = useRef<GlassUniforms | null>(null)
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

  // A layout effect runs before every passive one, so CompileBeforeFirstFrame always
  // compiles the glass rather than the mesh's default material.
  useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return
    const { material, uniforms } = createGlassMaterial({
      tint: new Color(readToken('--color-warm-white')),
      background: new Color(readToken('--color-graphite')),
      thickness: GLASS_THICKNESS,
      ior: GLASS_IOR,
      backdrop: true,
      body: { color: new Color(readToken('--color-burgundy')), density: BODY_DENSITY },
    })
    target.material = material
    glass.current = uniforms
    invalidate()
    return () => {
      glass.current = null
      material.dispose()
    }
  }, [invalidate])

  useEffect(() => {
    if (!glass.current) return
    glass.current.uGlassBackdrop.value = background
    invalidate()
  }, [background, invalidate])

  const shapes = getMarkShapes()

  return (
    <group ref={group} scale={heroMark.scale}>
      <mesh
        ref={mesh}
        scale={[PATH_SCALE, -PATH_SCALE, PATH_SCALE]}
        position={[-2.91, 2.28, (-EXTRUDE_OPTIONS.depth / 2) * PATH_SCALE]}
      >
        <extrudeGeometry args={[shapes, EXTRUDE_OPTIONS]} />
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

export default function HeroScene({ onDrawn }: { onDrawn: (drawn: boolean) => void }) {
  const [lost, setLost] = useState(false)
  const quality = useSceneQuality()
  // Held in state, as in NextStepScene: a constant prop would reset the loop on re-render.
  const [frameloop, setFrameloop] = useState<'never' | 'demand'>('never')
  const handleCompiled = useCallback(() => setFrameloop('demand'), [])
  const handleDrawn = useCallback(() => onDrawn(true), [onDrawn])
  const [refractionBackground, setRefractionBackground] = useState<Texture | null>(null)
  const handleContextLost = useCallback(() => {
    onDrawn(false)
    setLost(true)
  }, [onDrawn])
  const handleTextureReady = useCallback((texture: Texture) => {
    setRefractionBackground(texture)
  }, [])
  const white = readToken('--color-warm-white')
  const burgundy = readToken('--color-burgundy')
  const graphite = readToken('--color-graphite')
  const graphiteColor = useMemo(() => new Color(graphite), [graphite])
  // NextStep's light room, dimmed for the dark page: a full warm-white room would mirror
  // into the faces and fog the glass grey, hiding the grid behind it.
  const room = useMemo(() => new Color(white).lerp(graphiteColor, 0.75), [white, graphiteColor])
  if (lost) return null
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      dpr={quality.dpr}
      // Without tone mapping the refracted grid keeps the page's exact graphite and line
      // contrast; ACES would crush both to black inside the glass.
      flat
      // Stays idle until CompileBeforeFirstFrame switches it to on-demand rendering.
      frameloop={frameloop}
      // Pointer tilt reads window coordinates, so the canvas offset is never needed.
      // Without this, every scroll pause re-measures, reconfigures and re-renders the scene.
      resize={{ scroll: false }}
    >
      <RenderQuality maxDpr={Math.min(quality.maxDpr, MAX_DPR)} onContextLost={handleContextLost} />
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
      {/* Dim highlights: they catch the bevels without washing the tinted body out. */}
      <directionalLight color={white} position={[-3, 4, 5]} intensity={0.5} />
      <directionalLight color={burgundy} position={[4, 2, 1]} intensity={0.8} />
      <Mark background={refractionBackground} />
      <CompileBeforeFirstFrame backside={false} onCompiled={handleCompiled} onDrawn={handleDrawn} />
    </Canvas>
  )
}
