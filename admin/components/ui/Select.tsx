'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value:        string
  onChange:     (val: string) => void
  options:      SelectOption[]
  placeholder?: string
  className?:   string
  label?:       string
}

export function Select({ value, onChange, options, placeholder = 'Seleccionar', className, label }: SelectProps) {
  const [open, setOpen]       = useState(false)
  const [pos,  setPos]        = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const triggerRef            = useRef<HTMLButtonElement>(null)
  const dropdownRef           = useRef<HTMLDivElement>(null)

  // Wait for client mount before using portals
  useEffect(() => { setMounted(true) }, [])

  function calcPos() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
  }

  function openDropdown() {
    calcPos()
    setOpen(v => !v)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const t = e.target as Node
      if (
        !triggerRef.current?.contains(t) &&
        !dropdownRef.current?.contains(t)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open])

  const selected     = options.find(o => o.value === value)
  const displayLabel = selected?.label ?? placeholder

  const dropdown = (
    <div
      ref={dropdownRef}
      style={{
        position:     'fixed',
        top:          pos.top,
        left:         pos.left,
        width:        pos.width,
        zIndex:       99999,
        background:   '#ffffff38',
        backdropFilter: 'blur(5px)',
        border:       '1px solid rgba(255,255,255,0.14)',
        borderRadius: '12px',
        overflow:     'hidden',
        boxShadow:    '0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
        padding:      '4px',
      }}
    >
      {options.map(opt => {
        const isSelected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false) }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-[10px] text-sm transition-colors duration-100 cursor-pointer text-left outline-none font-medium"
            style={{
              background: isSelected ? 'rgba(0,214,114,0.10)' : 'transparent',
              color:      isSelected ? '#00d672' : 'var(--text-muted)',
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                e.currentTarget.style.background = 'var(--bg-surface)'
                e.currentTarget.style.color      = 'var(--text)'
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color      = 'var(--text-muted)'
              }
            }}
          >
            <span>{opt.label}</span>
            {isSelected && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                   className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#00d672' }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className={clsx('relative w-full', className)}>
      {label && (
        <p className="text-[10px] font-bold uppercase tracking-[0.6px] mb-1.5"
           style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openDropdown}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer outline-none"
        style={{
          background: 'var(--bg-surface)',
          border:     open ? '1px solid rgba(0,214,114,0.4)' : '1px solid var(--border)',
          color:      selected ? 'var(--text)' : 'var(--text-muted)',
          boxShadow:  open ? '0 0 0 3px rgba(0,214,114,0.1)' : 'none',
        }}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown — rendered via portal into document.body to fully escape
          any backdrop-filter / transform stacking context on ancestors */}
      {open && mounted && createPortal(dropdown, document.body)}
    </div>
  )
}
