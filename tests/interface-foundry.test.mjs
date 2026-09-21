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
    ['Andrej', 0.18],
    ['Zdvořák', 0.32],
  ])
  assert.deepEqual(timeline.subtitle, [
    { word: 'Student', revealAt: 0.48, accent: '#355CFF', fadeAt: 0.78 },
    { word: '&', revealAt: 0.68, accent: '#FFFFFF' },
    { word: 'developer', revealAt: 0.84, accent: '#F21868', fadeAt: 1.14 },
  ])
  assert.deepEqual(timeline.buildPrefix.map(({ word, revealAt }) => [word, revealAt]), [
    ['I', 1.3],
    ['build', 1.4],
  ])
  assert.equal(timeline.buildItemRevealAt, 1.48)
  assert.equal(timeline.rotationStartAt, 3.6)
})

test('the conveyor reveals its box before the machine and starts the payload with the belt', async () => {
  const { createHeroConveyorIntroSchedule, createHeroTimeline } = await import('../src/components/heroTimeline.ts')
  const timeline = createHeroTimeline({
    name: 'Andrej Zdvořák',
    subtitle: 'Student & developer',
    buildPrefix: 'I build',
  })

  assert.deepEqual(createHeroConveyorIntroSchedule(timeline), [
    { at: 0.28, stage: 'box-flash-on' },
    { at: 0.33, stage: 'box-flash-off' },
    { at: 0.4, stage: 'box-visible' },
    { at: 0.85, stage: 'machine-flash-on' },
    { at: 0.9, stage: 'machine-flash-off' },
    { at: 0.97, stage: 'machine-visible' },
    { at: 1.42, stage: 'running' },
  ])
})

test('the hero seeds starter parts only once the conveyor itself is visible', async () => {
  const heroConveyor = await read('src/components/HeroConveyor.tsx')

  assert.match(heroConveyor, /const isConveyorVisible = introStage === 'machine-visible' \|\| introStage === 'running'/)
  assert.match(heroConveyor, /if \(!isConveyorVisible\) return/)
  assert.match(heroConveyor, /\[getPartBody, isConveyorVisible, reducedMotion, removePart, spawnPart\]/)
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

test('the Hero physics runs only after its intro while the conveyor is in view', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts')

  assert.equal(typeof conveyor.shouldRunHeroPhysics, 'function')
  assert.equal(conveyor.shouldRunHeroPhysics({ isInView: true, reducedMotion: false, introStage: 'running' }), true)
  assert.equal(conveyor.shouldRunHeroPhysics({ isInView: false, reducedMotion: false, introStage: 'running' }), false)
  assert.equal(conveyor.shouldRunHeroPhysics({ isInView: true, reducedMotion: false, introStage: 'machine-visible' }), false)
  assert.equal(conveyor.shouldRunHeroPhysics({ isInView: true, reducedMotion: true, introStage: 'running' }), false)
})

test('an activated Hero feed keeps controlling belt parts only while its physics act is active', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts').catch(() => ({}))
  assert.equal(typeof conveyor.shouldRunHeroFeed, 'function')

  assert.equal(conveyor.shouldRunHeroFeed({ actActive: true, shouldAnimate: true, lineStarted: false, reducedMotion: false }), true)
  assert.equal(conveyor.shouldRunHeroFeed({ actActive: true, shouldAnimate: false, lineStarted: false, reducedMotion: false }), false)
  assert.equal(conveyor.shouldRunHeroFeed({ actActive: true, shouldAnimate: false, lineStarted: true, reducedMotion: false }), true)
  assert.equal(conveyor.shouldRunHeroFeed({ actActive: false, shouldAnimate: false, lineStarted: true, reducedMotion: false }), false)
  assert.equal(conveyor.shouldRunHeroFeed({ actActive: true, shouldAnimate: true, lineStarted: true, reducedMotion: true }), false)
})

test('the opaque Hero occluder covers the full width of a newly spawned part', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts').catch(() => ({}))
  assert.equal(typeof conveyor.getConveyorOccluderEndX, 'function')
  assert.equal(conveyor.getConveyorOccluderEndX({ viewportRightX: 420, spawnX: 455, maxPartHalfWidth: 18 }), 473)
  assert.equal(conveyor.getConveyorOccluderEndX({ viewportRightX: 420, spawnX: 390, maxPartHalfWidth: 18 }), 420)
})

test('the conveyor releases a part as it reaches the rounded belt end', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts')

  assert.equal(typeof conveyor.shouldReleaseConveyorPart, 'function')
  assert.equal(conveyor.shouldReleaseConveyorPart(147, 146), false)
  assert.equal(conveyor.shouldReleaseConveyorPart(146, 146), true)
  assert.equal(conveyor.shouldReleaseConveyorPart(132, 146), true)
})

