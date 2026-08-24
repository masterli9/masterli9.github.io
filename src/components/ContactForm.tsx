import { useRef, useState, type FormEvent } from 'react'
import { CheckCircle, PaperPlaneRight, WarningCircle } from '@phosphor-icons/react'
import emailjs from '@emailjs/browser'
import { useLanguage } from '../i18n/useLanguage'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { t } = useLanguage()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formRef.current) return

    const formData = new FormData(formRef.current)
    if (formData.get('website_url')) {
      setStatus('success')
      formRef.current.reset()
      window.setTimeout(() => setStatus('idle'), 5000)
      return
    }

    const lastSubmission = localStorage.getItem('lastContactSubmission')
    if (lastSubmission && Date.now() - Number.parseInt(lastSubmission, 10) < 5 * 60 * 1000) {
      setStatus('error')
      setErrorMessage(t.contact.form.rateLimit)
      return
    }

    setStatus('sending')
    setErrorMessage('')

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
      localStorage.setItem('lastContactSubmission', Date.now().toString())
      setStatus('success')
      formRef.current.reset()
      window.setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(t.contact.form.error)
      console.error('EmailJS error:', error)
    }
  }

  const fields = [
    { id: 'from_name', name: 'from_name', type: 'text', label: t.contact.form.name },
    { id: 'reply_to', name: 'reply_to', type: 'email', label: t.contact.form.email },
    { id: 'subject', name: 'subject', type: 'text', label: t.contact.form.subject },
  ] as const

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor="website_url">Website</label>
        <input id="website_url" type="text" name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="divide-y divide-white-line border-y border-white-line">
        {fields.map((field) => (
          <div key={field.id} className="py-5">
            <label htmlFor={field.id} className="block text-sm font-semibold text-soft-white">{field.label}</label>
            <input
              id={field.id}
              name={field.name}
              type={field.type}
              placeholder={field.label}
              required
              className="mt-2 block w-full bg-transparent py-2 text-lg text-soft-white placeholder:text-line-gray focus:border-signal-pink focus:outline-none"
            />
          </div>
        ))}

        <div className="py-5">
          <label htmlFor="message" className="block text-sm font-semibold text-soft-white">{t.contact.form.message}</label>
          <textarea
            id="message"
            name="message"
            placeholder={t.contact.form.message}
            required
            rows={5}
            className="mt-2 block w-full resize-y bg-transparent py-2 text-lg leading-relaxed text-soft-white placeholder:text-line-gray focus:border-signal-pink focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className={`mt-7 inline-flex w-full items-center justify-center gap-3 px-6 py-4 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${status === 'success' ? 'bg-signal-pink text-ink' : status === 'error' ? 'border border-signal-pink text-signal-pink' : 'bg-signal-pink text-ink hover:bg-soft-white'}`}
      >
        {status === 'sending' && <span className="h-4 w-4 animate-spin border-2 border-ink border-t-transparent" aria-hidden="true" />}
        {status === 'success' && <CheckCircle size={18} aria-hidden="true" />}
        {status === 'error' && <WarningCircle size={18} aria-hidden="true" />}
        {status === 'idle' && <PaperPlaneRight size={18} aria-hidden="true" />}
        <span>{status === 'sending' ? t.contact.form.sending : status === 'success' ? t.contact.form.sent : status === 'error' ? t.contact.form.retry : t.contact.form.send}</span>
      </button>

      {status === 'success' && <p className="mt-4 flex items-center gap-2 text-sm text-signal-pink" role="status"><CheckCircle size={16} aria-hidden="true" />{t.contact.form.success}</p>}
      {status === 'error' && <p className="mt-4 flex items-center gap-2 text-sm text-signal-pink" role="alert"><WarningCircle size={16} aria-hidden="true" />{errorMessage}</p>}
    </form>
  )
}
