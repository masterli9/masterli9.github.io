import { Target, Trophy, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Goals() {
  const goals = [
    {
      title: "Krátkodobé cíle",
      period: "Následující rok",
      icon: <Target size={28} />,
      color: "brand-blue",
      desc: "Pokračovat v rozvoji stávajících dovedností ve vývoji a AI. Získávat další praktické zkušenosti skrze projekty a brigády."
    },
    {
      title: "Studium na VŠ",
      period: "V horizontu 3 let",
      icon: <GraduationCap size={28} />,
      color: "brand-neonGreen",
      desc: "Studium software engineeringu na UHK nebo ZČU. Rozvoj v oblastech kyberbezpečnosti a etického hackování."
    },
    {
      title: "Dlouhodobá vize",
      period: "Budoucnost",
      icon: <Trophy size={28} />,
      color: "brand-cyan",
      desc: "Stát se uznávaným profesionálem v IT. Pracovat na smysluplných projektech, které pomáhají lidem a zefektivňují práci."
    }
  ];

  return (
    <section id="goals" className="skewed-section-last bg-background-dark overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-extrabold text-4xl text-text-onDark tracking-tighter uppercase mb-4">Cíle a plány</h2>
          <div className="w-20 h-1 bg-brand-blue mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {goals.map((g, idx) => (
            <motion.div 
              key={g.title} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="p-8 border border-white/10 rounded-3xl bg-white/5 hover:border-brand-blue transition-all duration-500 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 group-hover:border-brand-blue/50 transition-all">
                <div className="text-brand-blue">
                   {g.icon}
                </div>
              </div>
              <span className="text-xs font-bold opacity-40 uppercase tracking-widest block mb-2">{g.period}</span>
              <h3 className="font-heading font-bold text-2xl text-text-onDark mb-4">{g.title}</h3>
              <p className="text-text-mutedOnDark leading-relaxed">
                {g.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

