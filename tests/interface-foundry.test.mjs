import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
test('the hero timeline restores the measured cadence around its focal beats', async () => {
  const { createHeroTimeline } = await import('../src/components/heroTimeline.ts')
  const timeline = createHeroTimeline({
    name: 'Andrej Zdvořák',
    subtitle: 'Student & developer',
    buildPrefix: 'I build',
  })

  assert.deepEqual(timeline.name.map(({ word, revealAt }) => [word, revealAt]), [
    ['Andrej', 0.45],
    ['Zdvořák', 0.68],
  ])
  assert.deepEqual(timeline.subtitle, [
    { word: 'Student', revealAt: 0.91, accent: '#355CFF', fadeAt: 1.34 },
    { word: '&', revealAt: 1.38, accent: '#FFFFFF' },
    { word: 'developer', revealAt: 1.61, accent: '#F21868', fadeAt: 2.04 },
  ])
  assert.deepEqual(timeline.buildPrefix.map(({ word, revealAt }) => [word, revealAt]), [
    ['I', 2.11],
    ['build', 2.27],
  ])
  assert.equal(timeline.buildItemRevealAt, 2.43)
  assert.equal(timeline.rotationStartAt, 5.65)
})

test('the conveyor appears as box, stopped machine, then running machine after fixed pauses', async () => {
  const { createHeroConveyorIntroSchedule, createHeroTimeline } = await import('../src/components/heroTimeline.ts')
  const timeline = createHeroTimeline({
    name: 'Andrej Zdvořák',
    subtitle: 'Student & developer',
    buildPrefix: 'I build',
  })

  assert.deepEqual(createHeroConveyorIntroSchedule(timeline), [
    { at: 2.85, stage: 'box-flash-on' },
    { at: 2.9, stage: 'box-flash-off' },
    { at: 2.97, stage: 'box-visible' },
    { at: 3.42, stage: 'machine-flash-on' },
    { at: 3.47, stage: 'machine-flash-off' },
    { at: 3.54, stage: 'machine-visible' },
    { at: 3.99, stage: 'running' },
  ])
})

test('translated hero words keep stable identities and skip the intro after mount', async () => {
  const { createHeroTimeline, getHeroWordSlots } = await import('../src/components/heroTimeline.ts')
  const czechTimeline = createHeroTimeline({
    name: 'Andrej Zdvořák',
    subtitle: 'Student a vývojář',
    buildPrefix: 'Stavím',
  })
  const englishTimeline = createHeroTimeline({
    name: 'Andrej Zdvořák',
    subtitle: 'Student & developer',
    buildPrefix: 'I build',
  })
  const czechSlots = getHeroWordSlots(czechTimeline.buildPrefix, 'build-prefix', 2)
  const englishSlots = getHeroWordSlots(englishTimeline.buildPrefix, 'build-prefix', 2)

  assert.deepEqual(czechSlots.map(({ key }) => key), ['build-prefix-0', 'build-prefix-1'])
  assert.deepEqual(englishSlots.map(({ key }) => key), ['build-prefix-0', 'build-prefix-1'])
  assert.deepEqual(czechSlots.map(({ word }) => word), ['Stavím', ''])
  assert.deepEqual(englishSlots.map(({ word }) => word), ['I', 'build'])
})

test('the rotating build word exits down and enters from above', async () => {
  const { getBuildWordMotionState } = await import('../src/components/heroTimeline.ts')

  assert.deepEqual(getBuildWordMotionState('visible'), { opacity: 1, y: 0 })
  assert.deepEqual(getBuildWordMotionState('exiting'), { opacity: 0, y: 20 })
  assert.deepEqual(getBuildWordMotionState('entering'), { opacity: 0, y: -20 })
})

