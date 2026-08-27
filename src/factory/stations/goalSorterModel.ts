export type GoalLane = 0 | 1 | 2

export function getGoalLane(sequence: number): GoalLane {
  return (sequence % 3) as GoalLane
}

export function getGoalLaneExit(lane: GoalLane, bounds: { left: number; width: number; bottom: number }) {
  void lane
  return { x: bounds.left + (bounds.width / 2), y: bounds.bottom }
}

export function getGoalRoutingVelocity(sequence: number, incoming: { x: number; y: number }) {
  const lane = getGoalLane(sequence)
  const direction = lane - 1
  const lateralSpeed = 4.5
  return {
    x: direction * lateralSpeed,
    y: Math.max(incoming.y, 4),
  }
}

export function getGoalMergeVelocity(lane: GoalLane, incoming: { x: number; y: number }) {
  const direction = lane === 0 ? 1 : lane === 2 ? -1 : 0
  return {
    x: direction * 5.5,
    y: Math.max(incoming.y, 4),
  }
}
