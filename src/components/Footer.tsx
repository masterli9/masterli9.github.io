import { Check, Copy, GithubLogo, InstagramLogo, LinkedinLogo } from '@phosphor-icons/react'
import { useState } from 'react'
import PrivacyModal from './PrivacyModal'
import { useLanguage } from '../i18n/useLanguage'

export default function Footer() {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const navLinks = [
    { name: t.nav.about, href: '#about' },
    { name: t.nav.projects, href: '#projects' },
    { name: t.nav.skills, href: '#skills' },
    { name: t.nav.experience, href: '#experience' },
    { name: t.nav.contact, href: '#contact' },
  ]
  const socialLinks = [
    { icon: GithubLogo, href: 'https://github.com/masterli9', label: 'GitHub' },
    { icon: LinkedinLogo, href: 'https://www.linkedin.com/in/andrej-zdvořák-a403653b4/', label: 'LinkedIn' },
    { icon: InstagramLogo, href: 'https://www.instagram.com/andrej_zdvorak/', label: 'Instagram' },
  ]

  const copyEmail = async () => {
    await navigator.clipboard.writeText('andrej.zdvorak.123@gmail.com')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer className="foundry-page border-t border-white-line py-12 md:py-16">
      <div className="foundry-container">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.6fr)_minmax(14rem,0.8fr)] md:gap-16">
          <div>
            <p className="font-heading text-2xl font-semibold tracking-[-0.04em] text-soft-white">Andrej Zdvořák</p>
            <p className="mt-5 max-w-sm leading-relaxed text-muted">{t.footer.description}</p>
            <div className="mt-8 flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-line-gray transition-colors hover:text-signal-pink">
                  <Icon size={20} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-signal-pink">{t.footer.navigation}</h2>
            <nav className="mt-5 flex flex-col items-start gap-3">
              {navLinks.map((link) => <a key={link.href} href={link.href} className="text-sm text-muted transition-colors hover:text-soft-white">{link.name}</a>)}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-signal-pink">{t.footer.quickContact}</h2>
            <button onClick={copyEmail} className="mt-5 inline-flex max-w-full items-center gap-3 text-left text-sm text-muted transition-colors hover:text-soft-white">
              {copied ? <Check size={17} className="text-signal-pink" aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
              <span className="break-all">andrej.zdvorak.123@gmail.com</span>
            </button>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white-line pt-6 text-sm text-line-gray md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Andrej Zdvořák. {t.footer.rights}</p>
          <div className="flex gap-6">
            <button onClick={() => setIsPrivacyOpen(true)} className="transition-colors hover:text-soft-white">{t.footer.privacy}</button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-banner'))} className="transition-colors hover:text-soft-white">{t.footer.cookies}</button>
          </div>
        </div>
      </div>
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </footer>
  )
}
