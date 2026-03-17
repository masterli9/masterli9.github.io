import React, { useState } from 'react'
import { ArrowRight, Smartphone, Layout as LayoutIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import ProjectModal from './ProjectModal'

export interface Project {
  title: string;
  type: string;
  icon: React.ReactNode;
  desc: string;
  tech: string[];
  link: string;
  images?: string[];
  longDesc?: string;
}

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      title: "RehearsalHub",
      type: "Mobilní aplikace",
      icon: <Smartphone size={32} className="text-brand-blue" />,
      desc: "Aplikace pro menší kapely usnadňující organizaci zkoušek a sdílení materiálů.",
      longDesc: "RehearsalHub je můj ročníkový projekt zaměřený na potřeby hudebních těles. Umožňuje členům kapely snadno plánovat zkoušky, sdílet setlisty, nahrávky a notové zápisy. Systém zahrnuje real-time oznámení a offline režim pro použití v místech se slabým signálem.",
      tech: ["React Native", "Firebase", "TypeScript", "Expo", "NativeWind"],
      images: ["/projects-photos/rehearsalHub/image1.png", "/projects-photos/rehearsalHub/image2.png"],
      link: "#"
    },
    {
      title: "The GT Series",
      type: "Webová platforma",
      icon: <LayoutIcon size={32} className="text-brand-blue" />,
      desc: "Komplexní systém pro správu a prezentaci závodní ligy ve hře Forza Horizon 5.",
      longDesc: "Robustní webová platforma vyvinutá pro americkou komunitu hráčů Forza Horizon. Jezdci a fanoušci si mohou zobrazit výsledky všech závodů a kvalifikací, průběžné pořadí, kalendář závodů nebo i statistiky jezdců. Přítomen je i kompletní administrační systém, který umožňuje zadávání výsledků, správu jezdců nebo i automatické generování grafik.",
      tech: ["React", "PostgreSQL", "Node.js", "TypeScript", "Sanity.io"],
      images: ["/projects-photos/gt-series/image1.png", "/projects-photos/gt-series/image2.png"],
      link: "https://www.thegtseries.com"
    }
  ];

  return (
    <section id="projects" className="py-24 bg-background-light relative overflow-hidden">
      <div className="absolute inset-0 isometric-grid pointer-events-none opacity-5"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-extrabold text-4xl text-text-onLight tracking-tighter uppercase mb-2">Projekty</h2>
          <p className="text-text-mutedOnLight">Výběr mých nejvýznamnějších prací</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {projects.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              onClick={() => setSelectedProject(p)}
              className="group relative bg-white border border-black/10 rounded-[2.5rem] p-10 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 rounded-[2.5rem] border-2 border-transparent group-hover:border-brand-blue/20 transition-all pointer-events-none"></div>

              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-brand-blue/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-blue/10 transition-all">
                    {p.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-1 block">{p.type}</span>
                    <h3 className="font-heading font-extrabold text-3xl text-text-onLight">{p.title}</h3>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all transform group-hover:rotate-45">
                  <ArrowRight size={24} />
                </div>
              </div>

              <p className="text-text-mutedOnLight text-lg mb-10 leading-relaxed">
                {p.desc}
              </p>

              <div className="flex flex-wrap gap-2">
                {p.tech.map(t => (
                  <span key={t} className="px-4 py-1.5 bg-background-light border border-black/5 rounded-full text-[13px] font-bold text-text-onLight shadow-sm">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  )
}
