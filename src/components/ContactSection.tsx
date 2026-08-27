import { useState } from 'react'
import { Check, Copy, Envelope as Mail } from '@phosphor-icons/react'
import ContactForm from './ContactForm'
import { useLanguage } from '../i18n/useLanguage'

export default function ContactSection() {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    await navigator.clipboard.writeText('andrej.zdvorak.123@gmail.com')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="contact" className="foundry-page border-t border-white-line py-28 md:py-40">
      <div className="foundry-container grid gap-12 md:grid-cols-[minmax(12rem,0.55fr)_minmax(0,1fr)] md:gap-20">
        <div>
          <p className="foundry-label mb-6">{t.contact.sectionLabel}</p>
          <h2 className="max-w-md font-heading text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.95] tracking-[-0.055em] text-soft-white">
            {t.contact.title}
          </h2>
          <p className="mt-7 max-w-sm text-lg leading-relaxed text-muted">
            {t.contact.subtitle}
          </p>

          <div className="mt-10 border-t border-white-line pt-5">
            <p className="text-sm text-line-gray">{t.contact.orEmail}</p>
            <button
              onClick={copyEmail}
              className="mt-3 inline-flex max-w-full items-center gap-3 text-left text-sm font-semibold text-soft-white transition-colors hover:text-signal-pink"
            >
              <Mail size={17} aria-hidden="true" />
              <span className="break-all">andrej.zdvorak.123@gmail.com</span>
              {copied ? <Check size={16} className="text-signal-pink" aria-label={t.contact.copied} /> : <Copy size={16} className="text-line-gray" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  )
}
