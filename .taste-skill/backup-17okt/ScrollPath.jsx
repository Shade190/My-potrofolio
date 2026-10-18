import React, { useEffect, useRef, useState } from 'react'

// Scroll "journey line". A fine line draws down the page as you scroll, wraps
// around the featured projects grid as you pass it, then continues to the foot
// of the document. The path is defined once in document coordinates (measured
// from the projects grid) and revealed by stroke-dashoffset driven by scroll
// progress, with the whole line translated up as you scroll — so it reads as a
// single line travelling through the page rather than a static picture.
//
// White stroke + mix-blend-mode difference keeps the line legible on both the
// putty sections and the ink sections automatically. Purely decorative.
export default function ScrollPath() {
  const pathRef = useRef(null)
  const [d, setD] = useState('')
  const [len, setLen] = useState(0)
  const [offset, setOffset] = useState(1e6)
  const [translate, setTranslate] = useState(0)

  // Build the document-space path from the projects grid's position.
  useEffect(() => {
    const build = () => {
      const lineX = window.innerWidth < 768 ? 22 : 34
      const wrap = document.getElementById('projects-grid')
      const docH = document.documentElement.scrollHeight
      if (!wrap) {
        setD(`M ${lineX} 0 L ${lineX} ${docH}`)
        return
      }
      const r = wrap.getBoundingClientRect()
      const top = r.top + window.scrollY - 18
      const bottom = r.bottom + window.scrollY + 18
      // The loop's left edge stays right of the running line so the connector
      // is short; clamp so a narrow viewport still yields a sensible loop.
      let left = Math.max(lineX + 56, r.left)
      const right = Math.min(r.right, window.innerWidth - 24)
      if (right - left < 120) left = right - 120
      const rx = 16

      const p =
        `M ${lineX} 0 ` +
        `L ${lineX} ${top} ` +
        `L ${left + rx} ${top} ` +
        `Q ${left} ${top} ${left} ${top + rx} ` +
        `L ${left} ${bottom - rx} ` +
        `Q ${left} ${bottom} ${left + rx} ${bottom} ` +
        `L ${right - rx} ${bottom} ` +
        `Q ${right} ${bottom} ${right} ${bottom - rx} ` +
        `L ${right} ${top + rx} ` +
        `Q ${right} ${top} ${right - rx} ${top} ` +
        `L ${left + rx} ${top} ` +
        `L ${lineX} ${top} ` +
        `L ${lineX} ${docH}`
      setD(p)
    }
    build()
    window.addEventListener('resize', build)
    const t = window.setTimeout(build, 600)
    return () => {
      window.removeEventListener('resize', build)
      window.clearTimeout(t)
    }
  }, [])

  // Measure the real path length once the path exists.
  useEffect(() => {
    if (pathRef.current && d) {
      setLen(pathRef.current.getTotalLength())
    }
  }, [d])

  // Drive reveal from scroll progress.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = Math.max(1, doc.scrollHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, window.scrollY / max))
      setOffset(len * (1 - p))
      setTranslate(-window.scrollY)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [len])

  return (
    <svg
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-[14]"
      style={{ mixBlendMode: 'difference' }}
    >
      <g transform={`translate(0 ${translate})`}>
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len || 1e6}
          strokeDashoffset={offset}
        />
      </g>
    </svg>
  )
}