import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('project previews stay compact while mobile screenshots preserve their full portrait frames', async () => {
  const model = await import('../src/components/projectLayoutModel.ts').catch(() => ({}))
  assert.equal(typeof model.getProjectPreviewMode, 'function')
  assert.equal(model.getProjectPreviewMode('mobile'), 'compact-portrait-pair')
  assert.equal(model.getProjectPreviewMode('web'), 'compact-wide')
})

test('both projects use one centered borderless hierarchy with the icon beside the product type', async () => {
  const [featured, supporting] = await Promise.all([
    readFile(new URL('../src/components/SelectedWork.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/Projects.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(featured, /max-w-\[60rem\][^"\n]*mx-auto|mx-auto[^"\n]*max-w-\[60rem\]/)
  assert.match(supporting, /max-w-\[60rem\][^"\n]*mx-auto|mx-auto[^"\n]*max-w-\[60rem\]/)
  assert.doesNotMatch(featured, /border-t/)
  assert.doesNotMatch(supporting, /border-t/)
  assert.match(featured, /<h3[\s\S]*?featuredProject\.title[\s\S]*?<ProjectIcon[\s\S]*?t\.projects\.types\[featuredProject\.type\]/)
  assert.match(supporting, /<h3[\s\S]*?project\.title[\s\S]*?<ProjectIcon[\s\S]*?t\.projects\.types\[project\.type\]/)
})
