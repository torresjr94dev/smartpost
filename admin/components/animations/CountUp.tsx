'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  /** Final numeric value */
  end: number
  /** Animation duration in ms (default: 1400) */
  duration?: number
  className?: string
  /** Custom formatter — receives the live value */
  formatter?: (n: number) => string
  /** Delay before starting (ms) */
  delay?: number
}

/** Animate a number from 0 → end with ease-out-cubic */
export function CountUp({
  end,
  duration = 1400,
  className = '',
  formatter,
  delay = 0,
}: CountUpProps) {
  const [value, setValue] = useState(0)
  const frameRef   = useRef<number>(0)
  const startRef   = useRef<number | null>(null)
  const started    = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const animate = (ts: number) => {
        if (!startRef.current) startRef.current = ts
        const progress = Math.min((ts - startRef.current) / duration, 1)
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * end))
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate)
        }
      }
      frameRef.current = requestAnimationFrame(animate)
      started.current = true
    }, delay)

    return () => {
      clearTimeout(t)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [end, duration, delay])

  const display = formatter ? formatter(value) : value.toLocaleString()

  return <span className={className}>{display}</span>
}

// ─── BlurText ─────────────────────────────────────────────────────
interface BlurTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
  delay?: number
  as?: keyof React.JSX.IntrinsicElements
}

/** Animates text in with a blur + slide-up effect */
export function BlurText({ text, className = '', style: styleProp, delay = 0, as: Tag = 'span' }: BlurTextProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay + 50)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <Tag
      className={className}
      style={{
        ...styleProp,
        display: 'inline-block',
        opacity: visible ? 1 : 0,
        filter:  visible ? 'blur(0)' : 'blur(8px)',
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: `opacity 0.55s ease, filter 0.55s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)`,
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, filter, transform',
      }}
    >
      {text}
    </Tag>
  )
}

// ─── FadeContent ──────────────────────────────────────────────────
interface FadeContentProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

/** Fade + slide-up wrapper for section reveals */
export function FadeContent({ children, delay = 0, className = '' }: FadeContentProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
