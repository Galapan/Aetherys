import { m } from 'framer-motion'
import { REVEAL_EASE } from '@/components/ui/easing'
import { heroMark } from '@/content/hero'

const curtainEase = [0.76, 0, 0.24, 1] as const
const inOutEase = [0.65, 0, 0.35, 1] as const
const fold = { delay: 1.55, duration: 0.6, ease: curtainEase }

// Mark height ≈ the wordmark's cap height; its viewBox is 205 × 160.
const MARK_H = 0.78
const MARK_W = (MARK_H * 205) / 160
const GAP = 0.3125

/**
 * Opening lockup (designed in remotion-aetherys, composition "Apertura"):
 * mark + wordmark rise, the letters slide in under the mark, the mark shrinks
 * on a quarter turn into the "+", and the "+" spins away by 3.45s — just
 * before the curtain opens at 3.55s.
 *
 * Everything animates transform/opacity only, so it all runs on the same
 * compositor clock as the curtain (a main-thread width tween drifts from it
 * while the page is still loading).
 */
export function IntroLockup({ brand }: { brand: string }) {
  return (
    <div className="text-burgundy flex items-center text-[26px] leading-[1.3] font-medium tracking-[-0.055em] md:text-[32px]">
      {/* Holds the mark's place so the whole lockup starts centred */}
      <span className="block shrink-0" style={{ width: `${MARK_W}em`, height: `${MARK_H}em` }} />

      {/* Shifting by half its own width lands the mark on the centre while
          the word slides out under the mark's edge. */}
      <m.span
        className="relative block"
        initial={{ transform: 'translateX(0%)' }}
        animate={{ transform: 'translateX(50%)' }}
        transition={fold}
      >
        {/* Clipped only at the bottom, so the later quarter turn isn't cut */}
        <span
          className="absolute right-full block [clip-path:inset(-100%_-100%_0_-100%)]"
          style={{
            top: `calc(50% - ${MARK_H / 2}em)`,
            width: `${MARK_W}em`,
            height: `${MARK_H}em`,
          }}
        >
          <m.span
            className="block size-full"
            initial={{ transform: 'rotate(0deg) scale(1)' }}
            animate={{ transform: 'rotate(90deg) scale(0)' }}
            transition={{ delay: 2.1, duration: 0.3, ease: curtainEase }}
          >
            <m.svg
              className="block size-full overflow-visible"
              viewBox="140 110 205 160"
              initial={{ transform: 'translateY(110%) rotate(8deg)' }}
              animate={{ transform: 'translateY(0%) rotate(0deg)' }}
              transition={{ delay: 0.15, duration: 0.65, ease: REVEAL_EASE }}
            >
              <path d={heroMark.path} fill="currentColor" />
            </m.svg>
          </m.span>
          <m.span
            className="absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 size-3"
            initial={{ transform: 'rotate(-90deg) scale(0)' }}
            animate={{ transform: 'rotate(0deg) scale(1)' }}
            transition={{ delay: 2.3, duration: 0.3, ease: REVEAL_EASE }}
          >
            <m.span
              className="absolute inset-0 before:absolute before:top-[5px] before:h-[2px] before:w-3 before:bg-current before:content-[''] after:absolute after:left-[5px] after:h-3 after:w-[2px] after:bg-current after:content-['']"
              initial={{ opacity: 1, transform: 'rotate(0deg) scale(1)' }}
              animate={{
                opacity: [1, 1, 0],
                transform: [
                  'rotate(0deg) scale(1)',
                  'rotate(180deg) scale(1)',
                  'rotate(180deg) scale(0.3)',
                ],
              }}
              transition={{
                delay: 2.55,
                duration: 0.9,
                times: [0, 0.65 / 0.9, 1],
                ease: inOutEase,
              }}
            />
          </m.span>
        </span>

        {/* The fade spans the gap, so letters soften just before the mark */}
        <span
          className="block overflow-hidden"
          style={{ maskImage: `linear-gradient(to right, transparent, #000 ${GAP}em)` }}
        >
          <m.span
            className="flex py-1 pr-[2px]"
            style={{ paddingLeft: `${GAP}em` }}
            initial={{ transform: 'translateX(0%)' }}
            animate={{ transform: 'translateX(-100%)' }}
            transition={fold}
          >
            {Array.from(brand).map((letter, index) => (
              <m.span
                key={index}
                className="inline-block whitespace-pre"
                initial={{ transform: 'translateY(110%)' }}
                animate={{ transform: 'translateY(0%)' }}
                transition={{ delay: 0.25 + index * 0.035, duration: 0.65, ease: REVEAL_EASE }}
              >
                {letter}
              </m.span>
            ))}
          </m.span>
        </span>
      </m.span>
    </div>
  )
}
