import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { useSpring } from 'framer-motion'
import {
  CanvasTexture,
  Color,
  LinearFilter,
  NoColorSpace,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Mesh,
  type WebGLRenderer,
} from 'three'
import { heroMark } from '@/content/hero'
import { useMotionPreferences } from '@/hooks/useMotionPreferences'
import { getMarkShapes } from '../markShapes'
import { CompileBeforeFirstFrame } from '../CompileBeforeFirstFrame'
import { useSceneQuality } from '../sceneQuality'
import {
  createGlassMaterial,
  EMPTY_WORD_RECT,
  MAX_GLASS_WORDS,
  type GlassUniforms,
} from '../glassMaterial'

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
// Rays cross the whole slab before they reach the words.
const GLASS_THICKNESS = EXTRUDE_OPTIONS.depth * PATH_SCALE * heroMark.scale
// Red, green and blue bend apart as they did with the transmission material's aberration.
const GLASS_IOR = new Vector3(1.5, 1.635, 1.77)
// One pass of glass no longer needs the extra pixels a 3x screen would ask for.
const MAX_DPR = 2
// Room around each word for glyph overhang, as a share of its font size.
const WORD_PAD = 0.25
const ATLAS_MAX = 2048
const ATLAS_GAP = 2
// UV change below which a word has not moved (about 0.1px on a 1000px canvas).
const RECT_EPSILON = 1e-4
// A lost context (GPU memory pressure, mostly on mobile) gets a fresh canvas after a pause,
// a few times, instead of leaving the static mark for good.
const CONTEXT_RETRY_MS = 1000
const MAX_CONTEXT_RETRIES = 3

function readToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Any CSS colour (color-mix included) as a linear three colour, via a 1px canvas. */
function readCssColor(css: string, target: Color) {
  const probe = document.createElement('canvas')
  probe.width = 1
  probe.height = 1
  const context = probe.getContext('2d', { willReadFrequently: true })
  if (!context) return target
  context.fillStyle = css
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
  return target.setRGB(red / 255, green / 255, blue / 255, SRGBColorSpace)
}

interface MeasuredWord {
  word: HTMLElement
  text: string
  bounds: DOMRect
}

/**
 * Draws the heading words once into an atlas the glass samples, and keeps their boxes on the
 * canvas current as they converge with scroll. Scrolling only moves four rects: no redraw, no
 * texture upload.
 */
