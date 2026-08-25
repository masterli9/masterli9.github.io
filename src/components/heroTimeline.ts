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

export function createHeroConveyorIntroSchedule(
  timeline: Pick<HeroTimeline, 'buildItemRevealAt' | 'revealDuration'>,
): HeroConveyorIntroEvent[] {
  const textCompleteAt = timeline.buildItemRevealAt + timeline.revealDuration
  const event = (offset: number, stage: HeroConveyorIntroStage) => ({
    at: roundTime(textCompleteAt + offset),
    stage,
  })

  return [
    event(0, 'box-flash-on'),
    event(0.05, 'box-flash-off'),
    event(0.12, 'box-visible'),
    event(0.57, 'machine-flash-on'),
    event(0.62, 'machine-flash-off'),
    event(0.69, 'machine-visible'),
    event(1.14, 'running'),
  ]
}

export function createHeroTimeline({ name, subtitle, buildPrefix }: HeroTimelineInput): HeroTimeline {
  const nameWords = splitWords(name)
  const subtitleWords = splitWords(subtitle)
  const buildPrefixWords = splitWords(buildPrefix)

  return {
    name: nameWords.map((word, index) => ({
      word,
      revealAt: roundTime(0.45 + index * 0.23),
      accent: '#FFFFFF',
    })),
    subtitle: subtitleWords.map((word, index) => {
      if (index === 0) return { word, revealAt: 0.91, accent: '#355CFF', fadeAt: 1.34 }
      if (index === 1) return { word, revealAt: 1.38, accent: '#FFFFFF' }
      if (index === 2) return { word, revealAt: 1.61, accent: '#F21868', fadeAt: 2.04 }

      return {
        word,
        revealAt: roundTime(1.81 + (index - 2) * 0.18),
        accent: '#FFFFFF',
      }
    }),
    buildPrefix: buildPrefixWords.map((word, index) => ({
      word,
      revealAt: roundTime(2.11 + index * 0.16),
      accent: '#FFFFFF',
    })),
    buildItemRevealAt: 2.43,
    rotationStartAt: 5.65,
    revealDuration: 0.42,
    colorFadeDuration: 0.2,
  }
}
