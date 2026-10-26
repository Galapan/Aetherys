import { useEffect, useEffectEvent } from 'react'
import { useThree } from '@react-three/fiber'
import { BackSide, DoubleSide, Mesh, WebGLRenderTarget, type Material, type Side } from 'three'

// Linking the glass shaders blocks the main thread when the first frame needs them, which
// froze the page whenever the scene mounted mid-scroll. They compile in parallel first
// (KHR_parallel_shader_compile where available) and only then is the first frame drawn.
// The backside pass renders the glass's far faces into an offscreen buffer, a separate
// program variant (BackSide, no tone mapping) that a plain compile of the scene misses and
// that used to link synchronously on the first frame. Scenes without that pass skip it.
export function CompileBeforeFirstFrame({
  backside = true,
  onCompiled,
  onDrawn,
}: {
  backside?: boolean
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
      if (!backside || !(object instanceof Mesh)) return
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
    const backsidePass = backside ? gl.compileAsync(scene, camera) : Promise.resolve()
    sides.forEach((side, material) => {
      material.side = side
      material.needsUpdate = true
    })
    gl.setRenderTarget(previousTarget)
    const frontside = gl.compileAsync(scene, camera)
    Promise.all([backsidePass, frontside]).then(start, start)

    return () => {
      active = false
      cancelAnimationFrame(frame)
      target.dispose()
    }
  }, [backside, camera, gl, invalidate, scene])

  return null
}
