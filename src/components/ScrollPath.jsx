import React, { useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// SCROLL RAIL — a hand-drawn line that winds down the right edge as you scroll.
//
// Taken directly from the reference the user pointed at
// (zxx.c8nayrntn2.qzz.io, the SMK Plus Pelita Nusantara site). Reading its DOM
// showed exactly how that line is built, and it is a much nicer gesture than a
// straight bar:
//
//   • One faint full-height path that *winds* left and right as it descends —
//     not a straight rule, a drawn line with a wobble.
//   • A second path on top of it, drawn in with `stroke-dasharray` +
//     `stroke-dashoffset`, so the solid stroke grows downward from the top as
//     the reader scrolls. This is the line "appearing as you scroll".
//   • A third, slightly offset winding path that draws in a touch behind it, so
//     the head reads as a pen stroke rather than a single rule.
//   • A small marker riding the head of the drawn stroke.
//
// The reference lives on the landing page (it is mounted with the page, not the
// loader) and so does this. It is fixed to the right edge, vertically centred,
// white + `mix-blend-mode: difference` so it stays legible on the putty and ink
// sections alike. Decorative: aria-hidden, pointer-events none, and it renders
// nothing under `prefers-reduced-motion` or below 1024px.
// ---------------------------------------------------------------------------

// The three winding strokes, authored in a 12 x 414 box (the reference's own
// proportions). Each is a bezier chain that drifts a few px either side of the
// centre line, so the line visibly meanders instead of running straight.
const RIBBON = {
  w: 12,
  h: 414,
  guide: 'M6 3 C4 83 8 193 5 290 S6 386 5 411',
  main: 'M5 3 C3 97 7 221 4 411',
  echo: 'M9 17 C7 124 10 262 7 392',
}

const RAIL_H = 46 // percent of viewport height, matching the reference's h-[46vh]

export default function ScrollPath({ isDark = false }) {
  const [reduce, setReduce] = useState(false)
  const [ready, setReady] = useState(false)
  const mainRef = useRef(null)
  const echoRef = useRef(null)
  const dotRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // Path lengths, measured once the paths are in the DOM. Dash-driven drawing
  // needs the real length of each curve.
  const [lens, setLens] = useState({ main: 0, echo: 0 })
  useEffect(() => {
    if (reduce) return
    const m = mainRef.current
    const e = echoRef.current
    if (!m || !e) return
    setLens({ main: m.getTotalLength(), echo: e.getTotalLength() })
    setReady(true)
  }, [reduce])

  // One rAF loop. Reads Lenis where present so the draw is already interpolated
  // and can never desync from the smoothed scroll.
  //
  // This writes STRAIGHT TO THE DOM rather than through React state. The rail is
  // an animation that changes every frame; routing it through `setState` made
  // React reconcile the whole component ~60 times a second for the entire life
  // of the page, and called `getPointAtLength` inside render, which is the most
  // expensive geometry query SVG offers. Both are gone: the dash offsets are set
  // as attributes and the marker as `cx`/`cy`, only when the value actually
  // changed, and the walk is skipped unless the page is visibly moving.
  useEffect(() => {
    if (reduce || !ready) return

    let last = -1
    let lastLens = lens

    const draw = (p) => {
      const m = mainRef.current
      const e = echoRef.current
      const d = dotRef.current
      if (!m || !e || !d) return

      // `dasharray` = full length, `dashoffset` = what is left to draw.
      m.setAttribute('stroke-dashoffset', String(lastLens.main * (1 - p)))
      e.setAttribute('stroke-dashoffset', String(lastLens.echo * (1 - p * 0.92)))

      // Where the drawn end of the line actually is, so the dot sits on the
      // curve even where the curve has drifted sideways.
      const at = m.getPointAtLength(lastLens.main * p)
      d.setAttribute('cx', String(at.x))
      d.setAttribute('cy', String(at.y))
    }

    const tick = () => {
      const y = window.__lenis ? window.__lenis.scroll : window.scrollY
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, y / max))
      // Sub-pixel moves are invisible on a 414px-tall rail; skipping them keeps
      // the geometry query off most idle frames.
      if (Math.abs(p - last) > 0.0004) {
        last = p
        draw(p)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    draw(0)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [reduce, ready, lens])

  if (reduce) return null

  // Colour flips with the field. On putty the walked line is ink; on the dark
  // slides it is white. A blend mode was tried first and rendered invisibly in
  // this stack, so the rail simply wears the palette directly.
  const ink = isDark ? '#ffffff' : '#000000'

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-3 xl:right-5 top-1/2 -translate-y-1/2 z-[14] hidden lg:block"
      style={{ width: RIBBON.w, height: `${RAIL_H}vh` }}
    >
      <svg
        className="block overflow-visible w-full h-full"
        viewBox={`0 0 ${RIBBON.w} ${RIBBON.h}`}
        preserveAspectRatio="none"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* The road: the full winding line, faint, so progress is read against a
            visible total rather than appearing from nothing. */}
        <path d={RIBBON.guide} stroke={ink} strokeOpacity={0.3} strokeWidth={1.25} />

        {/* The walked part: draws downward from the top as the reader scrolls.
            The offsets are written by the rAF loop, not by render. */}
        <path
          ref={mainRef}
          d={RIBBON.main}
          stroke={ink}
          strokeWidth={3}
          strokeDasharray={lens.main || 1e6}
          strokeDashoffset={lens.main ? lens.main : 1e6}
        />

        {/* A second, offset stroke a step behind the first: the two together give
            the drawn line the doubled, sketched quality of a marker stroke. */}
        <path
          ref={echoRef}
          d={RIBBON.echo}
          stroke={ink}
          strokeOpacity={0.5}
          strokeWidth={1.5}
          strokeDasharray={lens.echo || 1e6}
          strokeDashoffset={lens.echo ? lens.echo : 1e6}
        />

        {/* The marker at the head of the drawn stroke. */}
        <circle ref={dotRef} cx={RIBBON.w / 2} cy="0" r={3.5} fill={ink} stroke="none" />
      </svg>
    </div>
  )
}
