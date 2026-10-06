import { useRef, type RefObject } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { useDialogLifecycle } from './useDialogLifecycle'

type Props = HTMLMotionProps<'div'> & {
  onClose: () => void
  initialFocusRef: RefObject<HTMLElement | null>
  returnFocusRef?: RefObject<HTMLElement | null>
}

// Mount inside AnimatePresence so focus and scroll are restored after exit completes.
export default function DialogPanel({ onClose, initialFocusRef, returnFocusRef, ...props }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogLifecycle({ open: true, dialogRef, initialFocusRef, onClose, returnFocusRef })
  return <motion.div {...props} ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" />
}
