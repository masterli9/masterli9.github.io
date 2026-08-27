import { useCallback, useRef, useState } from 'react'
import { ArrowUpRight, Plus } from '@phosphor-icons/react'
import { Body, Bodies, type Body as MatterBody } from 'matter-js'
import ProjectIcon from './ProjectIcon'
import ProjectModal from './ProjectModal'
import Projects from './Projects'
import { projects } from '../data/projects'
import { useLanguage } from '../i18n/useLanguage'
import { useFactoryStation, type FactoryStationMetrics } from '../factory/FactoryAct'

const PASSAGE_WIDTH = 260
const PASSAGE_HEIGHT = 520

function createPassageSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  metrics: FactoryStationMetrics,
  label: string,
) {
  const scaleX = Math.max(metrics.elementRect.width, 1) / PASSAGE_WIDTH
  const scaleY = Math.max(metrics.elementRect.height, 1) / PASSAGE_HEIGHT
  const offsetX = metrics.elementRect.left - metrics.actRect.left
  const offsetY = metrics.elementRect.top - metrics.actRect.top
  const start = { x: offsetX + (x1 * scaleX), y: offsetY + (y1 * scaleY) }
  const end = { x: offsetX + (x2 * scaleX), y: offsetY + (y2 * scaleY) }
  const body = Bodies.rectangle(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    Math.hypot(end.x - start.x, end.y - start.y),
    3.5 * Math.min(scaleX, scaleY),
    { isStatic: true, friction: 0.12, restitution: 0.15, label },
  )
  Body.setAngle(body, Math.atan2(end.y - start.y, end.x - start.x))
  return body
}

export default function SelectedWork() {
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const passageRef = useRef<HTMLDivElement>(null)
  const featuredProject = projects.find((project) => project.featured) ?? projects[0]
  const copy = t.projects.items[featuredProject.translationKey]

  const buildColliders = useCallback((metrics: FactoryStationMetrics): MatterBody[] => [
    createPassageSegment(40, 82, 220, 222, metrics, 'projects-slope'),
    createPassageSegment(220, 222, 220, 472, metrics, 'projects-exit-rail'),
  ], [])
  useFactoryStation({ id: 'projects', elementRef: passageRef, buildColliders })

  return (
    <section id="projects" className="foundry-page py-28 md:py-40">
      <div className="foundry-container">
        <div className="mb-16 flex flex-col gap-5 md:mb-20 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl font-heading text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.06em] text-soft-white">
            {t.projects.sectionTitle}
          </h2>
          <p className="max-w-xs text-base leading-relaxed text-soft-white md:text-right">{t.projects.subtitle}</p>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,18rem)] lg:gap-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 text-signal-pink">
              <ProjectIcon name={featuredProject.icon} size={22} />
              <span className="text-sm font-semibold">{t.projects.types[featuredProject.type]}</span>
            </div>
            <h3 className="mt-7 font-heading text-4xl font-medium tracking-[-0.045em] text-soft-white md:text-5xl">
              {featuredProject.title}
            </h3>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-soft-white">{copy.desc}</p>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-soft-white">
              {featuredProject.technologies.map((technology) => <span key={technology}>{technology}</span>)}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href={featuredProject.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 font-semibold text-soft-white transition-colors hover:text-signal-pink"
              >
                {t.projectModal.visitProject}
                <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-soft-white transition-colors hover:text-signal-pink"
              >
                <Plus size={16} aria-hidden="true" />
                {t.projects.openPreview}
              </button>
            </div>

            <figure className="mt-14 border border-white-line bg-ink-soft p-3 md:p-5">
              <img
                src={featuredProject.images[0]}
                alt={`${featuredProject.title} preview`}
                className="block aspect-video w-full object-cover object-top"
              />
            </figure>
          </div>

          <div ref={passageRef} className="factory-station selected-work-passage" data-factory-station="projects">
            <svg viewBox={`0 0 ${PASSAGE_WIDTH} ${PASSAGE_HEIGHT}`} aria-hidden="true" focusable="false">
              <path d="M40 82 220 222V472" className="factory-line__rail factory-line__rail--white" />
            </svg>
          </div>
        </div>

        <Projects />
      </div>

      <ProjectModal
        project={isModalOpen ? featuredProject : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  )
}
