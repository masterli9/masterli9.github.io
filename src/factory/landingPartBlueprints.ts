import type { FactoryPartSpec } from './factoryTypes'

type LandingPartBlueprint = Readonly<Pick<FactoryPartSpec, 'role' | 'shape' | 'assemblySlot'> & {
  finish: Readonly<FactoryPartSpec['finish']>
}>

export const LANDING_PART_BLUEPRINTS: readonly LandingPartBlueprint[] = [
  { role: 'brand', shape: 'brand-mark', assemblySlot: 'brand', finish: { fill: '#FFFFFF', stroke: '#FFFFFF', detailColor: '#355CFF' } },
  { role: 'heading', shape: 'headline', assemblySlot: 'heading', finish: { fill: '#FFFFFF', textColor: '#090909', text: 'NOVA' } },
  { role: 'copy', shape: 'copy-line', assemblySlot: 'copy', finish: { fill: '#090909', stroke: '#FFFFFF', textColor: '#FFFFFF', text: 'Ideas in motion.' } },
  { role: 'cta', shape: 'cta-button', assemblySlot: 'cta', finish: { fill: '#C7FF43', stroke: '#C7FF43', textColor: '#090909', text: 'Explore' } },
  { role: 'visual', shape: 'visual-card', assemblySlot: 'visual', finish: { fill: '#355CFF', stroke: '#FFFFFF', detailColor: '#F21868' } },
  { role: 'heading', shape: 'badge', assemblySlot: 'heading', finish: { fill: '#F21868', stroke: '#F21868', textColor: '#090909', text: 'IDEA' } },
  { role: 'copy', shape: 'divider', assemblySlot: 'copy', finish: { fill: '#FFFFFF', stroke: '#FFFFFF' } },
  { role: 'visual', shape: 'avatar', assemblySlot: 'visual', finish: { fill: '#090909', stroke: '#FFFFFF', detailColor: '#355CFF' } },
]

export function getLandingPartBlueprint(sequence: number): LandingPartBlueprint {
  const count = LANDING_PART_BLUEPRINTS.length
  return LANDING_PART_BLUEPRINTS[((sequence % count) + count) % count]
}
