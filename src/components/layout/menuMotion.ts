const expoOut = [0.16, 1, 0.3, 1] as const
const sceneDuration = 0.7

export function createSceneTransition(
  expanded: boolean,
  reducedMotion: boolean,
  hasPendingLocale: boolean,
) {
  return {
    duration: reducedMotion || hasPendingLocale ? 0 : sceneDuration,
    delay: expanded || reducedMotion || hasPendingLocale ? 0 : 0.12,
    ease: expoOut,
  }
}

export type SceneTransition = ReturnType<typeof createSceneTransition>

export function getMenuDimensions(snapshot: { width: number; height: number } | null) {
  return snapshot
    ? {
        gap: Math.min(32, Math.max(16, snapshot.width * 0.042)),
        headerInset: Math.min(80, snapshot.height * 0.08),
      }
    : { gap: 0, headerInset: 0 }
}

export function createReveal(
  expanded: boolean,
  reducedMotion: boolean,
  delay: number,
  masked = false,
) {
  return {
    initial: reducedMotion ? (false as const) : { opacity: 0, y: masked ? '110%' : '12px' },
    animate: { opacity: expanded ? 1 : 0, y: reducedMotion || expanded ? '0%' : '-30%' },
    transition: {
      duration: reducedMotion ? 0 : expanded ? 0.65 : 0.22,
      delay: reducedMotion || !expanded ? 0 : delay,
      ease: expoOut,
    },
  }
}
