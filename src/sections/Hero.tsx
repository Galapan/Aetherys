import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { HeroContent } from '../content/hero'
import { HeroMark } from '../features/hero/HeroMark'

interface HeroProps {
  content: HeroContent
  reducedMotion: boolean
}

const curtainEase = [0.76, 0, 0.24, 1] as const

export function Hero({ content, reducedMotion }: HeroProps) {
  const [introduced, setIntroduced] = useState(reducedMotion)
  if (reducedMotion && !introduced) setIntroduced(true)
  const entering = !introduced && !reducedMotion

  useEffect(() => {
    if (introduced) return
    const finish = () => setIntroduced(true)
    const timer = window.setTimeout(finish, 5400)
    document.addEventListener('focusin', finish)
    document.addEventListener('pointerdown', finish)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('focusin', finish)
      document.removeEventListener('pointerdown', finish)
    }
  }, [introduced])

  function reveal(delay: number) {
    return {
      initial: entering ? { opacity: 0, y: 24 } : (false as const),
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: entering ? 0.8 : 0,
        delay: entering ? delay : 0,
        ease: 'easeOut' as const,
      },
    }
  }

  return (
    <section className="hero container" aria-labelledby="hero-heading">
      {entering &&
        createPortal(
          <div className="hero-entrance" aria-hidden="true">
            <div className="entrance-columns">
              {Array.from({ length: 8 }, (_, index) => (
                <div className="entrance-column" key={index}>
                  <motion.span
                    className="entrance-top"
                    initial={{ y: '0%' }}
                    animate={{ y: '-101%' }}
                    transition={{
                      duration: 1.35,
                      delay: 3.55 + Math.abs(index - 3.5) * 0.1,
                      ease: curtainEase,
                    }}
                  />
                  <motion.span
                    className="entrance-bottom"
                    initial={{ y: '0%' }}
                    animate={{ y: '101%' }}
                    transition={{
                      duration: 1.35,
                      delay: 3.55 + Math.abs(index - 3.5) * 0.1,
                      ease: curtainEase,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="entrance-center">
              <motion.span
                className="entrance-name"
                initial={{ scaleX: 1, opacity: 1 }}
                animate={{ scaleX: 0.035, opacity: 0 }}
                transition={{ delay: 1.7, duration: 0.6, ease: curtainEase }}
              >
                {Array.from(content.brand).map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{
                      delay: 0.15 + index * 0.035,
                      duration: 0.65,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.span>
              <motion.span
                className="entrance-cross"
                initial={{ opacity: 0, rotate: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 0, 180, 180],
                  scale: [0.6, 1, 1, 0.3],
                }}
                transition={{
                  delay: 2.2,
                  duration: 1.25,
                  times: [0, 0.16, 0.8, 1],
                  ease: 'easeInOut',
                }}
              />
            </div>
          </div>,
          document.body,
        )}
      <div className="hero-grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="hero-stage" aria-hidden="true">
        <motion.div className="hero-mark-reveal" {...reveal(3.8)}>
          <HeroMark />
        </motion.div>
      </div>
      <div className="hero-content">
        <motion.h1 id="hero-heading" {...reveal(4)}>
          {content.heading}
        </motion.h1>
      </div>
      <div className="hero-bottom">
        <p className="eyebrow">{content.eyebrow}</p>
        <span className="hero-cross" aria-hidden="true" />
      </div>
    </section>
  )
}
