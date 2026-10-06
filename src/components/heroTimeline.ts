export interface HeroTimelineInput {
  name: string
  subtitle: string
  buildPrefix: string
}

export interface HeroTimelineWord {
  word: string
  revealAt: number
  accent: string
  fadeAt?: number
}

export interface HeroTimeline {
  name: HeroTimelineWord[]
  subtitle: HeroTimelineWord[]
  buildPrefix: HeroTimelineWord[]
  buildItemRevealAt: number
  rotationStartAt: number
  revealDuration: number
  colorFadeDuration: number
}

export type BuildWordPhase = 'visible' | 'exiting' | 'entering'

export type HeroConveyorIntroStage =
  | 'hidden'
  | 'box-flash-on'
  | 'box-flash-off'
  | 'box-visible'
  | 'machine-flash-on'
  | 'machine-flash-off'
  | 'machine-visible'
  | 'running'

export interface HeroConveyorIntroEvent {
  at: number
  stage: HeroConveyorIntroStage
}

export type HeroWordGroup = 'name' | 'subtitle' | 'build-prefix'

export interface HeroWordSlot extends HeroTimelineWord {
  key: string
}

export function getHeroWordKey(group: HeroWordGroup, index: number) {
  return `${group}-${index}`
}

export function getHeroWordSlots(
  words: HeroTimelineWord[],
  group: HeroWordGroup,
  minimumSlots = words.length,
): HeroWordSlot[] {
  const slotCount = Math.max(words.length, minimumSlots)
  const fallbackRevealAt = words.at(-1)?.revealAt ?? 0

  return Array.from({ length: slotCount }, (_, index) => ({
    ...(words[index] ?? { word: '', revealAt: fallbackRevealAt, accent: '#FFFFFF' }),
    key: getHeroWordKey(group, index),
  }))
}

export function getBuildWordMotionState(phase: BuildWordPhase) {
  if (phase === 'exiting') return { opacity: 0, y: 20 }
  if (phase === 'entering') return { opacity: 0, y: -20 }
  return { opacity: 1, y: 0 }
}

const splitWords = (text: string) => text.trim().split(/\s+/).filter(Boolean)
const roundTime = (time: number) => Number(time.toFixed(2))
export const HERO_CYCLE_INTERVAL_MS = 3500
export function getNextHeroCycleStep(completed: number, count: number) {
  if (count < 2 || completed >= count) return null
  return { index: (completed + 1) % count, completed: completed + 1 }
}

export function createHeroConveyorIntroSchedule(
  timeline: Pick<HeroTimeline, 'name'>,
): HeroConveyorIntroEvent[] {
  const firstWordRevealAt = timeline.name[0]?.revealAt ?? 0
  const event = (offset: number, stage: HeroConveyorIntroStage) => ({
    at: roundTime(firstWordRevealAt + offset),
    stage,
  })

  return [
    event(0.1, 'box-flash-on'),
    event(0.15, 'box-flash-off'),
    event(0.22, 'box-visible'),
    event(0.67, 'machine-flash-on'),
    event(0.72, 'machine-flash-off'),
    event(0.79, 'machine-visible'),
    event(1.24, 'running'),
  ]
}

export function createHeroTimeline({ name, subtitle, buildPrefix }: HeroTimelineInput): HeroTimeline {
  const nameWords = splitWords(name)
  const subtitleWords = splitWords(subtitle)
  const buildPrefixWords = splitWords(buildPrefix)

  return {
    name: nameWords.map((word, index) => ({
      word,
      revealAt: roundTime(0.18 + index * 0.14),
      accent: '#FFFFFF',
    })),
    subtitle: subtitleWords.map((word, index) => {
      if (index === 0) return { word, revealAt: 0.48, accent: '#355CFF', fadeAt: 0.78 }
      if (index === 1) return { word, revealAt: 0.68, accent: '#FFFFFF' }
      if (index === 2) return { word, revealAt: 0.84, accent: '#F21868', fadeAt: 1.14 }

      return {
        word,
        revealAt: roundTime(1.02 + (index - 2) * 0.12),
        accent: '#FFFFFF',
      }
    }),
    buildPrefix: buildPrefixWords.map((word, index) => ({
      word,
      revealAt: roundTime(1.3 + index * 0.1),
      accent: '#FFFFFF',
    })),
    buildItemRevealAt: 1.48,
    rotationStartAt: 3.6,
    revealDuration: 0.3,
    colorFadeDuration: 0.16,
  }
}