test('hero starter parts are placed on the visible belt before the feed begins', async () => {
  const conveyor = await import('../src/components/heroConveyorModel.ts')

  const starterParts = ['square', 'circle', 'bar', 'diamond'].map((shape, index) => (
    conveyor.getHeroStarterPosition(index, shape)
  ))

  assert.deepEqual(starterParts.map(({ x }) => x), [176, 232, 288, 344])
  assert.deepEqual(starterParts.map(({ y }) => y), [70, 70, 74.5, 65.44365081389595])
  assert.deepEqual(starterParts.map(({ angle }) => angle), [0, 0, 0, 45])
  assert.ok(starterParts.every(({ x }) => x > 112 && x < 420))
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
  assert.match(source, /<Skills \/>[\s\S]*<Experience \/>[\s\S]*<ContactSection \/>/)
  assert.doesNotMatch(source, /Goals|goals/)
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

test('the Statement description reveals word by word after the headline', async () => {
  const statement = await read('src/components/Statement.tsx')

  assert.match(statement, /const descriptionStartAt = reveal\[reveal\.length - 1\]\.revealAt \+ 0\.22/)
  assert.match(statement, /const descriptionReveal = useMemo\(\s*\(\) => createStatementReveal\(t\.statement\.description\.split\(\/\\s\+\/\), 1, descriptionStartAt\)/)
  assert.match(statement, /<motion\.p[\s\S]*descriptionReveal\.map\(\(item, index\) =>/)
  assert.match(statement, /delay: reducedMotion \? 0 : item\.revealAt/)
})

test('the Statement copy aligns lower with the desktop ramp without changing mobile flow', async () => {
  const statement = await read('src/components/Statement.tsx')

  assert.match(statement, /<div className="max-w-3xl lg:translate-y-32">/)
})

test('about is the single white reading boundary without physics decoration', async () => {
  const about = await read('src/components/About.tsx')
  const translations = await read('src/i18n/translations.ts')
  assert.match(about, /foundry-reading-break/)
  assert.match(about, /text-ink/)
  assert.match(translations, /englishLevel: 'C1 Certified'/)
  assert.doesNotMatch(about, /SectionLabel|FoundryTrace|motion|whileInView/)
  assert.match(about, /gap-x-4 gap-y-8[^\n]*sm:grid-cols-2/)
  assert.match(about, /whitespace-nowrap font-heading text-4xl font-medium text-ink[^\n]*t\.about\.czechLevel/)
  assert.match(about, /whitespace-nowrap font-heading text-4xl font-medium text-ink[^\n]*t\.about\.englishLevel/)
  assert.doesNotMatch(about, /md:text-5xl/)
})

test('projects expose equal-width actions with a clear primary action and trailing icons', async () => {
  const selectedWork = await read('src/components/SelectedWork.tsx')
  const projects = await read('src/components/Projects.tsx')

  assert.match(selectedWork, /grid w-full max-w-\[24rem\] grid-cols-1 gap-3[^\n]*sm:grid-cols-2/)
  assert.match(selectedWork, /min-h-12 w-full cursor-pointer[^\n]*whitespace-nowrap[^\n]*border border-soft-white/)
  assert.match(selectedWork, /bg-soft-white text-ink/)
  assert.doesNotMatch(selectedWork, /const featuredActionClass = '[^']*text-soft-white/)
  assert.match(selectedWork, /const featuredSecondaryActionClass = .*text-soft-white/)
  assert.match(selectedWork, /visitProject[\s\S]*ArrowUpRight/)
  assert.match(selectedWork, /openPreview[\s\S]*Plus/)
  assert.match(projects, /openDetails[\s\S]*ArrowRight/)
})

test('skills keep technologies balanced across rows and experience copy explains employment clearly', async () => {
  const skills = await read('src/components/Skills.tsx')
  const translations = await read('src/i18n/translations.ts')

  assert.match(skills, /grid-cols-2[^\n]*md:grid-cols-5/)
  assert.match(skills, /xl:flex[^\n]*xl:flex-nowrap/)
  assert.match(translations, /title: 'Zaměstnání u podnikatele'/)
  assert.match(translations, /title: 'Employed by an entrepreneur'/)
  assert.equal([...translations.matchAll(/role: 'Junior Web Developer \(part-time\)'/g)].length, 2)
  assert.doesNotMatch(translations, /DPP u podnikatele|DPP position with an entrepreneur|Junior Web Developer \(DPP\)/)
})

test('active factory sections do not use obsolete visual hierarchy primitives', async () => {
  const activeSections = [
    'src/components/Statement.tsx',
    'src/components/SelectedWork.tsx',
    'src/components/About.tsx',
    'src/components/Skills.tsx',
    'src/components/Experience.tsx',
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
  assert.match(css, /\.forming-press\s*\{[\s\S]*aspect-ratio:\s*6\s*\/\s*13/)
  assert.match(css, /\.paint-inspection\s*\{[\s\S]*aspect-ratio:\s*1\s*\/\s*2/)
  assert.match(css, /\.final-assembler\s*\{[\s\S]*aspect-ratio:\s*32\s*\/\s*31/)
  assert.match(css, /\.statement-rebound\s*\{[\s\S]*width:\s*32\.5rem/)
  assert.match(css, /\.statement-rebound\s*\{[\s\S]*margin-left:\s*calc\(100%\s*-\s*32\.5rem\)/)
  assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*?\.statement-rebound\s*\{[\s\S]*margin-left:\s*auto/)
})

test('factory parts render above Statement, below press jaws, and below the Hero occluder', async () => {
  const css = await read('src/factory/factory-line.css')
  const press = await read('src/factory/stations/FormingPress.tsx')

  assert.match(css, /\.factory-line__parts\s*\{[\s\S]*z-index:\s*6/)
  assert.match(css, /\.factory-act\s*>\s*#skills\s*\{[\s\S]*z-index:\s*8[\s\S]*background:\s*transparent/)
  assert.match(css, /\.factory-act\s*>\s*\.factory-hero-layer\s*\{[\s\S]*z-index:\s*7/)
  assert.ok(press.indexOf('forming-press__gate') < press.indexOf('forming-press__jaw--left'))
})

test('each factory act clips its own render layer at the white boundary', async () => {
  const css = await read('src/factory/factory-line.css')
  const factoryAct = await read('src/factory/FactoryAct.tsx')

  assert.match(css, /\.factory-act\s*\{[\s\S]*overflow:\s*clip/)
  assert.match(factoryAct, /fadeOutPart/)
})

test('the oversized statement bowl remains visible over the following projects background', async () => {
  const statement = await read('src/components/Statement.tsx')
  const css = await read('src/factory/factory-line.css')

  assert.match(statement, /<section className="statement-section /)
  assert.match(css, /\.factory-act\s*>\s*\.statement-section\s*\{[\s\S]*z-index:\s*5/)
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

test('factory part graphic reveals semantic finishes only after printing', async () => {
  const graphic = await read('src/factory/FactoryPartGraphic.tsx')
  assert.match(graphic, /part.stage === 'printed'.*part.stage === 'inspected'.*part.stage === 'assembled'/)
  for (const shape of ['brand-mark', 'headline', 'copy-line', 'cta-button', 'visual-card', 'badge', 'avatar']) assert.ok(graphic.includes(shape))
  assert.match(graphic, /finished && part.finish.text/)
  assert.match(graphic, /textAnchor="middle" dominantBaseline="central"/)
})

test('paint inspection uses two recipe-driven heads and a separate inspection arch', async () => {
  const station = await read('src/factory/stations/PaintInspectionStation.tsx')
  const css = await read('src/factory/factory-line.css')
  for (const token of ['paint-head--coat', 'paint-head--print', 'part.finish', 'paint-inspection__arch', 'activePartIdRef']) assert.ok(station.includes(token), token)
  assert.doesNotMatch(station, /PAINT_COLORS|experience-paint-zone/)
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*\.paint-spray[\s\S]*animation: none/)
})

test('black paint uses atomized particles instead of an outlined beam and the blue arch scans during inspection', async () => {
  const station = await read('src/factory/stations/PaintInspectionStation.tsx')
  const css = await read('src/factory/factory-line.css')

  assert.match(station, /paint-spray__mist/)
  assert.doesNotMatch(station, /paint-spray--contrast/)
  assert.match(station, /phase === 'inspecting'/)
  assert.doesNotMatch(css, /\.paint-spray--contrast/)
})

test('experience renders its localized primary heading above content and station', async () => {
  const experience = await read('src/components/Experience.tsx')
  const translations = await read('src/i18n/translations.ts')
  assert.match(experience, /t\.experience\.sectionTitle/)
  assert.ok(experience.indexOf('t.experience.sectionTitle') < experience.indexOf('<PaintInspectionStation'))
  assert.match(translations, /sectionTitle:\s*'Zkušenosti & certifikace'/)
  assert.match(translations, /sectionTitle:\s*'Experience & Certifications'/)
})

test('experience copy uses the current employment date ranges and clear employment wording', async () => {
  const translations = await read('src/i18n/translations.ts')

  assert.match(translations, /date:\s*'Srpen 2025 – Srpen 2026'/)
  assert.match(translations, /title:\s*'Zaměstnání u podnikatele'/)
  assert.match(translations, /date:\s*'Květen 2025 – Srpen 2026'/)
  assert.match(translations, /date:\s*'August 2025 – August 2026'/)
  assert.match(translations, /title:\s*'Employed by an entrepreneur'/)
  assert.match(translations, /date:\s*'May 2025 – August 2026'/)
  assert.equal([...translations.matchAll(/role:\s*'Junior Web Developer \(part-time\)'/g)].length, 2)
  assert.doesNotMatch(translations, /DPP/)
  assert.doesNotMatch(translations, /title:\s*'Individuální podnikatel'/)
  assert.doesNotMatch(translations, /title:\s*'Individual Entrepreneur'/)
})

test('forming press holds queued raw parts above its sensor throughout the active cycle', async () => {
  const source = await read('src/factory/stations/FormingPress.tsx')
  assert.match(source, /skills-press-intake-gate/)
  assert.match(source, /Events.on\(engine, 'collisionActive', handleCollision\)/)
  assert.match(source, /factoryPartSpec.stage !== 'raw'/)
})

test('the final assembler scene renders semantic NOVA parts instead of placeholder circles', async () => {
  const source = await read('src/factory/stations/FinalAssemblerScene.tsx')
  const css = await read('src/factory/factory-line.css')
  assert.match(source, /FactoryPartGraphic/)
  assert.match(source, /motion\.g/)
  assert.match(source, /FINAL_ASSEMBLY_LAYOUT/)
  assert.match(source, /data-assembly-slot/)
  assert.match(source, /aria-hidden="true"/)
  assert.doesNotMatch(source, /factory-line__assembled-part|<circle[^>]+assembled/)
  assert.match(css, /\.final-assembler__nova-frame/)
  assert.match(css, /\.final-assembler__activation/)
  assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*factory-station\.final-assembler[\s\S]*width:\s*100%/)
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*final-assembler__activation/)
})

test('the contact controller hands Matter parts to semantic assembly before overflow processing', async () => {
  const source = await read('src/factory/stations/FinalAssembler.tsx')
  assert.match(source, /simulationActive/)
  assert.match(source, /beginFinalAssembly/)
  assert.match(source, /projectFinalAssemblerPose/)
  assert.match(source, /removePart\(partId\)/)
  assert.match(source, /const capturedBodies = new Set/)
  assert.ok(source.indexOf('const capturePairs') < source.indexOf('const roofPairs'))
  assert.match(source, /claimFinalOverflow/)
  assert.match(source, /Body\.applyForce/)
  assert.match(source, /<FinalAssemblerScene/)
  assert.doesNotMatch(source, /Constraint\.create|window\.setTimeout|factory-line__assembled-part/)
})

test('the final assembler gates collisions on the factory lifecycle and seeds reduced motion once', async () => {
  const source = await read('src/factory/stations/FinalAssembler.tsx')
  assert.match(source, /if \(!simulationActive \|\| reducedMotion\) return false/)
  assert.match(source, /createReducedFinalAssemblyParts/)
  assert.match(source, /markFinalWebsiteAssembled/)
  assert.match(source, /assemblyStateRef/)
})

test('contact uses an equal desktop split and intro-assembler-form mobile order without a top divider', async () => {
  const section = await read('src/components/ContactSection.tsx')
  const css = await read('src/components/contact.css')
  const factoryCss = await read('src/factory/factory-line.css')
  assert.doesNotMatch(section, /border-t/)
  assert.match(section, /contact-layout/)
  assert.match(section, /contact-intro/)
  assert.match(section, /contact-assembler-column/)
  assert.ok(section.indexOf('contact-intro') < section.indexOf('contact-assembler-column'))
  assert.ok(section.indexOf('contact-assembler-column') < section.indexOf('contact-form-column'))
  assert.match(css, /grid-template-areas:\s*"intro"\s*"assembler"\s*"form"/)
  assert.match(css, /@media \(min-width:\s*1024px\)[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)/)
  assert.match(css, /grid-template-areas:\s*"intro assembler"\s*"form assembler"/)
  assert.match(factoryCss, /\.factory-act\s*>\s*#contact\s*\{[\s\S]*z-index:\s*7/)
})

test('contact form preserves delivery fields in a wide accessible field grid', async () => {
  const form = await read('src/components/ContactForm.tsx')
  for (const name of ['from_name', 'reply_to', 'subject']) {
    assert.match(form, new RegExp(`name:\\s*['"]${name}['"]`))
  }
  assert.match(form, /name="message"/)
  assert.match(form, /name="website_url"/)
  assert.match(form, /contact-form__grid/)
  assert.match(form, /area: 'name'/)
  assert.match(form, /area: 'email'/)
  assert.match(form, /contact-form__field--message/)
  assert.match(form, /role="status"/)
  assert.match(form, /role="alert"/)
})
