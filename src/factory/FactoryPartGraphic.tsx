import type { FactoryPartSnapshot, FactoryPartSpec } from './factoryTypes'

export function FactoryPartGraphic({ part }: { part: FactoryPartSnapshot | FactoryPartSpec }) {
  const graphic = part.shape === 'circle' || part.shape === 'radio'
    ? <circle r={part.shape === 'radio' ? 9 : 11} fill={part.color} />
    : part.shape === 'bar' || part.shape === 'button'
      ? <rect
          x={part.shape === 'button' ? -18 : -15}
          y={part.shape === 'button' ? -8 : -6.5}
          width={part.shape === 'button' ? 36 : 30}
          height={part.shape === 'button' ? 16 : 13}
          rx={part.shape === 'button' ? 8 : 0}
          fill={part.color}
        />
      : part.shape === 'toggle'
        ? <rect x={-20} y={-10} width={40} height={20} rx={10} fill={part.color} />
        : part.shape === 'cursor'
          ? <path d="M-10-14 12 5 2 7 7 17 1 20-4 10-11 16Z" fill={part.color} />
          : part.shape === 'diamond'
            ? <rect x={-11} y={-11} width={22} height={22} fill={part.color} />
            : <rect x={-11} y={-11} width={22} height={22} fill={part.color} />

  const scaledGraphic = (part.scaleX ?? 1) === 1 && (part.scaleY ?? 1) === 1
    ? graphic
    : <g transform={`scale(${part.scaleX ?? 1} ${part.scaleY ?? 1})`}>{graphic}</g>

  if ('x' in part) {
    return (
      <g
        className={'fading' in part && part.fading ? 'factory-part--fading' : undefined}
        data-factory-part={part.id}
        data-factory-stage={part.stage}
        data-factory-shape={part.shape}
        data-factory-color={part.color}
        transform={`translate(${part.x.toFixed(2)} ${part.y.toFixed(2)}) rotate(${(part.angle * 180 / Math.PI).toFixed(2)})`}
      >
        {scaledGraphic}
      </g>
    )
  }

  return <g>{scaledGraphic}</g>
}
