import { useEffect, useState } from 'react'

export function useHeroEntrance(reducedMotion: boolean) {
  const [introduced, setIntroduced] = useState(reducedMotion)
  if (reducedMotion && !introduced) setIntroduced(true)
  const entering = !introduced && !reducedMotion

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