test('the hero conveyor stops feeding parts when its collection box is full or inactive', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts').catch(() => ({}))

  assert.equal(
    typeof conveyor.canSpawnConveyorPart,
    'function',
    'the conveyor model should expose its spawn guard',
  )
  assert.equal(conveyor.canSpawnConveyorPart({ activeCount: 6, maxParts: 7, isActive: true, reducedMotion: false }), true)
  assert.equal(conveyor.canSpawnConveyorPart({ activeCount: 7, maxParts: 7, isActive: true, reducedMotion: false }), false)
  assert.equal(conveyor.canSpawnConveyorPart({ activeCount: 2, maxParts: 7, isActive: false, reducedMotion: false }), false)
  assert.equal(conveyor.canSpawnConveyorPart({ activeCount: 2, maxParts: 7, isActive: true, reducedMotion: true }), false)
})

test('the conveyor guarantees a starter payload without exceeding its total capacity', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts').catch(() => ({}))

  assert.equal(
    typeof conveyor.getConveyorPayloadDeficit,
    'function',
    'the conveyor model should expose its minimum-payload contract',
  )
  assert.equal(conveyor.getConveyorPayloadDeficit({ activeCount: 0, minimumPayload: 4, maxParts: 30 }), 4)
  assert.equal(conveyor.getConveyorPayloadDeficit({ activeCount: 3, minimumPayload: 4, maxParts: 30 }), 1)
  assert.equal(conveyor.getConveyorPayloadDeficit({ activeCount: 8, minimumPayload: 4, maxParts: 30 }), 0)
  assert.equal(conveyor.getConveyorPayloadDeficit({ activeCount: 28, minimumPayload: 40, maxParts: 30 }), 2)
})

test('the conveyor clamps slow frames to a stable Matter.js physics step', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts')

  assert.equal(typeof conveyor.clampPhysicsDelta, 'function')
  assert.equal(conveyor.clampPhysicsDelta(8), 8)
  assert.equal(conveyor.clampPhysicsDelta(40), 1000 / 60)
})

test('the conveyor releases a part as it reaches the rounded belt end', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts')

  assert.equal(typeof conveyor.shouldReleaseConveyorPart, 'function')
  assert.equal(conveyor.shouldReleaseConveyorPart(147, 146), false)
  assert.equal(conveyor.shouldReleaseConveyorPart(146, 146), true)
  assert.equal(conveyor.shouldReleaseConveyorPart(132, 146), true)
})

test('the release point sits above the rounded end center instead of its right-hand slope', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts')

  assert.equal(typeof conveyor.getRoundedEndReleaseX, 'function')
  assert.equal(conveyor.getRoundedEndReleaseX(112, 48), 136)
})

test('conveyor geometry places parts on top of the belt and joins its legs to the underside', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts')

  assert.equal(typeof conveyor.getConveyorPartCenterY, 'function')
  assert.equal(typeof conveyor.getConveyorBeltBottomY, 'function')
  assert.equal(conveyor.getConveyorPartCenterY(83, 'square', 2), 70)
  assert.equal(conveyor.getConveyorPartCenterY(83, 'bar', 2), 74.5)
  assert.equal(conveyor.getConveyorPartCenterY(83, 'diamond', 2), 81 - (11 * Math.SQRT2))
  assert.equal(conveyor.getConveyorBeltBottomY(83, 48), 131)
})

test('the rounded visual belt end has a matching static physics collider', async () => {
  const physics = await import('../src/components/heroConveyorPhysics.ts').catch(() => ({}))

  assert.equal(typeof physics.createRoundedBeltEndCollider, 'function')
  const collider = physics.createRoundedBeltEndCollider({ left: 112, top: 83, height: 48, clearance: 2 })
  assert.equal(collider.isStatic, true)
  assert.equal(collider.position.x, 136)
  assert.equal(collider.position.y, 107)
  assert.equal(collider.circleRadius, 26)
})

