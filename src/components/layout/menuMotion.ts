const expoOut = [0.16, 1, 0.3, 1] as const
const easeIn = [0.5, 0, 0.75, 0] as const
const veilEase = [0.4, 0, 0.2, 1] as const
// Both ways lead with the header, as in the reference: it swaps its word and folds or unfolds
// Contact in place, and only then does the menu move.
const HEADER_LEAD = 0.4
// Closing then mirrors the opening: the rows drop out through their masks one after another,
// in the order they rose, and only once they are gone does the page scale back. Each row's exit
// delay is its entry delay past the first row, compressed by ROW_EXIT_STAGGER.
const FIRST_ROW_DELAY = 0.35
const ROW_EXIT_STAGGER = 0.3
const ROW_EXIT = { duration: 0.5, ease: easeIn }
// The last row (entry delay 1.02) is out at about 1.1s; the scene starts just before.
const CLOSE_DELAY = 1

/**
 * Header beats, in seconds from the click; the scene waits HEADER_LEAD / CLOSE_DELAY. The same
 * beats play both ways with the words reversed: the word leaves, Contact folds (or unfolds)
 * while the dash slides, then the other word rises.
 */
export const headerMotion = {
  wordExit: { duration: 0.14, ease: easeIn },
  wordEnter: { duration: 0.32, ease: expoOut },
  fold: { duration: 0.26, delay: 0.1, ease: [0.5, 0, 0.15, 1] as const },
  wordEnterDelay: 0.32,
}

export function createSceneTransition(
  expanded: boolean,
  reducedMotion: boolean,
  hasPendingLocale: boolean,
) {
  const instant = reducedMotion || hasPendingLocale
  return {
    duration: instant ? 0 : expanded ? 0.8 : 0.6,
    delay: instant ? 0 : expanded ? HEADER_LEAD : CLOSE_DELAY,
    ease: expoOut,
  }
}

export type SceneTransition = ReturnType<typeof createSceneTransition>

/** Warm-white veil over the shrinking page: it washes the page out before the rows rise. */
export function createPanelTransition(expanded: boolean, sceneTransition: SceneTransition) {
  if (!expanded || sceneTransition.duration === 0) return sceneTransition
  return { duration: 0.6, delay: sceneTransition.delay + 0.1, ease: veilEase }
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
  const hidden = masked ? '110%' : '12px'
  return {
    initial: reducedMotion ? (false as const) : { opacity: 0, y: hidden },
    // Masked rows leave downwards through their clip and stay opaque, as in the reference.
    animate: {
      opacity: expanded || masked ? 1 : 0,
      y: reducedMotion || expanded ? '0%' : hidden,
    },
    transition: reducedMotion
      ? { duration: 0 }
      : expanded
        ? { duration: 0.65, delay: HEADER_LEAD + delay, ease: expoOut }
        : {
            ...ROW_EXIT,
            delay: HEADER_LEAD + Math.max(delay - FIRST_ROW_DELAY, 0) * ROW_EXIT_STAGGER,
          },
  }
}
