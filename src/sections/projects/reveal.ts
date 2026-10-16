export function reveal(index: number, reducedMotion: boolean) {
  return {
    initial: reducedMotion ? false : { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: {
      duration: reducedMotion ? 0 : 0.7,
      delay: reducedMotion ? 0 : index * 0.08,
      ease: 'easeOut' as const,
    },
  }
}
