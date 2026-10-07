import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { m } from 'framer-motion'
import type { HeroContent } from '../../content/hero'

// Drop the owner's file at public/audio/aetherys.mp3 (see docs/AGENTS notes).
// Kept as a runtime path instead of an import so the build does not depend on the asset.
export const audioSrc = '/audio/aetherys.mp3'

const BAR_HEIGHTS = [7, 13, 18, 10]
const BAR_DURATIONS = [1.4, 1.7, 1.25, 1.55]
const BAR_MIN_SCALE = 0.3
const BAR_STAGGER = 0.17

class AudioSnapshotStore {
  private audio: RefObject<HTMLAudioElement | null>

  constructor(audio: RefObject<HTMLAudioElement | null>) {
    this.audio = audio
  }

  subscribe = (onChange: () => void) => {
    const element = this.audio.current
    if (!element) return () => {}
    const onEnded = () => {
      element.currentTime = 0
      onChange()
    }
    element.addEventListener('play', onChange)
    element.addEventListener('pause', onChange)
    element.addEventListener('ended', onEnded)
    element.addEventListener('loadeddata', onChange)
    element.addEventListener('error', onChange)
    return () => {
      element.removeEventListener('play', onChange)
      element.removeEventListener('pause', onChange)
      element.removeEventListener('ended', onEnded)
      element.removeEventListener('loadeddata', onChange)
      element.removeEventListener('error', onChange)
    }
  }

  getPlaying = () => Boolean(this.audio.current && !this.audio.current.paused)

  getAvailable = () => {
    const element = this.audio.current
    if (!element) return null
    if (element.error) return false
    return element.readyState >= 2 ? true : null
  }
}

interface AudioToggleProps {
  content: HeroContent
  reducedMotion: boolean
  canHover?: boolean
  audioRef?: RefObject<HTMLAudioElement | null>
}

export function AudioToggle({ content, reducedMotion, canHover, audioRef }: AudioToggleProps) {
  const localAudio = useRef<HTMLAudioElement>(null)
  const audio = audioRef ?? localAudio
  const [store] = useState(() => new AudioSnapshotStore(audio))
  const playing = useSyncExternalStore(store.subscribe, store.getPlaying, store.getPlaying)
  const available = useSyncExternalStore(store.subscribe, store.getAvailable, store.getAvailable)

  useEffect(() => {
    const element = audio.current
    return () => {
      if (!audioRef) element?.pause()
    }
  }, [audio, audioRef])

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
      <m.button
        className="pointer-events-auto grid size-11 place-items-center rounded border-0 bg-transparent p-0 text-inherit"
        type="button"
        aria-label={playing ? content.stopMusic : content.playMusic}
        aria-pressed={playing}
        onClick={toggle}
        whileHover={canHover ? { y: -2 } : undefined}
        transition={{ duration: 0.18 }}
      >
        <span className="flex h-[18px] items-center gap-[3px]" aria-hidden="true">
          {BAR_HEIGHTS.map((height, index) => (
            <m.span
              className="block w-[2px] origin-center rounded-[1px] bg-current"
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
      </m.button>
      {!audioRef && <audio className="hidden" src={audioSrc} ref={localAudio} preload="metadata" />}
    </>
  )
}
