import { useMotionPreference } from '../hooks/useMotionPreference'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CursorFollower = () => {
  const reducedMotion = useMotionPreference()
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const cursorXSpring = useSpring(cursorX, { damping: 28, stiffness: 180 })
  const cursorYSpring = useSpring(cursorY, { damping: 28, stiffness: 180 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)')
    if (!mediaQuery.matches || reducedMotion) return

    const moveCursor = (event: MouseEvent) => {
      cursorX.set(event.clientX)
      cursorY.set(event.clientY)
      setIsVisible(true)
    }
    const checkHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isClickable =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('clickable') ||
        window.getComputedStyle(target).cursor === 'pointer'

      setIsHovering(Boolean(isClickable))
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', checkHover)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', checkHover)
    }
  }, [cursorX, cursorY, reducedMotion])

  if (!isVisible || reducedMotion) return null

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[300] hidden mix-blend-difference md:block"
      style={{ x: cursorXSpring, y: cursorYSpring }}
      aria-hidden="true"
    >
      <motion.div
        animate={{
          x: isHovering ? '-50%' : '16px',
          y: isHovering ? '-50%' : '18px',
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.5 }}
      >
        <motion.div
          className="bg-signal-pink"
          animate={{
            scale: isHovering ? 1.5 : 1,
            opacity: isHovering ? 0.95 : 0.75,
            rotate: isHovering ? 0 : 360,
          }}
          transition={{
            scale: { duration: 0.16, ease: 'easeOut' },
            opacity: { duration: 0.16, ease: 'easeOut' },
            rotate: isHovering
              ? { duration: 0.5, ease: 'backOut' }
              : { duration: 3, repeat: Infinity, ease: 'linear' },
          }}
          style={{ width: 9, height: 9 }}
        />
      </motion.div>
    </motion.div>
  )
}

export default CursorFollower
