import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CursorFollower = () => {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const cursorXSpring = useSpring(cursorX, { damping: 28, stiffness: 180 })
  const cursorYSpring = useSpring(cursorY, { damping: 28, stiffness: 180 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)')
    if (!mediaQuery.matches) return

    const moveCursor = (event: MouseEvent) => {
      cursorX.set(event.clientX)
      cursorY.set(event.clientY)
      setIsVisible(true)
    }
    const checkHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      setIsHovering(Boolean(target.closest('a, button, input, textarea, select, [role="button"]')))
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', checkHover)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', checkHover)
    }
  }, [cursorX, cursorY])

  if (!isVisible) return null

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[300] hidden mix-blend-difference md:block"
      style={{ x: cursorXSpring, y: cursorYSpring }}
      aria-hidden="true"
    >
      <motion.div
        className="bg-signal-pink"
        animate={{ scale: isHovering ? 1.5 : 1, opacity: isHovering ? 0.95 : 0.75 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        style={{ width: 9, height: 9, transform: 'translate(10px, 10px)' }}
      />
    </motion.div>
  )
}

export default CursorFollower
