import type { ProjectRecord } from '../data/projects'

export type ProjectPreviewMode = 'compact-wide' | 'compact-portrait-pair'

export function getProjectPreviewMode(type: ProjectRecord['type']): ProjectPreviewMode {
  return type === 'mobile' ? 'compact-portrait-pair' : 'compact-wide'
}
