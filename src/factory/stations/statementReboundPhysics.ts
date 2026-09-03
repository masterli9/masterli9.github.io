import Matter, { type Body as MatterBody } from 'matter-js'

const { Body, Bodies, Vertices } = Matter

interface StatementSpoonGeometry {
  center: { x: number; y: number }
  points: Array<{ x: number; y: number }>
  friction: number
  frictionStatic: number
  frictionAir: number
  restitution: number
  colliderThickness: number
}

interface StatementSpoonMapping {
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
}

interface StatementSegmentMaterial {
  friction?: number
  frictionStatic?: number
  restitution?: number
}

interface StatementStationGeometry {
  platform: {
    x1: number
    y1: number
    x2: number
    y2: number
    thickness: number
    friction: number
    frictionStatic: number
    restitution: number
  }
  catcher: {
    x: number
    y: number
    width: number
    height: number
  }
  spoon: StatementSpoonGeometry
  outputEndY: number
  includeExitRoute: boolean
}

function createSegmentCollider(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number,
  label: string,
  mapping: StatementSpoonMapping,
  material: StatementSegmentMaterial = {},
) {
  const start = {
    x: mapping.offsetX + (x1 * mapping.scaleX),
    y: mapping.offsetY + (y1 * mapping.scaleY),
  }
  const end = {
    x: mapping.offsetX + (x2 * mapping.scaleX),
    y: mapping.offsetY + (y2 * mapping.scaleY),
  }
  const length = Math.hypot(end.x - start.x, end.y - start.y)
  const body = Bodies.rectangle(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    length,
    thickness * Math.min(mapping.scaleX, mapping.scaleY),
    {
      isStatic: true,
      friction: material.friction ?? 0.08,
      frictionStatic: material.frictionStatic ?? 0.5,
      restitution: material.restitution ?? 0.68,
      label,
    },
  )
  Body.setAngle(body, Math.atan2(end.y - start.y, end.x - start.x))
  return body
}

export function createStatementSpoonColliders(
  spoon: StatementSpoonGeometry,
  mapping: StatementSpoonMapping,
): MatterBody[] {
  const sampledPoints = spoon.points.filter((_, index) => (
    index % 6 === 0 || index === spoon.points.length - 1
  )).map((point) => ({
    x: mapping.offsetX + (point.x * mapping.scaleX),
    y: mapping.offsetY + (point.y * mapping.scaleY),
  }))
  const mappedCenter = {
    x: mapping.offsetX + (spoon.center.x * mapping.scaleX),
    y: mapping.offsetY + (spoon.center.y * mapping.scaleY),
  }
  const colliderThickness = spoon.colliderThickness * Math.min(mapping.scaleX, mapping.scaleY)
  const edges = sampledPoints.map((point) => {
    const radialLength = Math.hypot(point.x - mappedCenter.x, point.y - mappedCenter.y)
    const normal = {
      x: (point.x - mappedCenter.x) / radialLength,
      y: (point.y - mappedCenter.y) / radialLength,
    }
    return {
      path: point,
      outer: {
        x: point.x + (normal.x * colliderThickness),
        y: point.y + (normal.y * colliderThickness),
      },
    }
  })
  const parts = edges.slice(1).map((edge, index) => {
    const vertices = [edges[index].outer, edge.outer, edge.path, edges[index].path]
    return Body.create({
      position: Vertices.centre(vertices),
      vertices,
      friction: spoon.friction,
      frictionStatic: spoon.frictionStatic,
      restitution: spoon.restitution,
      label: 'statement-exit-spoon-strip',
    })
  })
  const spoonBody = Body.create({
    parts,
    isStatic: true,
    friction: spoon.friction,
    frictionStatic: spoon.frictionStatic,
    restitution: spoon.restitution,
    label: 'statement-exit-spoon-strip',
  })
  return [spoonBody]
}

function createStatementSpoonMaterialSensor(
  station: StatementStationGeometry,
  mapping: StatementSpoonMapping,
) {
  const left = station.platform.x2 + 3
  const right = Math.max(left + 4, station.spoon.points[0].x - 3)
  const top = Math.min(station.platform.y2, station.spoon.points[0].y) - 42
  const bottom = Math.max(station.platform.y2, station.spoon.points[0].y) + 42
  return Bodies.rectangle(
    mapping.offsetX + (((left + right) / 2) * mapping.scaleX),
    mapping.offsetY + (((top + bottom) / 2) * mapping.scaleY),
    (right - left) * mapping.scaleX,
    (bottom - top) * mapping.scaleY,
    {
      isStatic: true,
      isSensor: true,
      label: 'statement-spoon-material-sensor',
    },
  )
}

export function createStatementStationColliders(
  station: StatementStationGeometry,
  mapping: StatementSpoonMapping,
): MatterBody[] {
  const platform = createSegmentCollider(
    station.platform.x1,
    station.platform.y1,
    station.platform.x2,
    station.platform.y2,
    station.platform.thickness,
    'statement-rebound-platform',
    mapping,
    {
      friction: station.platform.friction,
      frictionStatic: station.platform.frictionStatic,
      restitution: station.platform.restitution,
    },
  )
  if (!station.includeExitRoute) return [platform]
  return [
    platform,
    createStatementSpoonMaterialSensor(station, mapping),
    ...createStatementSpoonColliders(station.spoon, mapping),
  ]
}

export function applyStatementSpoonMaterial(
  part: MatterBody,
  spoon: Pick<StatementSpoonGeometry, 'friction' | 'frictionStatic' | 'frictionAir' | 'restitution'>,
) {
  part.friction = spoon.friction
  part.frictionStatic = spoon.frictionStatic
  part.frictionAir = spoon.frictionAir
  part.restitution = spoon.restitution
  part.plugin.statementPlatformMaterial = false
}

export function applyStatementPlatformMaterial(
  part: MatterBody,
  platform: Pick<StatementStationGeometry['platform'], 'friction' | 'frictionStatic' | 'restitution'>,
) {
  part.friction = platform.friction
  part.frictionStatic = platform.frictionStatic
  part.plugin.statementPlatformMaterial = true
}

export function propagateStatementPlatformMaterial(
  bodyA: MatterBody,
  bodyB: MatterBody,
  platform: Pick<StatementStationGeometry['platform'], 'friction' | 'frictionStatic' | 'restitution'>,
) {
  if (!bodyA.label.startsWith('factory-part-') || !bodyB.label.startsWith('factory-part-')) return false
  if (!bodyA.plugin.statementPlatformMaterial && !bodyB.plugin.statementPlatformMaterial) return false
  applyStatementPlatformMaterial(bodyA, platform)
  applyStatementPlatformMaterial(bodyB, platform)
  return true
}
