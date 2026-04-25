import { useState, useEffect } from 'react'
import { formatLongDate } from '../lib/utils'

export function useClock() {
  const [time, setTime] = useState(formatLongDate(new Date()))
  useEffect(() => {
    const id = setInterval(() => setTime(formatLongDate(new Date())), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}
