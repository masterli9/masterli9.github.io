import { useEffect, useEffectEvent, type RefObject } from 'react'

interface DialogOptions {
  open: boolean
  dialogRef: RefObject<HTMLElement | null>
  initialFocusRef: RefObject<HTMLElement | null>
  onClose: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
}

interface Entry { element: HTMLElement; close: () => void }
const stack: Entry[] = []
const originalInert = new Map<HTMLElement, boolean>()
let originalOverflow = ''
let originalPriority = ''

function updateBackground() {
  for (const [element, inert] of originalInert) element.inert = inert
  const top = stack.at(-1)?.element
  if (!top) { originalInert.clear(); return }
  let branch: HTMLElement = top
  while (branch.parentElement) {
    for (const sibling of branch.parentElement.children) {
      if (sibling === branch || !(sibling instanceof HTMLElement)) continue
      if (sibling.hasAttribute('data-dialog-backdrop')) continue
      if (!originalInert.has(sibling)) originalInert.set(sibling, sibling.inert)
      sibling.inert = true
    }
    branch = branch.parentElement
    if (branch === document.body) break
  }
}

function focusable(element: HTMLElement) {
  return Array.from(element.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]'))
    .filter((node) => node.tabIndex >= 0 && !node.matches(':disabled') && !node.closest('[inert]') && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden')
}

export function useDialogLifecycle({ open, dialogRef, initialFocusRef, onClose, returnFocusRef }: DialogOptions) {
  const close = useEffectEvent(onClose)
  useEffect(() => {
    const element = dialogRef.current
    if (!open || !element) return
    const returnTarget = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    const entry = { element, close: () => close() }
    if (!stack.length) {
      originalOverflow = document.body.style.getPropertyValue('overflow')
      originalPriority = document.body.style.getPropertyPriority('overflow')
      document.body.style.setProperty('overflow', 'hidden')
    }
    stack.push(entry)
    updateBackground()
    const initial = initialFocusRef.current ?? focusable(element)[0] ?? element
    initial.focus({ preventScroll: true })
    const keydown = (event: KeyboardEvent) => {
      if (stack.at(-1) !== entry) return
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); entry.close() }
      if (event.key !== 'Tab') return
      const targets = focusable(element)
      const index = targets.indexOf(document.activeElement as HTMLElement)
      if (!targets.length) { event.preventDefault(); element.focus(); return }
      if (index < 0 || (event.shiftKey && index === 0) || (!event.shiftKey && index === targets.length - 1)) {
        event.preventDefault()
        targets[event.shiftKey ? targets.length - 1 : 0].focus()
      }
    }
    const focusin = (event: FocusEvent) => {
      if (stack.at(-1) === entry && !element.contains(event.target as Node)) (focusable(element)[0] ?? element).focus({ preventScroll: true })
    }
    document.addEventListener('keydown', keydown, true)
    document.addEventListener('focusin', focusin)
    const observer = new MutationObserver(updateBackground)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', keydown, true)
      document.removeEventListener('focusin', focusin)
      const wasTop = stack.at(-1) === entry
      stack.splice(stack.indexOf(entry), 1)
      updateBackground()
      if (!stack.length) {
        if (originalOverflow) document.body.style.setProperty('overflow', originalOverflow, originalPriority)
        else document.body.style.removeProperty('overflow')
      }
      if (wasTop && returnTarget?.isConnected && !returnTarget.closest('[inert]')) returnTarget.focus({ preventScroll: true })
    }
  }, [open, dialogRef, initialFocusRef, returnFocusRef])
}