function trackHeadingWords(gl: WebGLRenderer, uniforms: GlassUniforms, invalidate: () => void) {
  const atlas = document.createElement('canvas')
  const context = atlas.getContext('2d')
  const rects = uniforms.uGlassWordRect.value
  const cells = uniforms.uGlassWordAtlas.value
  let texture: CanvasTexture | null = null
  // What the atlas was drawn from, so only a change of size or text redraws it.
  let drawn: { text: string; width: number; height: number; pad: number }[] = []
  let active = true
  let visible = true
  let frame = 0

  const build = (words: MeasuredWord[]) => {
    if (!context) return
    const styles = words.map(({ word }) => getComputedStyle(word))
    drawn = words.map(({ text, bounds }, index) => ({
      text,
      width: bounds.width,
      height: bounds.height,
      pad: Number.parseFloat(styles[index].fontSize) * WORD_PAD,
    }))
    const sizes = drawn.map(({ width, height, pad }) => ({
      width: width + pad * 2,
      height: height + pad * 2,
    }))
    const widest = Math.max(...sizes.map(({ width }) => width))
    const stacked = sizes.reduce((sum, { height }) => sum + height, 0)
    const scale = Math.min(
      Math.min(2, Math.max(1, window.devicePixelRatio)),
      (ATLAS_MAX - ATLAS_GAP * 2) / widest,
      (ATLAS_MAX - ATLAS_GAP * (sizes.length + 1)) / stacked,
    )
    atlas.width = Math.ceil(widest * scale) + ATLAS_GAP * 2
    atlas.height =
      sizes.reduce((sum, { height }) => sum + Math.ceil(height * scale), 0) +
      ATLAS_GAP * (sizes.length + 1)

    context.clearRect(0, 0, atlas.width, atlas.height)
    context.fillStyle = '#fff'
    context.textBaseline = 'middle'
    let top = ATLAS_GAP
    words.forEach(({ text }, index) => {
      const style = styles[index]
      const { height, pad } = drawn[index]
      const cellWidth = sizes[index].width * scale
      const cellHeight = Math.ceil(sizes[index].height * scale)
      context.font = `${style.fontStyle} ${style.fontWeight} ${
        Number.parseFloat(style.fontSize) * scale
      }px ${style.fontFamily}`
      context.letterSpacing = `${(Number.parseFloat(style.letterSpacing) || 0) * scale}px`
      // The em box sits centred in each word's line box, whatever the line-height.
      context.fillText(text, ATLAS_GAP + pad * scale, top + (pad + height / 2) * scale)
      cells[index].set(
        ATLAS_GAP / atlas.width,
        1 - (top + cellHeight) / atlas.height,
        (ATLAS_GAP + cellWidth) / atlas.width,
        1 - top / atlas.height,
      )
      top += cellHeight + ATLAS_GAP
    })

    // A new texture per atlas size: three allocates immutable storage for the first one.
    texture?.dispose()
    texture = new CanvasTexture(atlas)
    texture.colorSpace = NoColorSpace
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    texture.generateMipmaps = false
    uniforms.uGlassWords.value = texture
    if (styles[0]) readCssColor(styles[0].color, uniforms.uGlassText.value)
  }

  const update = (rebuild = false) => {
    if (!active) return
    const heading = document.getElementById('next-step-heading')
    if (!heading) return
    const canvasBounds = gl.domElement.getBoundingClientRect()
    if (!canvasBounds.width || !canvasBounds.height) return

    const words = [...heading.querySelectorAll<HTMLElement>('[data-heading-word]')]
      .slice(0, MAX_GLASS_WORDS)
      .map((word) => ({
        word,
        text: word.textContent?.trim() ?? '',
        bounds: word.getBoundingClientRect(),
      }))
    const resized =
      rebuild ||
      words.length !== drawn.length ||
      words.some(
        ({ text, bounds }, index) =>
          text !== drawn[index].text ||
          Math.abs(bounds.width - drawn[index].width) > 0.5 ||
          Math.abs(bounds.height - drawn[index].height) > 0.5,
      )
    if (resized) build(words)

    let moved = resized
    rects.forEach((rect, index) => {
      const measured = words[index]
      if (!measured) {
        if (!rect.equals(EMPTY_WORD_RECT)) {
          rect.copy(EMPTY_WORD_RECT)
          moved = true
        }
        return
      }
      const { bounds } = measured
      const { pad } = drawn[index]
      const minX = (bounds.left - pad - canvasBounds.left) / canvasBounds.width
      const maxX = (bounds.right + pad - canvasBounds.left) / canvasBounds.width
      const minY = 1 - (bounds.bottom + pad - canvasBounds.top) / canvasBounds.height
      const maxY = 1 - (bounds.top - pad - canvasBounds.top) / canvasBounds.height
      if (
        Math.abs(rect.x - minX) > RECT_EPSILON ||
        Math.abs(rect.y - minY) > RECT_EPSILON ||
        Math.abs(rect.z - maxX) > RECT_EPSILON ||
        Math.abs(rect.w - maxY) > RECT_EPSILON
      ) {
        rect.set(minX, minY, maxX, maxY)
        moved = true
      }
    })
    if (moved) invalidate()
  }

  const rebuild = () => update(true)
  // The words converge with scroll. Two frames let Motion apply this frame's transforms
  // before they are measured.
  const scroll = () => {
    if (!visible || frame) return
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = 0
        update()
      })
    })
  }

  update(true)
  const heading = document.getElementById('next-step-heading')
  const observer = new ResizeObserver(rebuild)
  observer.observe(gl.domElement)
  if (heading) observer.observe(heading)
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) scroll()
  })
  visibility.observe(gl.domElement)
  window.addEventListener('resize', rebuild)
  window.addEventListener('scroll', scroll, { passive: true })
  void document.fonts.ready.then(rebuild)

  return () => {
    active = false
    cancelAnimationFrame(frame)
    observer.disconnect()
    visibility.disconnect()
    window.removeEventListener('resize', rebuild)
    window.removeEventListener('scroll', scroll)
    uniforms.uGlassWords.value = null
    texture?.dispose()
  }
}