test('parts, tread marks, and roller share one conveyor surface speed', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts')

  assert.equal(typeof conveyor.getConveyorMotion, 'function')
  const motion = conveyor.getConveyorMotion({
    surfaceSpeed: 105,
    treadCycleLength: 28,
    rollerRadius: 17,
  })

  assert.equal(motion.bodyVelocity, 1.75)
  assert.equal(motion.treadCycleDuration, 28 / 105)
  assert.equal(motion.rollerRotationDuration, (2 * Math.PI * 17) / 105)
})

test('every released part follows the same gravity-driven speed curve around the rounded end', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts')

  assert.equal(typeof conveyor.getRoundedEndTangentVelocity, 'function')
  assert.deepEqual(
    conveyor.getRoundedEndTangentVelocity({
      bodyX: 136,
      bodyY: 70,
      centerX: 136,
      centerY: 107,
      releaseY: 70,
      minimumSpeed: 1,
      gravityPerStep: 0.024,
    }),
    { x: -1, y: 0 },
  )

  const diagonal = conveyor.getRoundedEndTangentVelocity({
    bodyX: 110,
    bodyY: 81,
    centerX: 136,
    centerY: 107,
    releaseY: 70,
    minimumSpeed: 1,
    gravityPerStep: 0.024,
  })
  const expectedSpeed = Math.sqrt(1 + (2 * 0.024 * 11))
  assert.ok(Math.abs(diagonal.x + (expectedSpeed * Math.SQRT1_2)) < 1e-12)
  assert.ok(Math.abs(diagonal.y - (expectedSpeed * Math.SQRT1_2)) < 1e-12)
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - expectedSpeed) < 1e-12)

  const samePosition = conveyor.getRoundedEndTangentVelocity({
    bodyX: 110,
    bodyY: 81,
    centerX: 136,
    centerY: 107,
    releaseY: 70,
    minimumSpeed: 1,
    gravityPerStep: 0.024,
  })
  assert.deepEqual(samePosition, diagonal)
})

test('the active page composes the black-led foundry sequence', async () => {
  const source = await read('src/pages/home_impl.tsx')

  assert.match(source, /<Hero\b/)
  assert.match(source, /<Statement\b/)
  assert.match(source, /<SelectedWork\b/)
  assert.doesNotMatch(source, /BlobBackground|noise-overlay|bg-gradient|shadow-/)
})

test('the page separates two physics acts with the white about section', async () => {
  const source = await read('src/pages/home_impl.tsx')
  assert.match(source, /<FactoryFlowProvider>/)
  assert.match(source, /<FactoryAct id="upper">[\s\S]*<Hero \/>[\s\S]*<Statement \/>[\s\S]*<SelectedWork \/>[\s\S]*<\/FactoryAct>/)
  assert.match(source, /<About \/>[\s\S]*<FactoryAct id="lower">/)
  assert.match(source, /<Skills \/>[\s\S]*<Experience \/>[\s\S]*<Goals \/>[\s\S]*<ContactSection \/>/)
})

test('the statement boundary starts the factory line and the hero reads its gate state', async () => {
  const statement = await read('src/components/Statement.tsx')
  const hero = await read('src/components/HeroConveyor.tsx')
  assert.match(statement, /useFactoryFlow/)
  assert.match(statement, /startLine/)
  assert.match(statement, /IntersectionObserver/)
  assert.match(hero, /lineStarted/)
  assert.match(hero, /getHeroGateState/)
})

test('about is the single white reading boundary without physics decoration', async () => {
  const about = await read('src/components/About.tsx')
  assert.match(about, /foundry-reading-break/)
  assert.match(about, /text-ink/)
  assert.doesNotMatch(about, /SectionLabel|FoundryTrace|motion|whileInView/)
})

test('active factory sections do not use obsolete visual hierarchy primitives', async () => {
  const activeSections = [
    'src/components/Statement.tsx',
    'src/components/SelectedWork.tsx',
    'src/components/About.tsx',
    'src/components/Skills.tsx',
    'src/components/Experience.tsx',
    'src/components/Goals.tsx',
    'src/components/ContactSection.tsx',
  ]

  for (const path of activeSections) {
    const source = await read(path)
    assert.doesNotMatch(source, /SectionLabel|FoundryTrace|foundry-label|text-muted|text-line-gray/, path)
  }
})

