import { SectionTitleReveal } from '@/components/ui/SectionTitleReveal'

interface AboutEyebrowProps {
  id: string
  text: string
  reducedMotion: boolean
  className?: string
}

/** Burgundy section label of the light about sections, revealed by its sweeping cover. */
export function AboutEyebrow({ id, text, reducedMotion, className }: AboutEyebrowProps) {
  return (
    <h2
      id={id}
      className={`text-burgundy m-0 text-[16px] leading-[1.4] font-bold tracking-[0.08em] uppercase ${className ?? ''}`}
    >
      <SectionTitleReveal text={text} reducedMotion={reducedMotion} />
    </h2>
  )
}
