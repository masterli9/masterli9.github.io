import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Globe, Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../i18n/useLanguage'

interface Project {
  title: string;
  type: string;
  icon: React.ReactNode;
  desc: string;
  tech: string[];
  link: string;
  images?: string[];
  longDesc?: string;
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useLanguage()

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!project) return null;

  const nextImage = () => {
    if (project.images) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images!.length);
    }
  };

  const prevImage = () => {
    if (project.images) {
      setCurrentImageIndex((prev) => (prev - 1 + project.images!.length) % project.images!.length);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background-dark/95 backdrop-blur-xl z-[9999] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto flex flex-col md:flex-row relative"
            >
              <button 
                onClick={onClose}
                className="cursor-pointer absolute top-6 right-6 z-30 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors flex items-center justify-center"
              >
                <X size={24} className="text-text-onLight" />
              </button>

              {/* Image Section / Carousel */}
              <div className="md:w-3/5 bg-background-light flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-brand-blue/5 to-brand-cyan/5 group min-h-[300px]">
                {project.images && project.images.length > 0 ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentImageIndex}
                        src={project.images[currentImageIndex]} 
                        alt={`${project.title} - ${currentImageIndex + 1}`} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-contain p-4 md:p-8 rounded-[2rem]"
                      />
                    </AnimatePresence>

                    {project.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          className="cursor-pointer absolute left-4 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg text-brand-blue transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button 
                          onClick={nextImage}
                          className="cursor-pointer absolute right-4 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg text-brand-blue transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight size={24} />
                        </button>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                          {project.images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImageIndex(i)}
                              className={`cursor-pointer w-2.5 h-2.5 rounded-full transition-all ${
                                i === currentImageIndex ? 'w-8 bg-brand-blue' : 'bg-brand-blue/30'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center">
                     <div className="scale-[3] opacity-20">{project.icon}</div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="md:w-2/5 p-8 md:p-12 overflow-y-auto bg-white">
                <div className="mb-10">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue mb-2 block">{project.type}</span>
                  <h3 className="font-heading font-black text-4xl text-text-onLight tracking-tighter mb-4 leading-[1.1]">{project.title}</h3>
                  <div className="w-12 h-1 bg-brand-blue mb-6"></div>
                  <p className="text-text-mutedOnLight text-lg leading-relaxed font-medium">
                    {project.longDesc || project.desc}
                  </p>
                </div>

                <div className="mb-10">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-text-onLight mb-5 flex items-center gap-2">
                    <Layers size={18} className="text-brand-blue" /> {t.projectModal.techStack}
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {project.tech.map(t => (
                      <span key={t} className="px-4 py-2 bg-background-light border border-black/5 rounded-xl text-sm font-bold text-text-onLight shadow-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-8 border-t border-black/5">
                  {project.link !== "#" && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full px-8 py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-blue transition-all shadow-xl"
                    >
                      <Globe size={18} /> {t.projectModal.visitProject} <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
