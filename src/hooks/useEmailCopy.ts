import { useEffect, useRef, useState } from 'react'

export function useEmailCopy() {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const request = useRef(0)
  useEffect(() => () => { request.current++; window.clearTimeout(timer.current) }, [])
  const copyEmail = async () => {
    const id = ++request.current
    window.clearTimeout(timer.current)
    setCopied(false)
    setCopyFailed(false)
    try {
      await navigator.clipboard.writeText('andrej.zdvorak.123@gmail.com')
      if (id !== request.current) return
      setCopied(true)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      if (id === request.current) setCopyFailed(true)
    }
  }
  return { copied, copyFailed, copyEmail }
}
