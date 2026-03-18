import { Users, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'

export default function Skills() {
  const { t } = useLanguage()

  const categories = [
    {
      title: t.skills.categories.technical,
      color: "brand-blue",
      icon: <Terminal size={24} />,
      skills: t.skills.technicalSkills
    },
    {
      title: t.skills.categories.soft,
      color: "brand-blue",
      icon: <Users size={24} />,
      skills: t.skills.softSkills
    }
  ];

  return (
    <section id="skills" className="light-section bg-background-light text-text-onLight relative">
      <div className="absolute inset-0 isometric-grid pointer-events-none opacity-5"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mb-16"
        >
          <h2 className="font-heading font-extrabold text-4xl md:text-5xl tracking-tighter mb-6 uppercase text-text-onLight">
            {t.skills.sectionTitle} <br /> {t.skills.sectionTitle2}
          </h2>
          <p className="text-xl text-text-mutedOnLight leading-relaxed">
            {t.skills.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="space-y-6"
            >
              <h3 className={`font-heading font-bold text-sm uppercase tracking-widest flex items-center gap-3 text-brand-blue`}>
                {cat.icon} {cat.title}
              </h3>
              <div className="flex flex-wrap gap-3">
                {cat.skills.map((skill, sIdx) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: (idx * 0.2) + (sIdx * 0.05) }}
                    className={`px-6 py-3 rounded-full border border-black/10 bg-white font-bold text-sm tracking-wide shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-default text-text-onLight`}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tools Section - Infinite Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: .5 }}
          className="mt-32 pt-12 border-t border-black/10 overflow-hidden relative"
        >
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background-light to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background-light to-transparent z-10"></div>

          <div className="marquee-container opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex whitespace-nowrap marquee items-center text-text-onLight">
              {[
                'React', 'Next.js', 'React Native', 'TypeScript', 'Node.js',
                'Firebase', 'TailwindCSS', 'PostgreSQL', 'Git',
                'Figma',
              ].map((tool, i) => (
                <span key={`tool-1-${i}`} className="text-xl md:text-3xl font-heading font-black tracking-tight mx-6">{tool}</span>
              ))}
            </div>
            <div className="flex whitespace-nowrap marquee items-center text-text-onLight" aria-hidden="true">
              {[
                'React', 'Next.js', 'React Native', 'TypeScript', 'Node.js',
                'Firebase', 'TailwindCSS', 'PostgreSQL', 'Git',
                'Figma',
              ].map((tool, i) => (
                <span key={`tool-2-${i}`} className="text-xl md:text-3xl font-heading font-black tracking-tight mx-6">{tool}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
