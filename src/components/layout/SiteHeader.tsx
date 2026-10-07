import type { RefObject } from 'react'
import { m } from 'framer-motion'
import type { HeroContent } from '../../content/hero'
import { AudioToggle } from '../ui/AudioToggle'

interface SiteHeaderProps {
  ref: RefObject<HTMLElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
  audioRef: RefObject<HTMLAudioElement | null>
  content: HeroContent
  reducedMotion: boolean
  canHover: boolean
  mounted: boolean
  onOpen: () => void
}

export function SiteHeader({
  ref: headerRef,
  triggerRef,
  audioRef,
  content,
  reducedMotion,
  canHover,
  mounted,
  onOpen,
}: SiteHeaderProps) {
  return (
    <header
      ref={headerRef}
      className="pointer-events-none sticky top-0 z-2 container flex h-[var(--header-height)] max-w-none items-center justify-between bg-transparent text-[color-mix(in_srgb,var(--color-warm-white)_var(--header-mix),var(--color-burgundy))] [--header-mix:100%] [--page-padding:clamp(20px,1.85vw,32px)]"
      style={{ visibility: mounted ? 'hidden' : undefined }}
    >
      <a
        className="brand pointer-events-auto inline-flex min-h-11 items-center text-[26px] font-medium tracking-[-0.055em]"
        href="#inicio"
        aria-label={content.home}
      >
        {content.brand}
      </a>
      <div className="flex items-center gap-[clamp(6px,1.8vw,12px)] md:gap-4">
        <AudioToggle
          content={content}
          reducedMotion={reducedMotion}
          canHover={canHover}
          audioRef={audioRef}
        />
        <m.button
          ref={triggerRef}
          className="pointer-events-auto flex min-h-11 items-center gap-4 rounded border-0 bg-transparent px-2 text-[18px] leading-[1.4] tracking-[0.08em] whitespace-nowrap text-inherit uppercase"
          type="button"
          aria-label={content.openMenu}
          aria-expanded={mounted}
          aria-controls="navigation-menu"
          onClick={onOpen}
          whileHover={canHover ? { y: -2 } : undefined}
          transition={{ duration: 0.18 }}
        >
          <span className="grid w-[84px] items-center justify-items-end" aria-hidden="true">
            <span className="col-start-1 row-start-1 whitespace-nowrap">{content.menu}</span>
          </span>
          <span className="grid w-5 gap-[5px]" aria-hidden="true">
            <i className="block h-px w-5 bg-current" />
            <i className="block h-px w-5 bg-current" />
          </span>
        </m.button>
      </div>
    </header>
  )
}
