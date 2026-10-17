import { useEffect, useState } from 'react'

// The intro belongs to the first arrival on Home. Returning through an in-app page
// change (already covered by the page curtain) must not replay it.
let entranceSpent = false

/** Called on every in-app page change, so a later visit to Home skips the intro. */
export function skipHeroEntrance() {
  entranceSpent = true
}

export function useHeroEntrance(reducedMotion: boolean) {
  const [introduced, setIntroduced] = useState(() => reducedMotion || entranceSpent)
  if (reducedMotion && !introduced) setIntroduced(true)
  const entering = !introduced && !reducedMotion

  useEffect(() => {
    entranceSpent = true
  }, [])

  useEffect(() => {
    if (introduced) return
    const finish = () => setIntroduced(true)
    const timer = window.setTimeout(finish, 5400)
    document.addEventListener('focusin', finish)
    document.addEventListener('pointerdown', finish)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('focusin', finish)
      document.removeEventListener('pointerdown', finish)
    }
  }, [introduced])

  return entering
}
