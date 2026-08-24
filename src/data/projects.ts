export type ProjectIconName = 'mobile' | 'web'

export interface ProjectRecord {
  id: 'gt-series' | 'rehearsal-hub'
  title: 'The GT Series' | 'RehearsalHub'
  type: 'mobile' | 'web'
  icon: ProjectIconName
  translationKey: 'gtSeries' | 'rehearsalHub'
  technologies: string[]
  images: string[]
  href: string
  featured: boolean
}

export const projects: readonly ProjectRecord[] = [
  {
    id: 'gt-series',
    title: 'The GT Series',
    type: 'web',
    icon: 'web',
    translationKey: 'gtSeries',
    technologies: ['React', 'PostgreSQL', 'Node.js', 'TypeScript', 'Sanity.io'],
    images: ['/projects-photos/gt-series/image1.png', '/projects-photos/gt-series/image2.png'],
    href: 'https://www.thegtseries.com',
    featured: true,
  },
  {
    id: 'rehearsal-hub',
    title: 'RehearsalHub',
    type: 'mobile',
    icon: 'mobile',
    translationKey: 'rehearsalHub',
    technologies: ['React Native', 'Firebase', 'TypeScript', 'Expo', 'NativeWind', 'WIP'],
    images: ['/projects-photos/rehearsalHub/image1.png', '/projects-photos/rehearsalHub/image2.png'],
    href: '#',
    featured: false,
  },
]
