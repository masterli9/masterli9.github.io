import { Music, BookOpen, Trophy, Zap, Globe, User, Rocket } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'

export default function About() {
  const { t } = useLanguage()
  
  return (
    <section id="about" className="skewed-section-first bg-background-dark text-text-onDark overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-brand-blue text-lg tracking-widest uppercase flex items-center gap-2">
                <User size={20} /> {t.about.sectionTitle}
              </h2>
              <h3 className="font-heading font-bold text-4xl md:text-5xl tracking-tighter">
                {t.about.headline}
              </h3>
            </div>
            
            <div className="space-y-6 text-lg text-text-mutedOnDark leading-relaxed">
              <p>
                {t.about.p1} <span className="text-text-onDark font-semibold">{t.about.school}</span>{t.about.p1End}
              </p>
              <p>
                {t.about.p2Start}
                <span className="text-brand-neonGreen font-semibold"> {t.about.p2Highlight}</span> {t.about.p2End}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="p-4 border border-white/10 rounded-2xl bg-white/5"
                >
                  <p className="text-brand-blue font-bold text-2xl mb-1 flex items-center gap-2">
                    <Globe size={24} /> C2
                  </p>
                  <p className="text-sm uppercase tracking-wider opacity-60">{t.about.czech}</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="p-4 border border-white/10 rounded-2xl bg-white/5"
                >
                  <p className="text-brand-blue font-bold text-2xl mb-1 flex items-center gap-2">
                    <Globe size={24} /> C1
                  </p>
                  <p className="text-sm uppercase tracking-wider opacity-60">{t.about.english}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right: Interests / Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-brand-blue blur-[120px] opacity-20 rounded-full"></div>
            <div className="relative p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
              <h4 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
                <Zap size={20} className="text-brand-neonGreen" /> {t.about.outsideCode}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { key: 'music' as const, icon: <Music size={20} /> },
                  { key: 'reading' as const, icon: <BookOpen size={20} /> },
                  { key: 'motorsport' as const, icon: <Rocket size={20} /> },
                  { key: 'collecting' as const, icon: <Trophy size={20} /> }
                ].map((interest, idx) => (
                  <motion.div 
                    key={interest.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="p-4 rounded-xl bg-background-dark border border-white/5 hover:border-brand-blue transition-colors group"
                  >
                    <span className="text-brand-blue mb-2 block group-hover:scale-110 transition-transform">{interest.icon}</span>
                    <p className="font-bold">{t.about.interests[interest.key].name}</p>
                    <p className="opacity-60 text-xs">{t.about.interests[interest.key].desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
