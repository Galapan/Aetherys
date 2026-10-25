import type { ReactNode } from 'react'
import { RuleGrid } from '@/components/ui/RuleGrid'

interface LightSectionProps {
  id?: string
  labelledBy: string
  className?: string
  children: ReactNode
}

/**
 * Light page surface (about, contact): warm-white panel, graphite text with a matching
 * secondary tone, and the burgundy guide lines behind the content.
 */
export function LightSection({ id, labelledBy, className, children }: LightSectionProps) {
  return (
    <section
      id={id}
      className={`bg-warm-white text-graphite relative z-1 [--color-secondary:color-mix(in_srgb,var(--color-graphite)_62%,transparent)] ${className ?? ''}`}
      aria-labelledby={labelledBy}
    >
      <RuleGrid className="absolute inset-0" spanClassName="bg-grid-burgundy" />
      {children}
    </section>
  )
}
