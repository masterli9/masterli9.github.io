import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('the active page composes the black-led foundry sequence', async () => {
  const source = await read('src/pages/home_impl.tsx')

  assert.match(source, /<Hero\b/)
  assert.match(source, /<Statement\b/)
  assert.match(source, /<SelectedWork\b/)
  assert.doesNotMatch(source, /BlobBackground|noise-overlay|bg-gradient|shadow-/)
})

test('the interface foundry exposes reusable SVG primitives', async () => {
  const assembly = await read('src/components/AssemblyCell.tsx')
  const trace = await read('src/components/FoundryTrace.tsx')

  assert.match(assembly, /export type AssemblyCellMode/)
  assert.match(assembly, /useReducedMotion/)
  assert.match(assembly, /aria-label|aria-labelledby/)
  assert.doesNotMatch(assembly, /filter=|linearGradient|radialGradient/)
  assert.match(trace, /export interface FoundryTraceProps/)
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

  for (const token of ['#050505', '#F7F7F5', '#F21868', '#355CFF', '#777777']) {
    assert.match(css, new RegExp(token.replace('#', '#'), 'i'))
  }
  assert.match(main, /@fontsource\/instrument-sans/)
  assert.match(packageJson, /@fontsource\/instrument-sans/)
  assert.doesNotMatch(css, /noise-overlay|linear-gradient|box-shadow|drop-shadow/)
})
