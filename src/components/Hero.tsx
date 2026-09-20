import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import HeroConveyor from './HeroConveyor'
import {
  createHeroTimeline,
  createHeroConveyorIntroSchedule,
  getBuildWordMotionState,
  getHeroWordSlots,
  type BuildWordPhase,
  type HeroConveyorIntroStage,
  type HeroTimelineWord,
  type HeroWordGroup,
} from './heroTimeline'
import { useLanguage } from '../i18n/useLanguage'

const revealEase = [0.16, 1, 0.3, 1] as const

export default function Hero() {
  const { t } = useLanguage()
  const reducedMotion = useReducedMotion() ?? false
  const heroRef = useRef<HTMLElement>(null)
  const isHeroInView = useInView(heroRef, { amount: 0.1 })
  const [activeBuildIndex, setActiveBuildIndex] = useState(0)
  const [buildWordPhase, setBuildWordPhase] = useState<BuildWordPhase>('visible')
  const [conveyorIntroStage, setConveyorIntroStage] = useState<HeroConveyorIntroStage>('hidden')
  const buildItems = t.hero.buildItems
  const timeline = useMemo(() => createHeroTimeline({
    name: 'Andrej Zdvořák',
    subtitle: t.hero.subtitle,
    buildPrefix: t.hero.buildPrefix,
  }), [t.hero.buildPrefix, t.hero.subtitle])
  const conveyorIntroSchedule = useMemo(
    () => createHeroConveyorIntroSchedule(timeline),
    [timeline],
  )

  useEffect(() => {
    if (reducedMotion) return

    const timers = conveyorIntroSchedule.map(({ at, stage }) => (
      window.setTimeout(() => setConveyorIntroStage(stage), at * 1000)
    ))

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [conveyorIntroSchedule, reducedMotion])

  useEffect(() => {
    if (reducedMotion || !isHeroInView || buildItems.length < 2) return

    let interval: number | undefined
    const transitionTimers: number[] = []
    const transitionFrames: number[] = []

    const rotateBuildWord = () => {
      setBuildWordPhase('exiting')
      const swapTimer = window.setTimeout(() => {
        setActiveBuildIndex((currentIndex) => (currentIndex + 1) % buildItems.length)
        setBuildWordPhase('entering')
        const frame = window.requestAnimationFrame(() => setBuildWordPhase('visible'))
        transitionFrames.push(frame)
      }, 180)
      transitionTimers.push(swapTimer)
    }

    const rotationTimer = window.setTimeout(() => {
      rotateBuildWord()
      interval = window.setInterval(rotateBuildWord, 1500)
    }, timeline.rotationStartAt * 1000)

    return () => {
      window.clearTimeout(rotationTimer)
      if (interval !== undefined) window.clearInterval(interval)
      transitionTimers.forEach((timer) => window.clearTimeout(timer))
      transitionFrames.forEach((frame) => window.cancelAnimationFrame(frame))
    }
  }, [buildItems.length, isHeroInView, reducedMotion, timeline.rotationStartAt])

  const renderTimedWords = (
    words: HeroTimelineWord[],
    group: HeroWordGroup,
    minimumSlots = words.length,
  ) => {
    const slots = getHeroWordSlots(words, group, minimumSlots)

    return slots.map((item, index) => (
      <Fragment key={item.key}>
        {index > 0 && item.word && slots[index - 1]?.word ? ' ' : null}
        <motion.span
          className="inline-block"
          initial={reducedMotion ? false : { opacity: 0, y: 14, color: item.accent }}
          animate={{ opacity: 1, y: 0, color: '#FFFFFF' }}
          transition={reducedMotion
            ? { duration: 0 }
            : {
                opacity: { delay: item.revealAt, duration: timeline.revealDuration, ease: revealEase },
                y: { delay: item.revealAt, duration: timeline.revealDuration, ease: revealEase },
                color: {
                  delay: item.fadeAt ?? 0,
                  duration: item.fadeAt ? timeline.colorFadeDuration : 0,
                  ease: revealEase,
                },
              }}
        >
          {item.word}
        </motion.span>
      </Fragment>
    ))
  }

  const activeBuildItem = buildItems[activeBuildIndex] ?? buildItems[0]

  return (
    <section ref={heroRef} id="hero" className="foundry-page factory-hero-layer flex items-center py-24 md:min-h-[min(52rem,100dvh)] md:py-36">
      <div className="foundry-container grid items-center gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] md:gap-8">
        <div className="max-w-2xl md:col-start-1">
          <h1 className="whitespace-nowrap font-heading text-[clamp(3rem,7vw,6.25rem)] font-normal leading-none tracking-[-0.065em] text-soft-white">
            {renderTimedWords(timeline.name, 'name')}
          </h1>

          <p className="mt-3 text-2xl font-normal leading-tight text-soft-white md:text-3xl">
            {renderTimedWords(timeline.subtitle, 'subtitle')}
          </p>

          <p
            className="mt-3 flex flex-wrap items-baseline gap-x-2 text-2xl font-normal leading-tight text-soft-white md:text-3xl"
            aria-label={`${t.hero.buildPrefix} ${activeBuildItem}`}
          >
            <span aria-hidden="true">{renderTimedWords(timeline.buildPrefix, 'build-prefix', 2)}</span>
            <motion.span
              className="relative inline-flex h-[1.2em] min-w-[18ch] self-end items-end overflow-hidden"
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion
                ? { duration: 0 }
                : { delay: timeline.buildItemRevealAt, duration: timeline.revealDuration, ease: revealEase }}
              aria-hidden="true"
            >
              <motion.span
                animate={getBuildWordMotionState(buildWordPhase)}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: revealEase }}
                className="absolute inset-x-0 bottom-0 whitespace-nowrap"
              >
                {activeBuildItem}
              </motion.span>
            </motion.span>
            <span className="sr-only" aria-live="polite">{`${t.hero.buildPrefix} ${activeBuildItem}`}</span>
          </p>
        </div>

        <div className="flex items-center justify-center md:translate-x-6 md:translate-y-24 md:justify-end">
          <HeroConveyor introStage={reducedMotion ? 'running' : conveyorIntroStage} />
        </div>
      </div>
    </section>
  )
}
