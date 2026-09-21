import { useState } from 'react'
import './contact.css'
import { Check, Copy, Envelope as Mail } from '@phosphor-icons/react'
import ContactForm from './ContactForm'
import { AccentWords } from './AccentWords'
import { useLanguage } from '../i18n/useLanguage'
import FinalAssembler from '../factory/stations/FinalAssembler'

export default function ContactSection() {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    await navigator.clipboard.writeText('andrej.zdvorak.123@gmail.com')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
<section id="contact" className="foundry-page contact-section py-28 md:py-40">
  <div className="foundry-container contact-layout">
    <header className="contact-intro">
      <h2 className="max-w-2xl font-heading text-[clamp(2.75rem,5vw,5.5rem)] font-medium leading-[0.94] tracking-[-0.055em] text-soft-white">
        <AccentWords parts={t.contact.headingParts} />
      </h2>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-soft-white">{t.contact.subtitle}</p>
      <div className="contact-direct">
        <p className="text-sm text-soft-white">{t.contact.orEmail}</p>
        <button onClick={copyEmail} className="contact-copy">
          <Mail size={17} aria-hidden="true" />
          <span className="contact-copy__address">andrej.zdvorak.123@gmail.com</span>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span className="contact-copy__feedback" aria-live="polite">{copied ? t.contact.copied : ''}</span>
        </button>
      </div>
    </header>
    <div className="contact-assembler-column"><FinalAssembler /></div>
    <div className="contact-form-column"><ContactForm /></div>
  </div>
</section>
  )
}
