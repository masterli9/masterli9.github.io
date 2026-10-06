import { useEmailCopy } from '../hooks/useEmailCopy'
import './contact.css'
import { Check, Copy, Envelope as Mail } from '@phosphor-icons/react'
import ContactForm from './ContactForm'
import { AccentWords } from './AccentWords'
import { useLanguage } from '../i18n/useLanguage'
import FinalAssembler from '../factory/stations/FinalAssembler'

export default function ContactSection() {
  const { t } = useLanguage()
  const { copied, copyFailed, copyEmail } = useEmailCopy()


  return (
    <section id="contact" className="foundry-page contact-section py-28 md:py-40">
      <div className="foundry-container contact-layout">
        <header className="contact-intro factory-reading-surface">
          <h2 className="contact-heading font-heading font-medium tracking-[-0.055em] text-soft-white">
            <AccentWords parts={t.contact.headingParts} />
          </h2>
          <div className="contact-intro-details">
            <p className="contact-subtitle text-soft-white">{t.contact.subtitle}</p>
            <div className="contact-direct">
              <p className="text-sm text-soft-white">{t.contact.orEmail}</p>
              <button onClick={copyEmail} className="contact-copy">
                <Mail size={17} aria-hidden="true" />
                <span className="contact-copy__address">andrej.zdvorak.123@gmail.com</span>
                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                <span className="contact-copy__feedback" aria-live="polite">{copied ? t.contact.copied : ''}</span>
              </button>
              {copyFailed && <p role="status" className="mt-3 text-sm">{t.contact.copyError} <a className="inline-flex min-h-11 items-center underline" href="mailto:andrej.zdvorak.123@gmail.com">{t.contact.openEmail}</a></p>}
            </div>
          </div>
        </header>
        <div className="contact-form-column factory-reading-surface"><ContactForm /></div>
        <div className="contact-assembler-column"><FinalAssembler /></div>
      </div>
    </section>
  )
}
