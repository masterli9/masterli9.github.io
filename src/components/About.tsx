import { Music, BookOpen, Trophy, Zap, Globe, User, Rocket } from 'lucide-react'
import { motion } from 'framer-motion'

export default function About() {
  return (
    <section id="about" className="py-24 bg-background-dark text-text-onDark overflow-hidden">
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
                <User size={20} /> O mně
              </h2>
              <h3 className="font-heading font-bold text-4xl md:text-5xl tracking-tighter">
                S nadšením pro technologie a tahem na branku.
              </h3>
            </div>
            
            <div className="space-y-6 text-lg text-text-mutedOnDark leading-relaxed">
              <p>
                Jsem studentem oboru Informační technologie na <span className="text-text-onDark font-semibold">SPŠ Ústí nad Labem</span>. 
                Dlouhodobě se zaměřuji na vývoj softwaru, zejména webových a mobilních aplikací.
              </p>
              <p>
                Baví mě hledat chytrá řešení, která lidem zjednodušují práci. V poslední době se intenzivně věnuji implementaci 
                <span className="text-brand-neonGreen font-semibold"> AI nástrojů</span> pro zefektivnění vývojového procesu.
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
                  <p className="text-sm uppercase tracking-wider opacity-60">Čeština</p>
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
                  <p className="text-sm uppercase tracking-wider opacity-60">Angličtina</p>
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
                <Zap size={20} className="text-brand-neonGreen" /> Mimo svět kódu
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { name: 'Hudba', icon: <Music size={20} />, desc: 'Klavír, kytara, produkce' },
                  { name: 'Četba', icon: <BookOpen size={20} />, desc: 'Rozvoj a vzdělávání' },
                  { name: 'Motorsport', icon: <Rocket size={20} />, desc: 'Rychlost a technika' },
                  { name: 'Sběratelství', icon: <Trophy size={20} />, desc: 'Vášeň pro detaily' }
                ].map((interest, idx) => (
                  <motion.div 
                    key={interest.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="p-4 rounded-xl bg-background-dark border border-white/5 hover:border-brand-blue transition-colors group"
                  >
                    <span className="text-brand-blue mb-2 block group-hover:scale-110 transition-transform">{interest.icon}</span>
                    <p className="font-bold">{interest.name}</p>
                    <p className="opacity-60 text-xs">{interest.desc}</p>
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
