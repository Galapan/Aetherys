import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LanguageSwitch, type NavigationProps } from './LanguageSwitch'

interface NavbarProps extends NavigationProps {
  children: ReactNode
  reducedMotion: boolean
}

interface PageSnapshot {
  scrollY: number
  height: number
  width: number
  documentHeight: number
  headerTop: number
  headerLeft: number
  headerRight: number
}

const expoOut = [0.16, 1, 0.3, 1] as const
const sceneDuration = 0.7

export function Navbar({ children, reducedMotion, ...props }: NavbarProps) {
  const { content } = props
  const canHover = props.canHover && !reducedMotion
  const [expanded, setExpanded] = useState(false)
  const [snapshot, setSnapshot] = useState<PageSnapshot | null>(null)
  const page = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const closing = useRef(false)
  const destination = useRef<string | null>(null)
  const restoreScroll = useRef(0)
  const mounted = snapshot !== null
  const gap = snapshot ? Math.min(32, Math.max(16, snapshot.width * 0.042)) : 0
  const headerInset = snapshot ? Math.min(80, snapshot.height * 0.08) : 0
  const compact = expanded && !reducedMotion && snapshot

  useLayoutEffect(() => {
    if (!mounted) return
    const modal = dialog.current
    const opener = trigger.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    modal?.showModal()
    const resize = () =>
      setSnapshot(
        (previous) =>
          previous && {
            ...previous,
            width: document.documentElement.clientWidth,
            height: window.innerHeight,
          },
      )
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      modal?.close()
      document.body.style.overflow = previousOverflow
      window.scrollTo({ top: restoreScroll.current, behavior: 'instant' })
      const id = destination.current
      destination.current = null
      if (id) {
        const url = new URL(window.location.href)
        url.hash = id
        window.history.pushState(null, '', url)
        const target = document.getElementById(id)
        target?.focus({ preventScroll: true })
        target?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
      } else opener?.focus({ preventScroll: true })
    }
  }, [mounted])

  function openMenu() {
    if (mounted) return
    const brand = header.current?.querySelector('.brand')?.getBoundingClientRect()
    const button = trigger.current?.getBoundingClientRect()
    restoreScroll.current = window.scrollY
    closing.current = false
    setSnapshot({
      scrollY: window.scrollY,
      width: document.documentElement.clientWidth,
      height: window.innerHeight,
      documentHeight: page.current?.offsetHeight ?? document.body.scrollHeight,
      headerTop: Math.max(18, brand?.top ?? 18),
      headerLeft: brand?.left ?? 20,
      headerRight:
        document.documentElement.clientWidth -
        (button?.right ?? document.documentElement.clientWidth - 20),
    })
    setExpanded(true)
  }

  function closeMenu(id?: string) {
    if (closing.current) return
    closing.current = true
    destination.current = id ?? null
    setExpanded(false)
    if (reducedMotion) setSnapshot(null)
  }

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return
    const controls = event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled)',
    )
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  const sceneTransition = {
    duration: reducedMotion ? 0 : sceneDuration,
    delay: expanded || reducedMotion ? 0 : 0.12,
    ease: expoOut,
  }
  function reveal(delay: number, masked = false) {
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
  const links = [
    { id: 'main', label: content.homeLabel },
    { id: null, label: content.servicesLabel },
    { id: null, label: content.aboutLabel },
  ]

  return (
    <>
      <div className="navigation-scene" style={{ height: snapshot?.documentHeight }}>
        <motion.div
          ref={page}
          className="page-surface"
          initial={false}
          animate={{
            scaleX: compact ? 1 - (gap * 2) / snapshot.width : 1,
            scaleY: compact ? 1 - (gap * 2) / snapshot.height : 1,
            borderRadius: compact ? 4 : 0,
          }}
          transition={sceneTransition}
          onAnimationComplete={() => {
            if (closing.current) setSnapshot(null)
          }}
          style={
            snapshot
              ? {
                  position: 'fixed',
                  inset: 0,
                  height: snapshot.height,
                  minHeight: 0,
                  overflow: 'hidden',
                }
              : undefined
          }
        >
          <div style={snapshot ? { transform: `translateY(-${snapshot.scrollY}px)` } : undefined}>
            <header
              ref={header}
              className="site-header container"
              style={{ visibility: mounted ? 'hidden' : undefined }}
            >
              <a className="brand" href="#inicio" aria-label={content.home}>
                {content.brand}
              </a>
              <div className="header-actions">
                <LanguageSwitch {...props} canHover={canHover} />
                <motion.button
                  ref={trigger}
                  className="menu-toggle"
                  type="button"
                  aria-label={content.openMenu}
                  aria-expanded={mounted}
                  aria-controls="navigation-menu"
                  onClick={openMenu}
                  whileHover={canHover ? { y: -2 } : undefined}
                  transition={{ duration: 0.18 }}
                >
                  {content.menu}
                  <span className="menu-icon" aria-hidden="true">
                    <i />
                    <i />
                  </span>
                </motion.button>
              </div>
            </header>
            {children}
          </div>
        </motion.div>
      </div>
      <dialog
        ref={dialog}
        id="navigation-menu"
        className="menu-dialog"
        aria-label={content.navigation}
        onKeyDown={containFocus}
        onCancel={(event) => {
          event.preventDefault()
          closeMenu()
        }}
      >
        {snapshot && (
          <>
            <motion.div
              className="menu-moving-header"
              style={{
                top: snapshot.headerTop,
                left: snapshot.headerLeft,
                right: snapshot.headerRight,
              }}
              initial={{ y: 0, color: 'var(--color-warm-white)' }}
              animate={{
                y: expanded && !reducedMotion ? gap + headerInset - snapshot.headerTop : 0,
                color: expanded ? 'var(--color-graphite)' : 'var(--color-warm-white)',
              }}
              transition={sceneTransition}
            >
              <motion.span
                className="brand"
                initial={{ x: 0 }}
                animate={{ x: expanded && !reducedMotion ? gap * 2 - snapshot.headerLeft : 0 }}
                transition={sceneTransition}
              >
                {content.brand}
              </motion.span>
              <motion.button
                className="menu-toggle"
                type="button"
                aria-label={content.closeMenu}
                autoFocus
                onClick={() => closeMenu()}
                initial={{ x: 0 }}
                animate={{ x: expanded && !reducedMotion ? snapshot.headerRight - gap * 2 : 0 }}
                transition={sceneTransition}
              >
                <span className="menu-label" aria-hidden="true">
                  <motion.span
                    initial={{ opacity: 1, filter: 'blur(0px)' }}
                    animate={{
                      opacity: expanded ? 0 : 1,
                      filter: expanded && !reducedMotion ? 'blur(6px)' : 'blur(0px)',
                    }}
                    transition={{
                      duration: reducedMotion ? 0 : expanded ? 0.28 : 0.45,
                      delay: expanded || reducedMotion ? 0 : 0.12,
                    }}
                  >
                    {content.menu}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: expanded ? 1 : 0,
                      filter: !expanded && !reducedMotion ? 'blur(6px)' : 'blur(0px)',
                    }}
                    transition={{
                      duration: reducedMotion ? 0 : expanded ? 0.45 : 0.28,
                      delay: expanded && !reducedMotion ? 0.12 : 0,
                    }}
                  >
                    {content.close}
                  </motion.span>
                </span>
                <span className="menu-icon" aria-hidden="true">
                  <motion.i
                    animate={{ y: expanded ? 3 : 0, rotate: expanded ? 45 : 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.45 }}
                  />
                  <motion.i
                    animate={{ y: expanded ? -3 : 0, rotate: expanded ? -45 : 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.45 }}
                  />
                </span>
              </motion.button>
            </motion.div>
            <motion.div
              className="menu-panel"
              style={{ inset: gap }}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: expanded ? 1 : 0, y: reducedMotion || expanded ? 0 : 12 }}
              transition={sceneTransition}
            >
              <motion.div
                className="menu-panel-background"
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: expanded ? 1 : 0 }}
                transition={{
                  duration: reducedMotion ? 0 : expanded ? 0.4 : 0.32,
                  delay: reducedMotion ? 0 : expanded ? 0.2 : 0.12,
                }}
              />
              <div
                className="menu-scroll"
                style={{ paddingTop: headerInset + 60, paddingInline: gap, paddingBottom: gap }}
              >
                <div className="menu-content">
                  <nav aria-label={content.sectionsLabel}>
                    <motion.p className="eyebrow menu-column-label" {...reveal(0.35)}>
                      {content.sectionsLabel}
                    </motion.p>
                    {links.map((link, index) => (
                      <div className="menu-row-mask" key={link.label}>
                        <motion.a
                          href={link.id ? `#${link.id}` : undefined}
                          role="link"
                          aria-disabled={!link.id || undefined}
                          onClick={(event) => {
                            event.preventDefault()
                            if (link.id) closeMenu(link.id)
                          }}
                          {...reveal(0.35 + index * 0.075, true)}
                          whileHover={canHover ? { x: 8 } : undefined}
                        >
                          <span>{link.label}</span>
                          <span className="menu-link-arrow" aria-hidden="true">
                            ↗
                          </span>
                        </motion.a>
                      </div>
                    ))}
                  </nav>
                  <motion.div className="menu-projects" {...reveal(0.5)}>
                    <h2 className="eyebrow menu-column-label">{content.projectsLabel}</h2>
                  </motion.div>
                </div>
                <motion.div className="menu-language" {...reveal(0.7)}>
                  <LanguageSwitch {...props} canHover={canHover} />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </dialog>
    </>
  )
}