test('each station reserves the same aspect-ratio footprint used by its colliders', async () => {
  const css = await read('src/factory/factory-line.css')

  assert.match(css, /\.factory-station\s*\{[\s\S]*align-self:\s*start/)
  assert.match(css, /\.statement-rebound\s*\{[\s\S]*aspect-ratio:\s*3\s*\/\s*4/)
  assert.match(css, /\.selected-work-passage\s*\{[\s\S]*aspect-ratio:\s*1\s*\/\s*2/)
  assert.match(css, /\.forming-press\s*\{[\s\S]*aspect-ratio:\s*6\s*\/\s*13/)
  assert.match(css, /\.paint-inspection\s*\{[\s\S]*aspect-ratio:\s*1\s*\/\s*2/)
  assert.match(css, /\.goal-sorter\s*\{[\s\S]*aspect-ratio:\s*16\s*\/\s*31/)
  assert.match(css, /\.final-assembler\s*\{[\s\S]*aspect-ratio:\s*8\s*\/\s*13/)
  assert.match(css, /\.statement-rebound,[\s\S]*?\.selected-work-passage\s*\{[\s\S]*width:\s*32\.5rem/)
  assert.match(css, /\.statement-rebound,[\s\S]*?margin-left:\s*calc\(100%\s*-\s*32\.5rem\)/)
  assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*?\.statement-rebound,[\s\S]*?\.selected-work-passage\s*\{[\s\S]*margin-left:\s*auto/)
})

test('the goal sorter keeps a clear physical middle exit', async () => {
  const source = await read('src/factory/stations/GoalSorter.tsx')

  assert.doesNotMatch(source, /goals-merge-1/)
  assert.doesNotMatch(source, /M160 416V570/)
  assert.match(source, /isSensor:\s*true/)
  assert.match(source, /goals-merge-0[\s\S]*isSensor/)
  assert.match(source, /goals-merge-2[\s\S]*isSensor/)
  assert.match(source, /goals-common-exit[\s\S]*isSensor/)
})

test('factory parts cannot deflect one another between station colliders', async () => {
  const source = await read('src/factory/FactoryAct.tsx')

  assert.match(source, /collisionFilter:\s*\{\s*group:\s*-1\s*\}/)
})

test('the contact frame leaves its capture edge physically passable', async () => {
  const source = await read('src/factory/stations/FinalAssembler.tsx')

  assert.match(source, /contact-frame-top',\s*\{\s*isSensor:\s*true\s*\}/)
})

test('the navbar returns the original logo and changes width after scrolling', async () => {
  const header = await read('src/components/Header.tsx')

  assert.match(header, /src="\/Logo\.png"/)
  assert.match(header, /isScrolled/)
  assert.match(header, /max-w-none/)
  assert.match(header, /max-w-6xl/)
  assert.doesNotMatch(header, /border-b/)
})

test('the first hero viewport keeps only the name and the right-side graphic', async () => {
  const hero = await read('src/components/Hero.tsx')

  assert.match(hero, /<HeroConveyor/)
  assert.doesNotMatch(hero, /ArrowRight|ArrowUpRight/)
  assert.doesNotMatch(hero, /t\.hero\.(role|description|projectsBtn|contactBtn|assemblyLabel|assemblyStatus)/)
})

test('the cursor follower keeps rotating when it is not over an interactive element', async () => {
  const cursorFollower = await read('src/components/CursorFollower.tsx')

  assert.match(cursorFollower, /x: isHovering \? '-50%' : '16px'/)
  assert.match(cursorFollower, /y: isHovering \? '-50%' : '18px'/)
  assert.match(cursorFollower, /target\.classList\.contains\('clickable'\)/)
  assert.match(cursorFollower, /getComputedStyle\(target\)\.cursor === 'pointer'/)
  assert.match(cursorFollower, /rotate: isHovering \? 0 : 360/)
  assert.match(cursorFollower, /repeat: Infinity/)
  assert.match(cursorFollower, /duration: 3/)
  assert.match(cursorFollower, /ease: ['"]linear['"]/)
})

test('the hero reveals its text and rotates build categories with reduced-motion support', async () => {
  const hero = await read('src/components/Hero.tsx')
  const translations = await read('src/i18n/translations.ts')

  assert.match(hero, /useReducedMotion/)
  assert.match(hero, /getBuildWordMotionState/)
  assert.match(hero, /buildWordPhase/)
  assert.match(hero, /createHeroTimeline/)
  assert.match(hero, /timeline\.rotationStartAt/)
  assert.match(hero, /timeline\.buildItemRevealAt/)
  assert.match(hero, /buildItems/)
  assert.match(hero, /whitespace-nowrap/)
  assert.match(hero, /self-end/)
  assert.match(hero, /min-w-\[18ch\]/)
  assert.match(hero, /absolute inset-x-0 bottom-0 whitespace-nowrap/)
  assert.match(hero, /className="mt-3 text-2xl font-normal leading-tight text-soft-white md:text-3xl"/)
  assert.match(hero, /className="mt-3 flex flex-wrap/)
  assert.match(hero, /t\.hero\.subtitle/)
  assert.match(translations, /buildPrefix: 'Stavím'/)
  assert.match(translations, /'weby'/)
  assert.match(translations, /'mobilní aplikace'/)
  assert.match(translations, /buildPrefix: 'I build'/)
  assert.match(translations, /buildItems: \['websites', 'mobile apps', 'web applications', 'AI tools'\]/)
})

test('navbar copy is larger and the language switcher has no underline', async () => {
  const header = await read('src/components/Header.tsx')
  const languageSwitcher = await read('src/components/LanguageSwitcher.tsx')

  assert.match(header, /text-base font-medium/)
  assert.match(languageSwitcher, /inline-flex.*items-center/)
  assert.match(languageSwitcher, /text-base font-medium/)
  assert.doesNotMatch(languageSwitcher, /border-b/)
})

test('the interface foundry exposes reusable SVG primitives', async () => {
  const partGraphic = await read('src/factory/FactoryPartGraphic.tsx')
  const accents = await read('src/components/AccentWords.tsx')

  assert.match(partGraphic, /FactoryPartGraphic/)
  assert.match(partGraphic, /circle|rect|path/)
  assert.doesNotMatch(partGraphic, /filter=|linearGradient|radialGradient/)
  assert.match(accents, /export function AccentWords/)
})

test('project records keep selected work and modal content serializable', async () => {
  const projects = await read('src/data/projects.ts')
  const projectUi = await read('src/components/Projects.tsx')

  assert.match(projects, /export interface ProjectRecord/)
  assert.match(projects, /gt-series/)
  assert.match(projects, /rehearsal-hub/)
  assert.doesNotMatch(projects, /<|ReactNode|createElement/)
  assert.match(projectUi, /from ['"]\.\.\/data\/projects['"]/)
})

test('the visual system uses the approved tokens and local Instrument Sans font', async () => {
  const css = await read('src/index.css')
  const main = await read('src/main.tsx')
  const packageJson = await read('package.json')

  for (const token of ['#000000', '#FFFFFF', '#F21868', '#355CFF']) {
    assert.match(css, new RegExp(token.replace('#', '#'), 'i'))
  }
  assert.match(main, /@fontsource\/instrument-sans/)
  assert.match(packageJson, /@fontsource\/instrument-sans/)
  assert.doesNotMatch(css, /noise-overlay|linear-gradient|box-shadow|drop-shadow/)
  assert.doesNotMatch(css, /#050505|#F7F7F5|#777777/i)
})
