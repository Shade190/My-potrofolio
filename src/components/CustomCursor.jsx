import React, { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// CUSTOM CURSOR + PUSH-AWAY
//
// The cursor is the usual dot + tracking ring. On top of that it does one extra
// thing the user asked for: as the pointer approaches an element marked with
// `data-push`, that element is nudged *away* from the cursor, so near-targets
// lean back slightly as you come at them.
//
// How the push works:
//   • Every element carrying `data-push` is collected once (and re-collected on
//     a MutationObserver, because the project grid re-renders when filters
//     change).
//   • On each pointer move we measure the distance from the cursor to each
//     element's centre. Inside a radius, the element is translated directly away
//     from the cursor by an eased amount (`maxPush * falloff`), expressed in
//     percentages of the element so it scales with size.
//   • The push is written straight to `element.style.transform` — no React state
//     per element, no re-render, so this stays cheap even with several cards.
//
// It is fought over nothing: the effect is skipped entirely for coarse pointers
// (touch) and when the user asks for reduced motion, and the transform is
// cleared the moment the pointer leaves the radius.
// ---------------------------------------------------------------------------

// Only one element uses this (the owner portrait), so the numbers are tuned for
// a single, deliberate gesture: the photo leans back noticeably as you come at
// it, rather than the whisper-subtle nudge a whole grid of cards would need.
const PUSH_RADIUS = 260 // how near the cursor must be to push, in px
const PUSH_MAX = 34 // furthest the photo leans away, in px

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    // Only show on devices with fine pointer (mouse/trackpad)
    if (window.matchMedia('(pointer: coarse)').matches) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Live list of push targets. Kept in a ref-like closure var and refreshed
    // whenever the DOM changes, so filter-driven re-renders are picked up.
    let targets = []
    const collect = () => {
      targets = Array.from(document.querySelectorAll('[data-push]'))
    }
    collect()

    let raf = 0
    let pointer = { x: -9999, y: -9999 }
    // Last written position, so we skip frames where the pointer has not moved.
    let lastX = -9999
    let lastY = -9999
    let shown = false
    let hoverState = null

    // Move the dot and ring by writing transforms straight to the nodes. Doing
    // this through React state meant a full reconcile of the app on every
    // `mousemove` — hundreds per second — which is exactly the kind of work that
    // shows up as stutter while scrolling with the pointer over the page.
    const place = (x, y) => {
      const dot = dotRef.current
      const ring = ringRef.current
      if (dot) dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (ring) {
        ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      }
    }

    // Push is applied on a rAF tick rather than inside the mousemove handler so
    // we do at most one geometry pass per frame, however fast the pointer moves.
    const applyPush = () => {
      raf = 0
      // Reposition the cursor first, then push — both in the same frame, so the
      // cursor and the leaning photo never disagree about where the pointer is.
      if (pointer.x !== lastX || pointer.y !== lastY) {
        lastX = pointer.x
        lastY = pointer.y
        if (!shown && pointer.x > -9999) {
          shown = true
          if (dotRef.current) dotRef.current.style.opacity = '1'
          if (ringRef.current) ringRef.current.style.opacity = '1'
        }
        place(pointer.x, pointer.y)
      }
      if (reduce) return

      for (const el of targets) {
        const rect = el.getBoundingClientRect()
        // getBoundingClientRect reflects the *pushed* transform, so to avoid the
        // push feeding itself we recover the untransformed centre by removing
        // the offset we last wrote.
        const last = el.__push || { x: 0, y: 0 }
        const cx = rect.left + rect.width / 2 - last.x
        const cy = rect.top + rect.height / 2 - last.y

        const dx = cx - pointer.x
        const dy = cy - pointer.y
        const dist = Math.hypot(dx, dy)

        if (dist > PUSH_RADIUS || dist === 0) {
          if (last.x || last.y) {
            el.style.transform = ''
            el.__push = { x: 0, y: 0 }
          }
          continue
        }

        // Ease-out falloff: strongest at the centre, zero at the radius edge.
        const falloff = 1 - dist / PUSH_RADIUS
        const ease = falloff * falloff * (3 - 2 * falloff)
        const mag = PUSH_MAX * ease
        // Normalised direction away from the cursor. Guard against a dead-zero
        // divisor when the pointer sits exactly on the centre.
        const nx = dx / dist
        const ny = dy / dist
        const px = nx * mag
        const py = ny * mag

        el.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`
        el.__push = { x: px, y: py }
      }
    }

    const schedulePush = () => {
      if (!raf) raf = requestAnimationFrame(applyPush)
    }

    // The ring's hover state is a class toggle, not React state, for the same
    // reason: the pointer crosses dozens of elements a second.
    const setHover = (on) => {
      if (hoverState === on) return
      hoverState = on
      const ring = ringRef.current
      if (!ring) return
      ring.classList.toggle('cursor-ring-hot', on)
    }

    const handleMouseMove = (e) => {
      const target = e.target
      const isInteractive =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.clickable-image') ||
        target.closest('input') ||
        target.closest('textarea')
      setHover(!!isInteractive)

      pointer = { x: e.clientX, y: e.clientY }
      schedulePush()
    }

    const handleMouseLeave = () => {
      shown = false
      if (dotRef.current) dotRef.current.style.opacity = '0'
      if (ringRef.current) ringRef.current.style.opacity = '0'
      pointer = { x: -9999, y: -9999 }
      lastX = -9999
      lastY = -9999
      schedulePush()
    }

    // The cursor starts hidden and is revealed on the first real pointer move,
    // so a touch device that reports a fine pointer never shows a stray dot.
    if (dotRef.current) dotRef.current.style.opacity = '0'
    if (ringRef.current) ringRef.current.style.opacity = '0'

    // Watch for cards being added/removed (filters, lazy sections).
    const mo = new MutationObserver(collect)
    mo.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      mo.disconnect()
      if (raf) cancelAnimationFrame(raf)
      // Leave nothing transformed behind.
      for (const el of targets) {
        el.style.transform = ''
        el.__push = { x: 0, y: 0 }
      }
    }
    // Mounted once for the life of the page. `visible` is no longer state, so
    // this never tears down mid-scroll.
  }, [])

  return (
    <>
      {/* Central pointer dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-black pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform, opacity' }}
      />
      {/* Outer tracking ring. The `cursor-ring-hot` class (see index.css) is the
          hover growth — the transition lives in CSS so the browser can composite
          it instead of React re-rendering two nodes on every pointer crossing. */}
      <div
        ref={ringRef}
        className="cursor-ring fixed top-0 left-0 w-7 h-7 rounded-full border border-black/40 pointer-events-none z-[9998]"
        style={{ willChange: 'transform, width, height, opacity' }}
      />
    </>
  )
}
