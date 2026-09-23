import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/** A few transform updates while a mouse moves; no render loop or React updates. */
export default function DepthSurface({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const surface = useRef<HTMLDivElement>(null)
  const enabled = useRef(false)
  const frame = useRef<number | null>(null)
  const bounds = useRef<DOMRect | null>(null)
  const pointer = useRef({ x: 0, y: 0 })

  function reset() {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    bounds.current = null
    const node = surface.current
    if (!node) return
    node.style.setProperty('--tilt-x', '0deg')
    node.style.setProperty('--tilt-y', '0deg')

    node.dataset.depthActive = 'false'
  }

  useEffect(() => {
    const capability = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 851px)')
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      enabled.current = capability.matches && !preference.matches
      if (surface.current) surface.current.dataset.depthEnabled = String(enabled.current)
      if (!enabled.current) reset()
    }
    update()
    capability.addEventListener('change', update)
    preference.addEventListener('change', update)
    const onVisibility = () => {
      if (document.hidden) reset()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      capability.removeEventListener('change', update)
      preference.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', onVisibility)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [])

  return (
    <div
      ref={surface}
      className={'depth-surface ' + className}
      onPointerEnter={(event) => {
        if (!enabled.current || event.pointerType !== 'mouse') return
        bounds.current = event.currentTarget.getBoundingClientRect()
        event.currentTarget.dataset.depthActive = 'true'
      }}
      onPointerMove={(event) => {
        if (!enabled.current || event.pointerType !== 'mouse' || !bounds.current) return
        pointer.current = { x: event.clientX, y: event.clientY }
        if (frame.current !== null) return
        frame.current = requestAnimationFrame(() => {
          frame.current = null
          const box = bounds.current,
            node = surface.current
          if (!box || !node) return
          const x = Math.max(-0.5, Math.min(0.5, (pointer.current.x - box.left) / box.width - 0.5))
          const y = Math.max(-0.5, Math.min(0.5, (pointer.current.y - box.top) / box.height - 0.5))
          node.style.setProperty('--tilt-x', (-y * 5).toFixed(2) + 'deg')
          node.style.setProperty('--tilt-y', (x * 5).toFixed(2) + 'deg')
        })
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </div>
  )
}
