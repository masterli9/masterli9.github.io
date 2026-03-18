import { useState, useRef, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, CheckCircle, AlertCircle, User, Mail, MessageSquare, Tag } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { useLanguage } from '../i18n/useLanguage'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  const { t } = useLanguage()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return

    setStatus('sending')
    setErrorMessage('')

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      setStatus('success')
      formRef.current.reset()
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(t.contact.form.error)
      console.error('EmailJS error:', error)
    }
  }

  const inputFields = [
    { name: 'from_name', type: 'text', placeholder: t.contact.form.name, icon: User, required: true },
    { name: 'reply_to', type: 'email', placeholder: t.contact.form.email, icon: Mail, required: true },
    { name: 'subject', type: 'text', placeholder: t.contact.form.subject, icon: Tag, required: true },
  ]

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="p-6 md:p-8 border border-black/10 rounded-3xl bg-white/60 backdrop-blur-md shadow-xl">
        <div className="space-y-5">
          {inputFields.map((field, idx) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx, duration: 0.5 }}
              className="relative group"
            >
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                focused === field.name ? 'text-brand-blue' : 'text-text-mutedOnLight/40'
              }`}>
                <field.icon size={18} />
              </div>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                onFocus={() => setFocused(field.name)}
                onBlur={() => setFocused(null)}
                className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-transparent bg-black/[0.03] text-text-onLight placeholder:text-text-mutedOnLight/50 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-300"
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative group"
          >
            <div className={`absolute left-4 top-5 transition-colors duration-300 ${
              focused === 'message' ? 'text-brand-blue' : 'text-text-mutedOnLight/40'
            }`}>
              <MessageSquare size={18} />
            </div>
            <textarea
              name="message"
              placeholder={t.contact.form.message}
              required
              rows={4}
              onFocus={() => setFocused('message')}
              onBlur={() => setFocused(null)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-transparent bg-black/[0.03] text-text-onLight placeholder:text-text-mutedOnLight/50 focus:outline-none focus:border-brand-blue focus:bg-white transition-all duration-300 resize-none"
            />
          </motion.div>
        </div>

        <motion.button
          type="submit"
          disabled={status === 'sending'}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: status === 'sending' ? 1 : 1.02 }}
          whileTap={{ scale: status === 'sending' ? 1 : 0.98 }}
          className={`cursor-pointer mt-6 w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-300 ${
            status === 'success' 
              ? 'bg-brand-neonGreen text-background-dark' 
              : status === 'error'
              ? 'bg-red-500'
              : 'bg-brand-blue hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]'
          } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {status === 'sending' ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>{t.contact.form.sending}</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle size={20} />
              <span>{t.contact.form.sent}</span>
            </>
          ) : status === 'error' ? (
            <>
              <AlertCircle size={20} />
              <span>{t.contact.form.retry}</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>{t.contact.form.send}</span>
            </>
          )}
        </motion.button>

        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-brand-neonGreen font-medium text-sm"
          >
            {t.contact.form.success}
          </motion.p>
        )}

        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-red-500 font-medium text-sm"
          >
            {errorMessage}
          </motion.p>
        )}
      </div>
    </motion.form>
  )
}
