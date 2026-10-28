import type { RefObject } from 'react'
import type { HeroContent } from '@/content/hero'
import { AudioToggle } from '@/components/ui/AudioToggle'
import { HeaderContactLink } from './HeaderContact'
import { MenuLabel } from './MenuLabel'

interface SiteHeaderProps {
  ref: RefObject<HTMLElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
  audioRef: RefObject<HTMLAudioElement | null>
  content: HeroContent
  reducedMotion: boolean
  mounted: boolean
  /** Brand link: an anchor on Home, the Home route elsewhere. */
  homeHref: string
  contactHref: string
  onOpen: () => void
}

export function SiteHeader({
  ref: headerRef,
  triggerRef,
  audioRef,
  content,
  reducedMotion,
  mounted,
  homeHref,
  contactHref,
  onOpen,
}: SiteHeaderProps) {
  return (
    // Blend the whole transparent header with the actual pixels behind it, including images.
    <header
      ref={headerRef}
      className="text-warm-white pointer-events-none sticky top-0 z-2 container flex h-[var(--header-height)] max-w-none items-center justify-between bg-transparent mix-blend-difference [--page-padding:clamp(20px,1.85vw,32px)]"
      style={{ visibility: mounted ? 'hidden' : undefined }}
    >
      <a
        className="brand pointer-events-auto inline-flex min-h-11 items-center text-[28px] font-medium tracking-[-0.055em]"
        href={homeHref}
        aria-label={content.home}
      >
        {content.brand}
      </a>
      <div className="flex items-center gap-[clamp(6px,1.8vw,12px)] md:gap-4">
        <AudioToggle content={content} reducedMotion={reducedMotion} audioRef={audioRef} />
        <HeaderContactLink href={contactHref} label={content.contact} />
        <button
          ref={triggerRef}
          className="pointer-events-auto flex min-h-11 items-center rounded border-0 bg-transparent px-2 text-[20px] leading-[1.4] tracking-[0.08em] whitespace-nowrap text-inherit uppercase"
          type="button"
          aria-label={content.openMenu}
          aria-expanded={mounted}
          aria-controls="navigation-menu"
          onClick={onOpen}
        >
          <MenuLabel content={content} expanded={false} reducedMotion={reducedMotion} />
        </button>
      </div>
    </header>
  )
}
