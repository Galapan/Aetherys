const expoOut = [0.16, 1, 0.3, 1] as const
// Approximate phases observed in the supplied desktop and narrow-screen recordings.
const closeDelay = 0.65

export function createSceneTransition(
  expanded: boolean,
  reducedMotion: boolean,
  hasPendingLocale: boolean,
) {
  return {
    duration: reducedMotion || hasPendingLocale ? 0 : expanded ? 0.8 : 0.45,
    delay: reducedMotion || hasPendingLocale ? 0 : expanded ? 0.3 : closeDelay,
    ease: expoOut,
  }
}

export type SceneTransition = ReturnType<typeof createSceneTransition>

export function createPanelTransition(expanded: boolean, sceneTransition: SceneTransition) {
  return {
    ...sceneTransition,
    duration: expanded && sceneTransition.duration > 0 ? 0.55 : sceneTransition.duration,
  }
}

export function getMenuDimensions(snapshot: { width: number; height: number } | null) {
  return snapshot
    ? {
        gap: Math.min(32, Math.max(16, snapshot.width * 0.042)),
        headerInset: snapshot.width >= 1024 ? 64 : snapshot.width >= 768 ? 40 : 24,
        padding: snapshot.width >= 1024 ? 64 : snapshot.width >= 640 ? 32 : 20,
      }
    : { gap: 0, headerInset: 0, padding: 20 }
}

export function createReveal(
  expanded: boolean,
  reducedMotion: boolean,
  delay: number,
  masked = false,
) {
  return {
    initial: reducedMotion ? (false as const) : { opacity: 0, y: masked ? '110%' : '12px' },
    animate: { opacity: expanded ? 1 : 0, y: reducedMotion || expanded ? '0%' : '-110%' },
    transition: {
      duration: reducedMotion ? 0 : expanded ? 0.65 : 0.25,
      delay: reducedMotion ? 0 : expanded ? delay + 0.3 : closeDelay,
      ease: expoOut,
    },
  }
}
