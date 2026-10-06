interface Clock {
  now: () => number
  schedule: (callback: () => void, delay: number) => number
  cancel: (id: number) => void
}

export function createPausableTimers(clock: Clock, initiallyPaused = false) {
  let paused = initiallyPaused
  let sequence = 0
  const tasks = new Map<number, { callback: () => void; remaining: number; deadline: number; handle?: number }>()
  const arm = (id: number) => {
    const task = tasks.get(id)!
    task.deadline = clock.now() + task.remaining
    task.handle = clock.schedule(() => {
      if (!tasks.has(id) || paused) return
      tasks.delete(id)
      task.callback()
    }, task.remaining)
  }
  return {
    get size() { return tasks.size },
    schedule(callback: () => void, delay: number) {
      const id = ++sequence
      tasks.set(id, { callback, remaining: delay, deadline: 0 })
      if (!paused) arm(id)
      return id
    },
    pause() {
      if (paused) return
      paused = true
      for (const task of tasks.values()) {
        if (task.handle !== undefined) clock.cancel(task.handle)
        task.remaining = Math.max(0, task.deadline - clock.now())
        task.handle = undefined
      }
    },
    resume() {
      if (!paused) return
      paused = false
      for (const id of tasks.keys()) arm(id)
    },
    clear() {
      for (const task of tasks.values()) if (task.handle !== undefined) clock.cancel(task.handle)
      tasks.clear()
    },
  }
}
