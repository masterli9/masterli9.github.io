export type GoalLane = 0 | 1 | 2

export function getGoalLane(sequence: number): GoalLane {
  return (sequence % 3) as GoalLane
}

export function getGoalLaneExit(lane: GoalLane, bounds: { left: number; width: number; bottom: number }) {
  void lane
  return { x: bounds.left + (bounds.width / 2), y: bounds.bottom }
}