function Mark({ headingKey }: { headingKey: string }) {
  const group = useRef<Group>(null)
  const mesh = useRef<Mesh>(null)
  const glass = useRef<GlassUniforms | null>(null)
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

  // A layout effect runs before every passive one, so CompileBeforeFirstFrame always
  // compiles the glass rather than the mesh's default material.
  useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return
    const { material, uniforms } = createGlassMaterial({
      // Pale glass: warm white with a breath of graphite, so the faces read just below the page.
      tint: new Color(readToken('--color-warm-white')).lerp(
        new Color(readToken('--color-graphite')),
        0.05,
      ),
      background: new Color(readToken('--color-warm-white')),
      thickness: GLASS_THICKNESS,
      ior: GLASS_IOR,
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
    const uniforms = glass.current
    if (!uniforms) return
    return trackHeadingWords(gl, uniforms, invalidate)
  }, [gl, headingKey, invalidate])

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

export default function NextStepScene({
  heading,
  onDrawn,
}: {
  heading: [string, string, string, string]
  /** Reports whether the glass is on screen, so the static mark covers every gap. */
  onDrawn: (drawn: boolean) => void
}) {
  const [attempt, setAttempt] = useState(0)
  const quality = useSceneQuality()
  const [lost, setLost] = useState(false)
  // Held in state: as a constant prop, every re-render of the Canvas (the drawn report) set
  // the loop back to 'never', which silently dropped every later invalidate, so the glass
  // froze and stopped following the cursor.
  const [frameloop, setFrameloop] = useState<'never' | 'demand'>('never')
  const handleCompiled = useCallback(() => setFrameloop('demand'), [])
  const handleDrawn = useCallback(() => onDrawn(true), [onDrawn])
  const handleContextLost = useCallback(() => {
    onDrawn(false)
    setFrameloop('never')
    setLost(true)
  }, [onDrawn])
  const warmWhite = readToken('--color-warm-white')
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
      dpr={quality.dpr}
      // Stays idle until CompileBeforeFirstFrame switches it to on-demand rendering.
      frameloop={frameloop}
      // Pointer tilt reads window coordinates, so the canvas offset is never needed.
      // Without this, every scroll pause re-measures, reconfigures and re-renders the scene.
      resize={{ scroll: false }}
    >
      <RenderQuality maxDpr={Math.min(quality.maxDpr, MAX_DPR)} onContextLost={handleContextLost} />
      <Environment resolution={512} frames={1}>
        {/* A light room, so grazing reflections brighten the edges instead of inking them. */}
        <color attach="background" args={[warmWhite]} />
        <Lightformer color={warmWhite} intensity={5} position={[-4, 1, 2]} scale={[1.2, 8, 1]} />
        <Lightformer color={warmWhite} intensity={2} position={[0, 4, 1]} scale={[12, 1.6, 1]} />
        <Lightformer color={warmWhite} intensity={4} position={[4, 0, 2]} scale={[2, 7, 1]} />
        <Lightformer color={warmWhite} intensity={1} position={[0, 0, -5]} scale={[6, 6, 1]} />
      </Environment>
      {/* Faint highlights: enough to catch the bevels, not to wash the faces out. */}
      <directionalLight color={warmWhite} position={[-3, 4, 5]} intensity={0.5} />
      <directionalLight color={warmWhite} position={[4, 2, 1]} intensity={0.4} />
      <Mark headingKey={headingKey} />
      <CompileBeforeFirstFrame backside={false} onCompiled={handleCompiled} onDrawn={handleDrawn} />
    </Canvas>
  )
}
