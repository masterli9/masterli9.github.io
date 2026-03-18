import { Award, Briefcase, Calendar, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'

export default function Experience() {
  const { t } = useLanguage()

  const certifications = [
    {
      title: "Cisco CCNA (Switching, Routing, and Wireless Essentials)",
      link: "https://www.credly.com/badges/ca43212c-c81b-454d-bdd9-c04d5ef7217c"
    },
    {
      title: "Cisco CCNAv7 (Introduction to Networks)",
      link: "https://www.credly.com/badges/36fdd309-48b6-4b06-9d4f-b75dd054bbf5"
    },
    {
      title: "IT Essentials (PC Hardware and Software)",
      link: "https://www.credly.com/badges/cb31e4e7-ecd6-46a3-8bbf-68529105bec0"
    }
  ];

  return (
    <section id="experience" className="skewed-section bg-background-dark text-text-onDark overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Work Experience */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading font-extrabold text-brand-blue text-lg tracking-widest uppercase mb-12 flex items-center gap-3">
              <Briefcase size={20} /> {t.experience.sectionTitle}
            </h2>
            <div className="space-y-12 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/10"></div>

              {t.experience.items.map((exp, idx) => (
                <motion.div
                  key={exp.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="relative pl-12 group"
                >
                  <div className="absolute left-0 top-2 w-6 h-6 rounded-full border-4 border-background-dark bg-brand-blue group-hover:bg-brand-neonGreen transition-colors duration-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] group-hover:shadow-brand-neonGreen/30"></div>
                  <div className="space-y-2">
                    <span className="text-sm font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} /> {exp.date}
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl text-text-onDark group-hover:text-brand-blue transition-colors">{exp.title}</h3>
                    <p className="text-brand-neonGreen font-bold tracking-tight">{exp.role}</p>
                    <p className="text-text-mutedOnDark leading-relaxed">{exp.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading font-extrabold text-brand-blue text-lg tracking-widest uppercase mb-12 flex items-center gap-3">
              <Award size={20} /> {t.experience.certTitle}
            </h2>
            <div className="space-y-6">
              {certifications.map((cert, idx) => (
                <motion.a
                  key={cert.title}
                  href={cert.link || "#"}
                  target={cert.link ? "_blank" : undefined}
                  rel={cert.link ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`p-6 border border-white/10 rounded-2xl bg-white/5 flex items-center gap-6 group hover:border-brand-blue hover:bg-white/10 transition-all duration-300 ${!cert.link ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="w-12 h-12 shrink-0 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue group-hover:rotate-12 transition-transform">
                    <Award size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg text-text-onDark">
                      {cert.title}
                    </h3>
                  </div>
                  {cert.link && <ExternalLink size={20} className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />}
                </motion.a>
              ))}


            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
