import { DeviceMobile, Layout } from '@phosphor-icons/react'
import type { ProjectIconName } from '../data/projects'

interface ProjectIconProps {
  name: ProjectIconName
  size?: number
  className?: string
}

export default function ProjectIcon({ name, size = 24, className = '' }: ProjectIconProps) {
  const Icon = name === 'mobile' ? DeviceMobile : Layout
  return <Icon size={size} weight="regular" className={className} aria-hidden="true" />
}
