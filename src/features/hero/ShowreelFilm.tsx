import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { heroMark, type HeroContent } from '../../content/hero'

const duration = 20
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const progress = (time: number, start: number, length: number) => clamp((time - start) / length)
const easeOut = (value: number) => 1 - Math.pow(1 - value, 3)

function subscribeVisibility(notify: () => void) {
  document.addEventListener('visibilitychange', notify)
  return () => document.removeEventListener('visibilitychange', notify)
}
function readVisibility() {
  return !document.hidden
}

interface FilmProps {
  content: HeroContent
  active: boolean
  reducedMotion: boolean
}

export function ShowreelFilm({ content, active, reducedMotion }: FilmProps) {
  const time = useMotionValue(0)
  const [playing, setPlaying] = useState(true)
  const [ended, setEnded] = useState(false)
  const visible = useSyncExternalStore(subscribeVisibility, readVisibility)

  useEffect(() => {
    if (!active || !playing || reducedMotion || !visible || time.get() >= duration) return
    const playback = animate(time, duration, {
      duration: duration - time.get(),
      ease: 'linear',
      onComplete: () => {
        setEnded(true)
        setPlaying(false)
      },
    })
    return () => playback.stop()
  }, [active, playing, reducedMotion, visible, time])

  function togglePlayback() {
    if (!active || reducedMotion) return
    if (ended) {
      time.set(0)
      setEnded(false)
      setPlaying(true)
    } else {
      setPlaying((value) => !value)
    }
  }

  const actionLabel = reducedMotion
    ? content.showreel.reducedMotion
    : ended
      ? content.showreel.replay
      : playing
        ? content.showreel.pause
        : content.showreel.play

  return (
    <div
      className="showreel-film"
      role="button"
      tabIndex={0}
      aria-label={actionLabel}
      aria-describedby="showreel-instructions"
      aria-disabled={!active || reducedMotion}
      onClick={togglePlayback}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          if (!event.repeat) togglePlayback()
        }
      }}
    >
      <div className="showreel-film__visual" aria-hidden="true">
        {reducedMotion ? (
          <div className="reel-static">
            <img src={heroMark.fallback} alt="" />
            <strong>{content.brand}</strong>
            <p>{content.showreel.closing}</p>
          </div>
        ) : (
          <>
            <Intro time={time} content={content} />
            {content.showreel.words.map((word, index) => (
              <Word key={word} time={time} word={word} index={index} />
            ))}
            <Pattern time={time} content={content} />
            <MinimalMark time={time} content={content} />
            <Capabilities time={time} content={content} />
            <Finale time={time} content={content} />
          </>
        )}
      </div>
    </div>
  )
}

interface SceneProps {
  time: MotionValue<number>
  start: number
  end: number
  className: string
  children: ReactNode
}

function Scene({ time, start, end, className, children }: SceneProps) {
  const display = useTransform(time, (value) =>
    value >= start && (value < end || end === duration) ? 'grid' : 'none',
  )
  const opacity = useTransform(time, (value) => (start === 0 ? 1 : clamp((value - start) / 0.14)))
  return (
    <motion.div className={`reel-scene ${className}`} style={{ display, opacity }}>
      {children}
    </motion.div>
  )
}

interface SequenceProps {
  time: MotionValue<number>
  content: HeroContent
}

function Intro({ time, content }: SequenceProps) {
  const scale = useTransform(time, (t) => 0.72 + easeOut(progress(t, 0, 1.2)) * 0.28)
  const rotate = useTransform(time, [0, 1.4, 2.8], [-12, 0, 0])
  const line = useTransform(time, (t) => easeOut(progress(t, 0.3, 1.4)))
  const y = useTransform(time, (t) => `${(1 - easeOut(progress(t, 0.8, 0.7))) * 110}%`)
  return (
    <Scene time={time} start={0} end={2.8} className="reel-intro">
      <motion.img src={heroMark.fallback} alt="" style={{ scale, rotate }} />
      <div className="reel-mask">
        <motion.p style={{ y }}>{content.brand}</motion.p>
      </div>
      <motion.span className="reel-intro__line" style={{ scaleX: line }} />
    </Scene>
  )
}

function Word({ time, word, index }: { time: MotionValue<number>; word: string; index: number }) {
  const start = 2.8 + index * 0.95
  const y = useTransform(time, (t) => `${(1 - easeOut(progress(t, start, 0.42))) * 110}%`)
  const rotate = useTransform(
    time,
    (t) => (1 - easeOut(progress(t, start, 0.6))) * (index === 1 ? -8 : 8),
  )
  const scale = useTransform(time, (t) => 0.88 + easeOut(progress(t, start, 0.55)) * 0.12)
  return (
    <Scene time={time} start={start} end={start + 0.95} className={`reel-word reel-word--${index}`}>
      <div className="reel-mask">
        <motion.strong style={{ y, rotate, scale }}>{word}</motion.strong>
      </div>
      <span className="reel-word__index">0{index + 1}</span>
    </Scene>
  )
}

