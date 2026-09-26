import { useEffect, useState } from 'react'

type LocalTime = {
  display: string
  machine: string
}

function readTime(): LocalTime {
  const now = new Date()
  const hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return {
    display: `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`,
    machine: `${String(hours).padStart(2, '0')}:${minutes}`,
  }
}

export function useLocalTime() {
  const [time, setTime] = useState<LocalTime>(readTime)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime((previous) => {
        const next = readTime()
        return next.display === previous.display ? previous : next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  return time
}
