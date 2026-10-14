import { useEffect, useEffectEvent, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const QUALITY_STEPS = [3, 2.25, 1.75, 1.5]
const FRAME_SAMPLE_COUNT = 45
const FRAME_BUDGET_MS = 22

function targetDpr(height: number) {
  return Math.min(3, Math.max(1, 1080 / Math.max(1, height)))
}

export function RenderQuality({ onContextLost }: { onContextLost: () => void }) {
  const { gl, size, setDpr, invalidate } = useThree()
  const onContextLostEvent = useEffectEvent(onContextLost)
  const target = useRef(1)
  const currentDpr = useRef(1)
  const qualityIndex = useRef(0)
  const averageFrameTime = useRef(0)
  const sampleCount = useRef(0)
  const previousTimestamp = useRef(0)

  useEffect(() => {
    target.current = targetDpr(size.height)
    const nextDpr = Math.min(target.current, QUALITY_STEPS[qualityIndex.current])
    currentDpr.current = nextDpr
    averageFrameTime.current = 0
    sampleCount.current = 0
    previousTimestamp.current = 0
    setDpr(nextDpr)
    invalidate()
  }, [invalidate, setDpr, size.height])

  useFrame((_, delta) => {
    const now = performance.now()
    const elapsed = previousTimestamp.current === 0 ? 0 : now - previousTimestamp.current
    previousTimestamp.current = now

    // Ignore the long idle gap before a demand-rendered frame and warm-up frames.
    if (elapsed === 0 || elapsed > 100 || delta < 0.004 || delta > 0.08) {
      averageFrameTime.current = 0
      sampleCount.current = 0
      return
    }

    averageFrameTime.current =
      sampleCount.current === 0 ? delta * 1000 : averageFrameTime.current * 0.9 + delta * 1000 * 0.1
    sampleCount.current += 1
    if (sampleCount.current < FRAME_SAMPLE_COUNT) return

    sampleCount.current = 0
    if (
      averageFrameTime.current <= FRAME_BUDGET_MS ||
      qualityIndex.current >= QUALITY_STEPS.length - 1
    )
      return

    qualityIndex.current += 1
    const nextDpr = Math.min(target.current, QUALITY_STEPS[qualityIndex.current])
    if (nextDpr >= currentDpr.current - 0.01) return

    currentDpr.current = nextDpr
    setDpr(nextDpr)
    invalidate()
  })

  useEffect(() => {
    const canvas = gl.domElement
    const handleContextLost = () => onContextLostEvent()
    canvas.addEventListener('webglcontextlost', handleContextLost, { once: true })
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost)
  }, [gl])

  return null
}

export function RenderReady({ onReady }: { onReady: () => void }) {
  const { invalidate } = useThree()
  const ready = useRef(false)

  useEffect(() => {
    invalidate()
  }, [invalidate])

  useFrame(() => {
    if (ready.current) return
    ready.current = true
    onReady()
  })

  return null
}
