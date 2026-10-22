import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import { useSpring } from 'framer-motion'
import {
  BackSide,
  CanvasTexture,
  Color,
  DoubleSide,
  LinearFilter,
  Mesh,
  SRGBColorSpace,
  WebGLRenderTarget,
  type Group,
  type Material,
  type Side,
  type Texture,
} from 'three'
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
// A lost context (GPU memory pressure, mostly on mobile) gets a fresh canvas after a pause,
// a few times, instead of leaving the static mark for good.
const CONTEXT_RETRY_MS = 1000
const MAX_CONTEXT_RETRIES = 3

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
    let published = false
    // Computed styles only change with a resize, so scroll redraws reuse them instead of
    // forcing a style recalculation for every word on every frame.
    let fonts = new Map<HTMLElement, { font: string; letterSpacing: string; color: string }>()
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

        let font = fonts.get(word)
        if (!font) {
          const style = getComputedStyle(word)
          font = {
            font: `${style.fontStyle} ${style.fontWeight} ${
              Number.parseFloat(style.fontSize) * scale
            }px ${style.fontFamily}`,
            letterSpacing: `${(Number.parseFloat(style.letterSpacing) || 0) * scale}px`,
            color: style.color,
          }
          fonts.set(word, font)
        }
        context.font = font.font
        context.letterSpacing = font.letterSpacing
        context.fillStyle = font.color
        context.fillText(
          text,
          (bounds.left - canvasBounds.left) * scale,
          (bounds.top + bounds.height / 2 - canvasBounds.top) * scale,
        )
      })

      context.restore()
      texture.needsUpdate = true
      if (!published) {
        published = true
        onTextureReady(texture)
      }
      invalidate()
    }

    const redraw = () => {
      layout = ''
      fonts = new Map()
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
  // Same cursor response as the hero mark.
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
// The backside pass renders the glass's far faces into an offscreen buffer, a separate
// program variant (BackSide, no tone mapping) that a plain compile of the scene misses and
// that used to link synchronously on the first frame.
function CompileBeforeFirstFrame({
  onCompiled,
  onDrawn,
}: {
  onCompiled: () => void
  onDrawn: () => void
}) {
  const { gl, scene, camera, invalidate } = useThree()
  const onCompiledEvent = useEffectEvent(onCompiled)
  const onDrawnEvent = useEffectEvent(onDrawn)

  useEffect(() => {
    let active = true
    let frame = 0
    const start = () => {
      if (!active) return
      onCompiledEvent()
      invalidate()
      // R3F draws on the next animation frame; by the one after, it is on screen.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (active) onDrawnEvent()
        })
      })
    }

    const sides = new Map<Material, Side>()
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return
      for (const material of [object.material as Material | Material[]].flat()) {
        if (material.side !== DoubleSide) sides.set(material, material.side)
      }
    })
    const target = new WebGLRenderTarget(1, 1)
    const previousTarget = gl.getRenderTarget()
    // compileAsync resolves programs synchronously against the renderer's current state,
    // so the state only has to hold for the call itself.
    gl.setRenderTarget(target)
    sides.forEach((_, material) => {
      material.side = BackSide
      material.needsUpdate = true
    })
    const backside = gl.compileAsync(scene, camera)
    sides.forEach((side, material) => {
      material.side = side
      material.needsUpdate = true
    })
    gl.setRenderTarget(previousTarget)
    const frontside = gl.compileAsync(scene, camera)
    Promise.all([backside, frontside]).then(start, start)

    return () => {
      active = false
      cancelAnimationFrame(frame)
      target.dispose()
    }
  }, [camera, gl, invalidate, scene])

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
  heading,
  onDrawn,
}: {
  heading: [string, string, string, string]
  /** Reports whether the glass is on screen, so the static mark covers every gap. */
  onDrawn: (drawn: boolean) => void
}) {
  const [attempt, setAttempt] = useState(0)
  const [lost, setLost] = useState(false)
  // Held in state: as a constant prop, every re-render of the Canvas (the refraction texture
  // arriving, the drawn report) set the loop back to 'never', which silently dropped every
  // later invalidate, so the glass froze and stopped following the cursor.
  const [frameloop, setFrameloop] = useState<'never' | 'demand'>('never')
  const handleCompiled = useCallback(() => setFrameloop('demand'), [])
  const [refractionBackground, setRefractionBackground] = useState<CanvasTexture | null>(null)
  const handleDrawn = useCallback(() => onDrawn(true), [onDrawn])
  const handleContextLost = useCallback(() => {
    onDrawn(false)
    setRefractionBackground(null)
    setFrameloop('never')
    setLost(true)
  }, [onDrawn])
  const handleTextureReady = useCallback((texture: CanvasTexture) => {
    setRefractionBackground(texture)
  }, [])
  const warmWhite = readToken('--color-warm-white')
  const warmWhiteColor = useMemo(() => new Color(warmWhite), [warmWhite])
  const headingKey = heading.join('\u0000')

  useEffect(() => {
    if (!lost || attempt >= MAX_CONTEXT_RETRIES) return
    // A hidden page would lose the new context again, so the retry waits until it shows.
    const retry = () => {
      if (document.hidden) return
      document.removeEventListener('visibilitychange', retry)
      setAttempt((count) => count + 1)
      setLost(false)
    }
    const timer = window.setTimeout(() => {
      document.addEventListener('visibilitychange', retry)
      retry()
    }, CONTEXT_RETRY_MS)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', retry)
    }
  }, [attempt, lost])

  if (lost) return null

  return (
    <Canvas
      // A new key mounts a fresh canvas and context after a loss.
      key={attempt}
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      // Stays idle until CompileBeforeFirstFrame switches it to on-demand rendering.
      frameloop={frameloop}
      // Pointer tilt reads window coordinates, so the canvas offset is never needed.
      // Without this, every scroll pause re-measures, reconfigures and re-renders the
      // transmission passes.
      resize={{ scroll: false }}
    >
      <RenderQuality onContextLost={handleContextLost} />
      <CompileBeforeFirstFrame onCompiled={handleCompiled} onDrawn={handleDrawn} />
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
