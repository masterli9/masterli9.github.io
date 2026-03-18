import Layout from '../components/Layout'
import About from '../components/About'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import Experience from '../components/Experience'
import Goals from '../components/Goals'
import ContactForm from '../components/ContactForm'

import { Mail, ArrowRight, Check, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function HomeImpl(){
  const [scrollPos, setScrollPos] = useState(0)
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText('andrej.zdvorak.123@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrollPos(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const showNavbarName = scrollPos > 300

  return (
    <Layout>
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background-dark pb-32 md:pb-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background-light diagonal-split-v2"></div>
          <div className="absolute inset-0 isometric-grid opacity-5"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <p className="font-heading font-semibold text-brand-blue tracking-widest uppercase mb-4 animate-[fadeInUp_0.8s_ease-out]">Student IT & Vývojář</p>
          
          <div className="h-[120px] md:h-[200px] flex items-center justify-center mb-8">
            {!showNavbarName && (
                <motion.h1 
                    layoutId="shared-name"
                    className="font-heading font-extrabold text-5xl md:text-8xl text-text-onLight tracking-tighter leading-none drop-shadow-sm"
                >
                    ANDREJ <br /> ZDVOŘÁK
                </motion.h1>
            )}
          </div>

          <p 
            className="max-w-xl mx-auto text-lg text-text-onLight/80 mb-10 animate-[fadeInUp_1.2s_ease-out] transition-opacity duration-300"
            style={{ opacity: showNavbarName ? 0 : 1 }}
          >
            Vyvíjím webové a mobilní aplikace, které lidem zjednodušují a zefektivňují práci. 
            Baví mě hledat chytrá řešení a využívat umělou inteligenci v praxi.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center animate-[fadeInUp_1.4s_ease-out]">
            <a href="#contact" className="px-10 py-4 bg-brand-blue text-white rounded-full font-bold hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2">
              Kontaktujte mě <ArrowRight size={20} />
            </a>
            <a href="#projects" className="px-10 py-4 border-2 border-brand-blue text-brand-blue rounded-full font-bold hover:bg-brand-blue hover:text-white transition-all">
              Projekty
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
           <div className="w-[2px] h-16 bg-gradient-to-b from-brand-blue to-transparent"></div>
        </div>
      </section>

      <About />
      <Projects />
      <Skills />
      <Experience />
      <Goals />
      
      <section id="contact" className="pt-48 pb-32 bg-background-light relative overflow-hidden">
          <div className="absolute inset-0 isometric-grid opacity-5 pointer-events-none"></div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto px-4 text-center relative z-10"
          >
             <h2 className="font-heading font-extrabold text-4xl md:text-6xl text-text-onLight mb-6">Pojďme tvořit spolu</h2>
             <p className="text-xl text-text-mutedOnLight mb-12">Pokud vás zaujal můj profil, rád se pobavím o možné spolupráci nebo stáži v IT.</p>
             
             <ContactForm />
             
             <div className="mt-10 flex flex-col items-center gap-4">
               <p className="text-text-mutedOnLight text-sm">nebo přímo na e-mail</p>
               <button 
                 onClick={copyEmail}
                 className="cursor-pointer group text-text-onLight font-bold flex items-center justify-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-black/10 hover:border-brand-blue hover:bg-white shadow-sm hover:shadow-xl transition-all relative overflow-hidden text-sm"
               >
                 <Mail className="text-brand-blue" size={18} /> 
                 <span className="tracking-tight">andrej.zdvorak.123@gmail.com</span>
                 {copied ? (
                   <Check size={16} className="text-brand-neonGreen animate-bounce" />
                 ) : (
                   <Copy size={16} className="opacity-20 transition-opacity" />
                 )}
                 {copied && (
                   <span className="absolute bottom-1 right-1/2 translate-x-1/2 text-[10px] text-brand-neonGreen font-black uppercase">Zkopírováno!</span>
                 )}
               </button>
             </div>
          </motion.div>
      </section>
    </Layout>
  )
}
