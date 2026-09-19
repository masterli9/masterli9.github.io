import type { FactoryPartSnapshot, FactoryPartSpec } from './factoryTypes'
import { getFactoryPartDimensions } from './factoryPartPhysics'

export function FactoryPartGraphic({ part }: { part: FactoryPartSnapshot | FactoryPartSpec }) {
  const finished = part.stage === 'printed' || part.stage === 'inspected' || part.stage === 'assembled'
  const dimensions = getFactoryPartDimensions(part.shape)
  const fill = finished || part.coated ? part.finish.fill : 'none'
  const stroke = finished || part.coated ? part.finish.stroke ?? 'none' : '#FFFFFF'
  const radius = part.shape === 'cta-button' ? 11
    : part.shape === 'brand-mark' ? 4
      : part.shape === 'visual-card' ? 3
        : part.shape === 'headline' || part.shape === 'copy-line' ? 1 : 0
  const graphic = (
    <g>
      {'radius' in dimensions
        ? <circle r={dimensions.radius} fill={fill} stroke={stroke} />
        : <rect x={-dimensions.width / 2} y={-dimensions.height / 2} width={dimensions.width} height={dimensions.height} rx={radius} fill={fill} stroke={stroke} />}
      {finished && part.finish.detailColor && part.shape === 'brand-mark' && (
        <path d="M-7 6V-6L7 6V-6" fill="none" stroke={part.finish.detailColor} strokeWidth={3} />
      )}
      {finished && part.finish.detailColor && part.shape === 'visual-card' && (
        <path d="M-20 14-6-13 5 4 19-8 19 14Z" fill={part.finish.detailColor} />
      )}
      {finished && part.finish.text && (
        <text textAnchor="middle" dominantBaseline="central" fill={part.finish.textColor ?? '#090909'} fontSize={part.shape === 'copy-line' ? 6.5 : 10} fontFamily="Instrument Sans, sans-serif">
          {part.finish.text}
        </text>
      )}
    </g>
  )
  // Circles use the same uniform scale as their Matter body.
  const scaleX = part.shape === 'circle' ? Math.min(part.scaleX ?? 1, part.scaleY ?? 1) : part.scaleX ?? 1
  const scaleY = part.shape === 'circle' ? scaleX : part.scaleY ?? 1
  const scaledGraphic = <g transform={`scale(${scaleX} ${scaleY})`}>{graphic}</g>

  if ('x' in part) {
    return (
      <g
        className={'fading' in part && part.fading ? 'factory-part--fading' : undefined}
        data-factory-part={part.id}
        data-factory-stage={part.stage}
        data-factory-shape={part.shape}
        data-factory-role={part.role}
        transform={`translate(${part.x.toFixed(2)} ${part.y.toFixed(2)}) rotate(${(part.angle * 180 / Math.PI).toFixed(2)})`}
      >
        {scaledGraphic}
      </g>
    )
  }
  return <g>{scaledGraphic}</g>
}
