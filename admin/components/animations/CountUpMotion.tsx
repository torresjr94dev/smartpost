'use client'

// Source: reactbits.dev/text-animations/count-up
// Dependency: motion (npm install motion)
import { useInView, useMotionValue, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'

interface CountUpMotionProps {
  to: number
  from?: number
  direction?: 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
  startWhen?: boolean
  /** Custom separator (e.g. "," for "1,000") */
  separator?: string
  onStart?: () => void
  onEnd?: () => void
}

export default function CountUpMotion({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 1.8,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
}: CountUpMotionProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === 'down' ? to : from)
  const damping   = 20 + 40 * (1 / duration)
  const stiffness = 100 * (1 / duration)
  const springValue = useSpring(motionValue, { damping, stiffness })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  const getDecimalPlaces = (num: number): number => {
    const str = num.toString()
    if (str.includes('.')) {
      const decimals = str.split('.')[1]
      if (parseInt(decimals) !== 0) return decimals.length
    }
    return 0
  }

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to))

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0
      const opts: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      }
      const formatted = Intl.NumberFormat('en-US', opts).format(latest)
      return separator ? formatted.replace(/,/g, separator) : formatted
    },
    [maxDecimals, separator]
  )

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === 'down' ? to : from)
    }
  }, [from, to, direction, formatValue])

  useEffect(() => {
    if (isInView && startWhen) {
      if (typeof onStart === 'function') onStart()
      const t1 = setTimeout(() => {
        motionValue.set(direction === 'down' ? from : to)
      }, delay * 1000)
      const t2 = setTimeout(() => {
        if (typeof onEnd === 'function') onEnd()
      }, delay * 1000 + duration * 1000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [isInView, startWhen, motionValue, direction, from, to, delay, onStart, onEnd, duration])

  useEffect(() => {
    return springValue.on('change', (latest: number) => {
      if (ref.current) ref.current.textContent = formatValue(latest)
    })
  }, [springValue, formatValue])

  return <span className={className} ref={ref} />
}
