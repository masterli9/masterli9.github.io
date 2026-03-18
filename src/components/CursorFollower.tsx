import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CursorFollower = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring animation for the follower delay
  // stiffness: tension of the spring (higher = faster)
  // damping: strength of opposing force (higher = less oscillation)
  const springConfig = { damping: 25, stiffness: 120 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on devices with fine pointer (mouse)
    // We check this once on mount.
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const checkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Determine if the element is "clickable"
      const isClickable =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        // Check for specific clickable class if used in project
        target.classList.contains('clickable') ||
        // Fallback: check computed style (can be expensive, use sparingly if perf issues arise)
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', checkHover);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', checkHover);
    };
  }, [cursorX, cursorY, isVisible]);

  // Don't render until we have a mouse position
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <motion.div
        animate={{
          x: isHovering ? "-50%" : "16px",
          y: isHovering ? "-50%" : "18px",
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.5
        }}
      >
        <motion.div
          className="bg-white"
          style={{
            width: 9,
            height: 9
          }}
          animate={{
            scale: isHovering ? 3 : 1,
            borderRadius: isHovering ? "50%" : "0%",
            rotate: isHovering ? 0 : 360
          }}
          transition={{
            scale: { type: "spring", stiffness: 300, damping: 20 },
            borderRadius: { duration: 0.2 },
            rotate: isHovering
              ? { duration: 0.5, ease: "backOut" }
              : { duration: 3, repeat: Infinity, ease: "linear" }
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default CursorFollower;
