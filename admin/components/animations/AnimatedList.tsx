'use client'

// Source: reactbits.dev/components/animated-list
// Dependency: motion (npm install motion)
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type MouseEventHandler,
  type UIEvent,
} from 'react'
import { motion, useInView } from 'motion/react'

// ─── AnimatedItem ─────────────────────────────────────────────────
interface AnimatedItemProps {
  children: ReactNode
  delay?: number
  index: number
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5, once: false })

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.92, opacity: 0, y: 8 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.92, opacity: 0, y: 8 }}
      transition={{ duration: 0.22, delay, ease: [0.16, 1, 0.3, 1] }}
      className="mb-2 cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

// ─── AnimatedList ─────────────────────────────────────────────────
interface AnimatedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number, isSelected: boolean) => ReactNode
  onItemSelect?: (item: T, index: number) => void
  showGradients?: boolean
  enableArrowNavigation?: boolean
  className?: string
  displayScrollbar?: boolean
  initialSelectedIndex?: number
  /** Gradient color — match your --bg */
  gradientColor?: string
}

export function AnimatedList<T>({
  items = [],
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  displayScrollbar = false,
  initialSelectedIndex = -1,
  gradientColor = 'var(--bg)',
}: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex)
  const [keyboardNav, setKeyboardNav]     = useState(false)
  const [topOpacity, setTopOpacity]       = useState(0)
  const [bottomOpacity, setBottomOpacity] = useState(1)

  const handleMouseEnter = useCallback((index: number) => setSelectedIndex(index), [])
  const handleClick = useCallback(
    (item: T, index: number) => {
      setSelectedIndex(index)
      onItemSelect?.(item, index)
    },
    [onItemSelect]
  )

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement
    setTopOpacity(Math.min(scrollTop / 50, 1))
    const bottom = scrollHeight - (scrollTop + clientHeight)
    setBottomOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottom / 50, 1))
  }

  useEffect(() => {
    if (!enableArrowNavigation) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex(p => Math.min(p + 1, items.length - 1))
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex(p => Math.max(p - 1, 0))
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        onItemSelect?.(items[selectedIndex], selectedIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation])

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return
    const container = listRef.current
    const el = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null
    if (el) {
      const margin = 50
      const { scrollTop, clientHeight } = container
      const { offsetTop, offsetHeight } = el
      if (offsetTop < scrollTop + margin) {
        container.scrollTo({ top: offsetTop - margin, behavior: 'smooth' })
      } else if (offsetTop + offsetHeight > scrollTop + clientHeight - margin) {
        container.scrollTo({ top: offsetTop + offsetHeight - clientHeight + margin, behavior: 'smooth' })
      }
    }
    setKeyboardNav(false)
  }, [selectedIndex, keyboardNav])

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className="overflow-y-auto"
        style={{ scrollbarWidth: displayScrollbar ? 'thin' : 'none' }}
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            delay={index * 0.04}
            index={index}
            onMouseEnter={() => handleMouseEnter(index)}
            onClick={() => handleClick(item, index)}
          >
            {renderItem(item, index, selectedIndex === index)}
          </AnimatedItem>
        ))}
      </div>

      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-10 pointer-events-none transition-opacity duration-300"
            style={{
              background: `linear-gradient(to bottom, ${gradientColor}, transparent)`,
              opacity: topOpacity,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none transition-opacity duration-300"
            style={{
              background: `linear-gradient(to top, ${gradientColor}, transparent)`,
              opacity: bottomOpacity,
            }}
          />
        </>
      )}
    </div>
  )
}
