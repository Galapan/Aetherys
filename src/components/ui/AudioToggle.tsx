import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { animate, m, useMotionValue, useTransform } from 'framer-motion'
import type { HeroContent } from '@/content/hero'

// Drop the owner's file at public/audio/aetherys.mp3 (see docs/AGENTS notes).
// Kept as a runtime path instead of an import so the build does not depend on the asset.
export const audioSrc = '/media/audio/aetherys.mp3'

// One full sine wavelength that travels left while playing and flattens to a line when stopped.
const WAVE_WIDTH = 24
const WAVE_HEIGHT = 18
const WAVE_AMPLITUDE = 4
const WAVE_SAMPLES = 32
const WAVE_PERIOD = 2
const WAVE_SETTLE = { duration: 0.45, ease: [0.33, 1, 0.68, 1] } as const

function wavePath(amplitude: number, phase: number) {
  const mid = WAVE_HEIGHT / 2
  let d = ''
  for (let i = 0; i <= WAVE_SAMPLES; i++) {
    const x = (i / WAVE_SAMPLES) * WAVE_WIDTH
    const y = mid - amplitude * Math.sin((i / WAVE_SAMPLES) * Math.PI * 2 + phase)
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

function AudioWave({ playing, reducedMotion }: { playing: boolean; reducedMotion: boolean }) {
  const amplitude = useMotionValue(playing ? WAVE_AMPLITUDE : 0)
  const phase = useMotionValue(0)
  const d = useTransform(() => wavePath(amplitude.get(), phase.get()))

  useEffect(() => {
    const target = playing ? WAVE_AMPLITUDE : 0
    if (reducedMotion) {
      amplitude.set(target)
      return
    }
    // Keep the wave travelling while it flattens, then stop the loop once it is a line.
    const travel =
      playing || amplitude.get() > 0
        ? animate(phase, phase.get() + Math.PI * 2, {
            duration: WAVE_PERIOD,
            ease: 'linear',
            repeat: Infinity,
          })
        : null
    const settle = animate(amplitude, target, {
      ...WAVE_SETTLE,
      onComplete: () => {
        if (!playing) travel?.stop()
      },
    })
    return () => {
      settle.stop()
      travel?.stop()
    }
  }, [playing, reducedMotion, amplitude, phase])

  return (
    <svg
      className="block overflow-visible"
      width={WAVE_WIDTH}
      height={WAVE_HEIGHT}
      viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}
      fill="none"
      aria-hidden="true"
    >
      <m.path
        d={d}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
  audioRef?: RefObject<HTMLAudioElement | null>
}

export function AudioToggle({ content, reducedMotion, audioRef }: AudioToggleProps) {
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

  return (
    <>
      <button
        className="pointer-events-auto grid size-11 place-items-center rounded border-0 bg-transparent p-0 text-inherit"
        type="button"
        aria-label={playing ? content.stopMusic : content.playMusic}
        aria-pressed={playing}
        onClick={toggle}
      >
        <AudioWave playing={playing} reducedMotion={reducedMotion} />
      </button>
      {!audioRef && <audio className="hidden" src={audioSrc} ref={localAudio} preload="metadata" />}
    </>
  )
}
