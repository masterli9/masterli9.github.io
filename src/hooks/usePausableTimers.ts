import { useEffect, useState } from 'react'
import { createPausableTimers } from './pausableTimers'

export function usePausableTimers(paused: boolean) {
  const [timers] = useState(() => createPausableTimers({
    now: () => performance.now(),
    schedule: (callback, delay) => window.setTimeout(callback, delay),
    cancel: (id) => window.clearTimeout(id),
  }, paused))
  useEffect(() => { if (paused) timers.pause(); else timers.resume() }, [paused, timers])
  useEffect(() => () => timers.clear(), [timers])
  return timers
}
