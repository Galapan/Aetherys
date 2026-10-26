import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

// The intro belongs to the first arrival on Home. Returning through an in-app page
// change (already covered by the page curtain) must not replay it.
let entranceSpent = false

// The curtain holds its first frame until the hero glass has compiled, so the shader link
// never lands mid-animation. A slow chunk or GPU stops holding it after this long.
const SCENE_WAIT_MS = 1500
// The last curtain column reports the end; this only catches an animation that never does.
const SAFETY_MS = 7000

/** Called on every in-app page change, so a later visit to Home skips the intro. */
export function skipHeroEntrance() {
  entranceSpent = true
}

export interface HeroEntrance {
  entering: boolean
  /** The timeline is running; until then the curtain holds its first frame. */
  playing: boolean
  /** The glass missed the start, so it mounts once the curtain has lifted. */
  sceneDeferred: boolean
  /** The hero glass has drawn its first frame. */
  sceneReady: () => void
  finish: () => void
}

export function useHeroEntrance(reducedMotion: boolean): HeroEntrance {
  const [introduced, setIntroduced] = useState(() => reducedMotion || entranceSpent)
  if (reducedMotion && !introduced) setIntroduced(true)
  const entering = !introduced && !reducedMotion
  const [playing, setPlaying] = useState(false)
  const [sceneDeferred, setSceneDeferred] = useState(false)
  const sceneReady = useCallback(() => setPlaying(true), [])
  const finish = useCallback(() => setIntroduced(true), [])

  // index.html paints the curtain before the bundle runs; the portal takes over in this commit.
  useLayoutEffect(() => {
    document.documentElement.classList.remove('intro-pending')
  }, [])

  useEffect(() => {
    entranceSpent = true
  }, [])

  useEffect(() => {
    if (introduced) return
    document.addEventListener('focusin', finish)
    document.addEventListener('pointerdown', finish)
    return () => {
      document.removeEventListener('focusin', finish)
      document.removeEventListener('pointerdown', finish)
    }
  }, [finish, introduced])

  useEffect(() => {
    if (introduced) return
    const timer = playing
      ? window.setTimeout(finish, SAFETY_MS)
      : window.setTimeout(() => {
          setSceneDeferred(true)
          setPlaying(true)
        }, SCENE_WAIT_MS)
    return () => window.clearTimeout(timer)
  }, [finish, introduced, playing])

  return { entering, playing, sceneDeferred, sceneReady, finish }
}
