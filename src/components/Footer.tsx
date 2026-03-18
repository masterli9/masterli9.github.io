import { Github, Linkedin, Instagram, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import PrivacyModal from './PrivacyModal'

export default function Footer() {
  const [copied, setCopied] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText('andrej.zdvorak.123@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const navLinks = [
    { name: 'O mně', href: '#about' },
    { name: 'Projekty', href: '#projects' },
    { name: 'Dovednosti', href: '#skills' },
    { name: 'Zkušenosti', href: '#experience' },
    { name: 'Kontakt', href: '#contact' },
  ]

  const socialLinks = [
    { icon: <Github size={20} />, href: 'https://github.com/masterli9', label: 'GitHub' },
    { icon: <Linkedin size={20} />, href: 'https://www.linkedin.com/in/andrej-zdvořák-a403653b4/', label: 'LinkedIn' },
    { icon: <Instagram size={20} />, href: 'https://www.instagram.com/andrej_zdvorak/', label: 'Instagram' },
  ]

  return (
    <footer className="bg-background-dark text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h2 className="font-heading font-black text-2xl tracking-tighter">ANDREJ ZDVOŘÁK</h2>
            <p className="text-text-mutedOnDark max-w-sm">
              Vývojář se zaměřením na moderní webové technologie a efektivní využití AI.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target='_blank'
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue hover:scale-110 transition-all"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h3 className="font-heading font-bold uppercase tracking-widest text-sm text-brand-blue">Navigace</h3>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-text-mutedOnDark hover:text-white transition-colors">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Fast */}
          <div className="space-y-6">
            <h3 className="font-heading font-bold uppercase tracking-widest text-sm text-brand-blue">Rychlý kontakt</h3>
            <div className="space-y-4">
              <button
                onClick={copyEmail}
                className="cursor-pointer group flex items-center gap-3 text-text-mutedOnDark hover:text-white transition-all w-full text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors">
                  {copied ? <Check size={14} className="text-brand-neonGreen" /> : <Copy size={14} />}
                </div>
                <span className="text-sm truncate">andrej.zdvorak.123@gmail.com</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-mutedOnDark">
          <p>© {new Date().getFullYear()} Andrej Zdvořák. Všechna práva vyhrazena.</p>
          <div className="flex gap-8">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Soukromí
            </button>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </footer>
  )
}
