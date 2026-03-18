import { Award, Briefcase, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Experience() {
  const experiences = [
    {
      title: "Webforte Technologies s.r.o.",
      role: "AI Web Application Developer (Brigáda)",
      date: "Současnost",
      desc: "Vývoj webových aplikací s využitím moderních AI nástrojů a technologií."
    },
    {
      title: "Individuální podnikatel",
      role: "Junior Web Developer (Odborná praxe)",
      date: "V minulosti",
      desc: "Praxe zaměřená na vývoj webových stránek a implementaci AI pro zefektivnění práce."
    }
  ];

  const certifications = [
    "Cisco CCNA (Switching, Routing, and Wireless Essentials)",
    "Cisco CCNAv7 (Introduction to Networks)",
    "IT Essentials (PC Hardware and Software)"
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
              <Briefcase size={20} /> Zkušenosti
            </h2>
            <div className="space-y-12 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/10"></div>
              
              {experiences.map((exp, idx) => (
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
              <Award size={20} /> Certifikace & Úspěchy
            </h2>
            <div className="space-y-6">
              {certifications.map((cert, idx) => (
                <motion.div 
                  key={cert} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 border border-white/10 rounded-2xl bg-white/5 flex items-center gap-6 group hover:border-brand-blue hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 shrink-0 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue group-hover:rotate-12 transition-transform">
                    <Award size={24} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-text-onDark">{cert}</h3>
                </motion.div>
              ))}
              

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
