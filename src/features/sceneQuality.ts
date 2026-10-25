import { useSyncExternalStore } from 'react'

export interface SceneQuality {
  /** Canvas pixel-ratio range; R3F re-applies it whenever the Canvas re-renders. */
  dpr: [number, number]
  /** Upper bound for the pixel ratio set from the canvas height. */
  maxDpr: number
  /** Resolution of the glass transmission buffer. */
  transmission: number
  /** Resolution of the glass backside buffer. */
  backside: number
  /** Resolution of the DOM redraw the glass refracts. */
  refraction: number
}

// Phones and touch screens get lighter glass buffers: two transmission canvases at full
// resolution pressure mobile GPUs into losing their contexts. Desktop keeps full quality.
const compactQuery = '(pointer: coarse), (max-width: 767px)'

const COMPACT: SceneQuality = {
  dpr: [1, 1.5],
  maxDpr: 1.5,
  transmission: 512,
  backside: 256,
  refraction: 512,
}
// R3F's default dpr range, as the scenes had before.
const FULL: SceneQuality = {
  dpr: [1, 2],
  maxDpr: 3,
  transmission: 1024,
  backside: 512,
  refraction: 1024,
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(compactQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getCompact() {
  return window.matchMedia(compactQuery).matches
}

export function useSceneQuality(): SceneQuality {
  return useSyncExternalStore(subscribe, getCompact) ? COMPACT : FULL
}
