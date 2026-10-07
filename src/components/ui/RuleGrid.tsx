interface RuleGridProps {
  className?: string
  spanClassName?: string
}

const lineVisibility = ['', 'hidden lg:block', '', 'hidden md:block', 'hidden lg:block', '']

export function RuleGrid({ className, spanClassName = 'h-full bg-grid' }: RuleGridProps) {
  const containerClassName = [
    'pointer-events-none flex justify-between px-[var(--page-padding)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassName} aria-hidden="true">
      {lineVisibility.map((visibility, index) => (
        <span
          key={index}
          className={['w-px shrink-0', visibility, spanClassName].filter(Boolean).join(' ')}
        />
      ))}
    </div>
  )
}
