import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { HeroContent } from '../../content/hero'

// Drop the owner's file at public/audio/aetherys.mp3 (see docs/AGENTS notes).
// Kept as a runtime path instead of an import so the build does not depend on the asset.
export const audioSrc = '/audio/aetherys.mp3'

const BAR_HEIGHTS = [7, 13, 18, 10]
const BAR_DURATIONS = [1.4, 1.7, 1.25, 1.55]
const BAR_MIN_SCALE = 0.3
const BAR_STAGGER = 0.17

interface AudioToggleProps {
  content: HeroContent
  reducedMotion: boolean
  canHover?: boolean
}

export function AudioToggle({ content, reducedMotion, canHover }: AudioToggleProps) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    const element = audio.current
    if (!element) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      element.currentTime = 0
      setPlaying(false)
    }
    const onReady = () => setAvailable(true)
    const onError = () => setAvailable(false)
    element.addEventListener('play', onPlay)
    element.addEventListener('pause', onPause)
    element.addEventListener('ended', onEnded)
    element.addEventListener('loadeddata', onReady)
    element.addEventListener('error', onError)
    return () => {
      element.removeEventListener('play', onPlay)
      element.removeEventListener('pause', onPause)
      element.removeEventListener('ended', onEnded)
      element.removeEventListener('loadeddata', onReady)
      element.removeEventListener('error', onError)
      element.pause()
    }
  }, [])

  async function toggle() {
    const element = audio.current
    if (!element) return
    if (element.paused) {
      try {
        await element.play()
      } catch {
        // Blocked or interrupted playback: leave the bars still rather than desync the UI.
      }
    } else {
      element.pause()
    }
  }

  // Hide entirely when the file is missing so the header never shows a dead control.
  if (available === false) return null

  const animating = playing && !reducedMotion

  return (
    <>
      <motion.button
        className="audio-toggle"
        type="button"
        aria-label={playing ? content.stopMusic : content.playMusic}
        aria-pressed={playing}
        onClick={toggle}
        whileHover={canHover ? { y: -2 } : undefined}
        transition={{ duration: 0.18 }}
      >
        <span className="audio-toggle__wave" aria-hidden="true">
          {BAR_HEIGHTS.map((height, index) => (
            <motion.span
              className="audio-toggle__bar"
              key={index}
              style={{ height }}
              animate={animating ? { scaleY: [1, BAR_MIN_SCALE, 1] } : { scaleY: 1 }}
              transition={
                animating
                  ? {
                      duration: BAR_DURATIONS[index],
                      delay: index * BAR_STAGGER,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  : { duration: 0.2, ease: 'easeOut' }
              }
            />
          ))}
        </span>
      </motion.button>
      <audio src={audioSrc} ref={audio} preload="metadata" />
    </>
  )
}
