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

// A thick slab, like the reference glass letter: its side faces carry most of the refraction.
const EXTRUDE_OPTIONS = {
  depth: 32,
  bevelEnabled: true,
  bevelSegments: 6,
  steps: 1,
  bevelSize: 1.5,
  bevelThickness: 1.5,
  curveSegments: 32,
}
const PATH_SCALE = 0.012

function readToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function HeadingRefractionBackground({
  headingKey,
  onTextureReady,
}: {
  headingKey: string
  onTextureReady: (texture: CanvasTexture) => void
}) {
  const { gl, invalidate } = useThree()

  useEffect(() => {
    // Owned by this effect, so drawing into them never mutates a hook value.
    const canvas = document.createElement('canvas')
    // Sized and read once: resizing a canvas reallocates it, which scroll redraws can't afford.
    const resolution = 1024
    canvas.width = resolution
    canvas.height = resolution
    const context = canvas.getContext('2d')
    const background = readToken('--color-warm-white')
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
      const heading = document.getElementById('next-step-heading')
      if (!heading) return

      const canvasBounds = gl.domElement.getBoundingClientRect()
      if (!canvasBounds.width || !canvasBounds.height) return

      const words = [...heading.querySelectorAll<HTMLElement>('[data-heading-word]')].map(
        (word) => ({ word, bounds: word.getBoundingClientRect() }),
      )
      // Scrolling moves canvas and words together; only their relative layout matters.
      const nextLayout = [
        canvasBounds.width,
        canvasBounds.height,
        ...words.flatMap(({ bounds }) => [
          bounds.left - canvasBounds.left,
          bounds.top - canvasBounds.top,
        ]),
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
      // The em box sits centred in each word's line box, whatever the line-height.
      context.textBaseline = 'middle'

      words.forEach(({ word, bounds }) => {
        const text = word.textContent?.trim()
        if (!text) return

        const style = getComputedStyle(word)
        context.font = `${style.fontStyle} ${style.fontWeight} ${
          Number.parseFloat(style.fontSize) * scale
        }px ${style.fontFamily}`
        context.letterSpacing = `${(Number.parseFloat(style.letterSpacing) || 0) * scale}px`
        context.fillStyle = style.color
        context.fillText(
          text,
          (bounds.left - canvasBounds.left) * scale,
          (bounds.top + bounds.height / 2 - canvasBounds.top) * scale,
        )
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
    // The words converge with scroll. Two frames let Motion apply this frame's transforms
    // before they are measured.
    const scroll = () => {
      if (!visible || frame) return
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          frame = 0
          draw()
        })
      })
    }

    draw()
    const heading = document.getElementById('next-step-heading')
    const observer = new ResizeObserver(redraw)
    observer.observe(gl.domElement)
    if (heading) observer.observe(heading)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) scroll()
    })
    visibility.observe(gl.domElement)
    window.addEventListener('resize', redraw)
    window.addEventListener('scroll', scroll, { passive: true })
    void document.fonts.ready.then(redraw)

    return () => {
      active = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      visibility.disconnect()
      window.removeEventListener('resize', redraw)
      window.removeEventListener('scroll', scroll)
      texture.dispose()
    }
  }, [gl, headingKey, invalidate, onTextureReady])

  return null
}

function Mark({ background }: { background: Texture | Color }) {
  const group = useRef<Group>(null)
  const { gl, invalidate } = useThree()
  const { reducedMotion, canHover } = useMotionPreferences()
  // Soft and slightly lagging, like the reference letter easing after the cursor.
  const tiltX = useSpring(0, { stiffness: 140, damping: 22, mass: 0.9 })
  const tiltY = useSpring(0, { stiffness: 140, damping: 22, mass: 0.9 })

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
  // Pale glass: warm white with a breath of graphite, so the faces read just below the page.
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
      <mesh
        scale={[PATH_SCALE, -PATH_SCALE, PATH_SCALE]}
        position={[-2.91, 2.28, (-EXTRUDE_OPTIONS.depth / 2) * PATH_SCALE]}
      >
        <extrudeGeometry args={[shapes, EXTRUDE_OPTIONS]} />
        <MeshTransmissionMaterial
          backside
          resolution={1024}
          backsideResolution={512}
          samples={6}
          background={background}
          color={glassTint}
          metalness={0}
          roughness={0.02}
          transmission={1}
          thickness={EXTRUDE_OPTIONS.depth}
          backsideThickness={4}
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

// Linking the glass shaders blocks the main thread when the first frame needs them, which
// froze the page whenever the scene mounted mid-scroll. They compile in parallel first
// (KHR_parallel_shader_compile where available) and only then is the first frame drawn.
function CompileBeforeFirstFrame() {
  const { gl, scene, camera, setFrameloop, invalidate } = useThree()

  useEffect(() => {
    let active = true
    const start = () => {
      if (!active) return
      setFrameloop('demand')
      invalidate()
    }
    gl.compileAsync(scene, camera).then(start, start)
    return () => {
      active = false
    }
  }, [camera, gl, invalidate, scene, setFrameloop])

  return null
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
  heading: [string, string, string, string]
}) {
  const [lost, setLost] = useState(false)
  const [refractionBackground, setRefractionBackground] = useState<CanvasTexture | null>(null)
  const handleContextLost = useCallback(() => setLost(true), [])
  const handleTextureReady = useCallback((texture: CanvasTexture) => {
    setRefractionBackground(texture)
  }, [])
  const warmWhite = readToken('--color-warm-white')
  const warmWhiteColor = useMemo(() => new Color(warmWhite), [warmWhite])
  const headingKey = heading.join('\u0000')

  if (lost) return fallback

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      // Stays idle until CompileBeforeFirstFrame switches it to on-demand rendering.
      frameloop="never"
      // Pointer tilt reads window coordinates, so the canvas offset is never needed.
      // Without this, every scroll pause re-measures, reconfigures and re-renders the
      // transmission passes.
      resize={{ scroll: false }}
      fallback={fallback}
    >
      <RenderQuality onContextLost={handleContextLost} />
      <CompileBeforeFirstFrame />
      <HeadingRefractionBackground headingKey={headingKey} onTextureReady={handleTextureReady} />
      <ambientLight color={warmWhite} intensity={0.3} />
      <Environment resolution={512} frames={1}>
        {/* A light room, so grazing reflections brighten the edges instead of inking them. */}
        <color attach="background" args={[warmWhite]} />
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