function Tile({ time, index }: { time: MotionValue<number>; index: number }) {
  const delay = (index % 9) * 0.025 + Math.floor(index / 9) * 0.035
  const scale = useTransform(
    time,
    (t) => easeOut(progress(t, 5.65 + delay, 0.4)) * (1 - progress(t, 8.2, 0.6) * 0.5),
  )
  const rotate = useTransform(time, (t) => progress(t, 6.3 + delay, 1.3) * (index % 2 ? 135 : -135))
  const borderRadius = useTransform(time, (t) => `${progress(t, 6.6 + delay, 0.7) * 50}%`)
  return (
    <motion.span
      className={`reel-tile reel-tile--${index % 3}`}
      style={{ scale, rotate, borderRadius }}
    />
  )
}

function Pattern({ time, content }: SequenceProps) {
  const scale = useTransform(time, (t) => 1.3 - easeOut(progress(t, 5.65, 1)) * 0.3)
  const y = useTransform(time, (t) => `${(1 - easeOut(progress(t, 6.4, 0.7))) * 140}%`)
  return (
    <Scene time={time} start={5.65} end={8.8} className="reel-pattern">
      <motion.div className="reel-pattern__grid" style={{ scale }}>
        {Array.from({ length: 45 }, (_, index) => (
          <Tile key={index} time={time} index={index} />
        ))}
      </motion.div>
      <div className="reel-pattern__title reel-mask">
        <motion.strong style={{ y }}>{content.showreel.craft}</motion.strong>
      </div>
    </Scene>
  )
}

function MinimalMark({ time, content }: SequenceProps) {
  const opacity = useTransform(time, (t) => progress(t, 8.8, 0.65))
  const y = useTransform(time, (t) => (1 - easeOut(progress(t, 8.8, 0.85))) * 12)
  return (
    <Scene time={time} start={8.8} end={12} className="reel-minimal-mark">
      <motion.div className="reel-minimal-mark__content" style={{ opacity, y }}>
        <img src={heroMark.fallback} alt="" />
        <p>{content.showreel.craft}</p>
      </motion.div>
    </Scene>
  )
}

function Capability({
  time,
  index,
  label,
}: {
  time: MotionValue<number>
  index: number
  label: string
}) {
  const start = 12 + index * 0.16
  const y = useTransform(time, (t) => `${(1 - easeOut(progress(t, start, 0.65))) * 120}%`)
  const scale = useTransform(time, (t) => 0.8 + easeOut(progress(t, start, 0.65)) * 0.2)
  const line = useTransform(time, (t) => easeOut(progress(t, start + 0.5, 1.4)))
  const rotate = useTransform(time, (t) => progress(t, start + 0.5, 3) * 90)
  return (
    <motion.div className={`reel-card reel-card--${index}`} style={{ y, scale }}>
      <span className="reel-card__number">0{index + 1}</span>
      <strong>{label}</strong>
      {index === 0 && (
        <div className="reel-wireframe">
          <span />
          <motion.span style={{ scaleX: line }} />
          <span />
          <span />
        </div>
      )}
      {index === 1 && (
        <div className="reel-modules">
          <span />
          <motion.span style={{ scaleY: line }} />
          <span />
        </div>
      )}
      {index === 2 && (
        <motion.div className="reel-orbit" style={{ rotate }}>
          <span />
          <span />
          <span />
          <span />
        </motion.div>
      )}
      {index === 3 && (
        <div className="reel-upgrade">
          <span />
          <motion.span style={{ scaleX: line }} />
          <span />
        </div>
      )}
    </motion.div>
  )
}

function Capabilities({ time, content }: SequenceProps) {
  const scale = useTransform(time, [12, 13, 16, 16.5], [0.92, 1, 1, 1.08])
  return (
    <Scene time={time} start={12} end={16.5} className="reel-capabilities">
      <motion.div className="reel-bento" style={{ scale }}>
        {content.showreel.services.map((label, index) => (
          <Capability key={label} time={time} index={index} label={label} />
        ))}
      </motion.div>
    </Scene>
  )
}

function Letter({
  time,
  index,
  letter,
}: {
  time: MotionValue<number>
  index: number
  letter: string
}) {
  const position = useTransform(time, (t) => 1 - easeOut(progress(t, 16.5 + index * 0.055, 0.85)))
  const y = useTransform(position, (p) => `${p * (index % 2 ? -170 : 170)}%`)
  const rotate = useTransform(position, (p) => p * (index % 2 ? 25 : -25))
  return <motion.span style={{ y, rotate }}>{letter}</motion.span>
}

function Finale({ time, content }: SequenceProps) {
  const scaleX = useTransform(time, (t) => easeOut(progress(t, 17.4, 1)))
  const opacity = useTransform(time, (t) => progress(t, 18, 0.6))
  const y = useTransform(time, (t) => (1 - easeOut(progress(t, 18, 0.6))) * 12)
  return (
    <Scene time={time} start={16.5} end={duration} className="reel-finale">
      <div className="reel-finale__brand">
        {Array.from(content.brand).map((letter, index) => (
          <Letter key={index} time={time} index={index} letter={letter} />
        ))}
      </div>
      <motion.span className="reel-finale__line" style={{ scaleX }} />
      <motion.p style={{ opacity, y }}>{content.showreel.closing}</motion.p>
    </Scene>
  )
}
