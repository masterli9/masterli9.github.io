import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('project previews stay compact while mobile screenshots preserve their full portrait frames', async () => {
  const model = await import('../src/components/projectLayoutModel.ts').catch(() => ({}))
  assert.equal(typeof model.getProjectPreviewMode, 'function')
  assert.equal(model.getProjectPreviewMode('mobile'), 'compact-portrait-pair')
  assert.equal(model.getProjectPreviewMode('web'), 'compact-wide')
})

test('featured work uses a full-width stage while supporting projects become drawer rows', async () => {
  const [featured, supporting, media, translations, modal] = await Promise.all([
    readFile(new URL('../src/components/SelectedWork.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/Projects.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ProjectMedia.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/i18n/translations.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ProjectModal.tsx', import.meta.url), 'utf8'),
  ])

  assert.doesNotMatch(featured, /max-w-\[60rem\]/)
  assert.match(featured, /project-featured/)
  assert.match(featured, /<ProjectMedia project=\{featuredProject\} variant="featured" \/>/)
  assert.match(supporting, /project-index/)
  assert.match(supporting, /border-y border-white-line/)
  assert.match(supporting, /data-project-row=\{project\.id\}/)
  assert.doesNotMatch(supporting, /<ProjectMedia/)
  assert.match(supporting, /aria-haspopup="dialog"/)
  assert.match(supporting, /project\.technologies\.slice\(0, 3\)/)
  assert.match(featured, /<h3[\s\S]*?featuredProject\.title[\s\S]*?<ProjectIcon[\s\S]*?t\.projects\.types\[featuredProject\.type\]/)
  assert.match(supporting, /project\.title[\s\S]*?<ProjectIcon[\s\S]*?t\.projects\.types\[project\.type\]/)
  assert.match(media, /variant\?: 'featured'/)
  assert.match(translations, /otherProjects: 'Další projekty'/)
  assert.match(translations, /otherProjects: 'More projects'/)
  assert.match(modal, /returnFocusRef\?/)
  assert.match(modal, /aria-label=\{t\.projectModal\.close\}/)
})

test('featured preview stays bounded inside the wide stage', async () => {
  const media = await readFile(new URL('../src/components/ProjectMedia.tsx', import.meta.url), 'utf8')

  assert.match(media, /ml-auto w-full max-w-4xl overflow-hidden/)
})

test('featured copy, metadata, and actions sit to the left of the featured preview', async () => {
  const featured = await readFile(new URL('../src/components/SelectedWork.tsx', import.meta.url), 'utf8')

  assert.match(featured, /mt-6 grid items-start gap-8 md:grid-cols-\[minmax\(18rem,0\.32fr\)_minmax\(0,1fr\)\] md:gap-8/)
  assert.match(featured, /<div className="md:order-2 md:justify-self-end">[\s\S]*?<ProjectMedia project=\{featuredProject\} variant="featured" \/>/)
  assert.match(featured, /<div className="md:order-1 md:flex md:self-stretch md:flex-col md:text-left">[\s\S]*?copy\.desc[\s\S]*?featuredProject\.technologies/)
  assert.match(featured, /flex flex-wrap gap-x-4 gap-y-2 text-sm text-soft-white md:justify-start/)
  assert.match(featured, /<div className="flex flex-wrap items-center justify-between gap-5 pb-6">/)
  assert.match(featured, /<div className="md:order-1 md:flex md:self-stretch md:flex-col md:text-left">/)
  assert.match(featured, /mt-8 flex flex-wrap items-center gap-5 md:mt-auto md:gap-4 md:justify-start/)
  assert.doesNotMatch(featured, /md:text-right|md:justify-end/)
})
