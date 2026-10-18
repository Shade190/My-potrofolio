import React, { useEffect, useRef, useState } from 'react'

// Opening curtain. The site is an editorial "gallery" that begins on putty
// paper and descends into space, so the loader opens the same way: a paper
// field, the name set in the display serif, a fine rule that fills like a
// gallery door opening, and a counter. No spinner — the pace is deliberate.
//
// What changed from the previous version:
//   • It now waits on real work instead of a fixed 1800ms sleep. Two true
//     signals gate the reveal — the display fonts being ready (`document.fonts`)
//     and the WebGL scene having painted its first frame (`window.__sceneReady`,
//     dispatched by Scene3D). The curtain lifts as soon as both are in, so a
//     fast machine is not held back and a slow one is not released early.
//   • A short floor (~650ms) keeps the opening from looking like a flicker, and
//     a hard cap (~4s) guarantees release even if a signal never arrives.
//   • The progress counter is driven toward the real readiness value rather than
//     a scripted ease, so what it shows means something.
//   • The owner's portrait appears on the curtain itself, so the creator is
//     present from the very first frame.
export default function Loader({ onDone }) {
  const [progress, setProgress] = useState(0.04)
  const [leaving, setLeaving] = useState(false)
  const [photoOk, setPhotoOk] = useState(true)

  // Live readiness, read from the animation loop. A ref so the loop never has
  // to be torn down and rebuilt when a signal flips.
  const readyRef = useRef({ fonts: false, scene: false })

  useEffect(() => {
    const start = performance.now()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // The curtain should feel composed, but never be the reason a page is slow.
    // Floor is the minimum dwell; cap is the latest it may ever release.
    const FLOOR_MS = reduce ? 120 : 650
    const CAP_MS = reduce ? 600 : 4000
    let finished = false

    // Signal 1 — webfonts. `document.fonts.ready` resolves when the faces the
    // page actually needs have loaded (or failed). If the API is missing, assume
    // ready so we never stall on an old browser.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        readyRef.current.fonts = true
      })
    } else {
      readyRef.current.fonts = true
    }

    // Signal 2 — the WebGL scene's first painted frame. If the scene mounted and
    // painted before this effect ran, the global flag is already set.
    if (window.__sceneReady) {
      readyRef.current.scene = true
    } else {
      const onSceneReady = () => {
        readyRef.current.scene = true
      }
      window.addEventListener('scene-ready', onSceneReady)
      // Stash the handler so the cleanup below can remove it.
      readyRef.current._onSceneReady = onSceneReady
    }

    const finish = () => {
      if (finished) return
      finished = true
      readyRef.current.fonts = true
      readyRef.current.scene = true
      setProgress(1)
      setLeaving(true)
      // Let the curtain finish its exit before telling the app it's gone.
      window.setTimeout(() => onDone && onDone(), 900)
    }

    // Drive the counter from a timer, not requestAnimationFrame. rAF can be
    // throttled or starved (background tabs, software rendering), which left the
    // number sitting at 000 and then snapping to 100. A timer always advances.
    const id = window.setInterval(() => {
      const elapsed = performance.now() - start
      const t = Math.min(elapsed / FLOOR_MS, 1)

      // The counter shows genuine readiness: it climbs with time toward the
      // floor, and can only pass 90% once both real signals are in. This makes
      // the last stretch mean "the work is actually done", not a stall.
      const both = readyRef.current.fonts && readyRef.current.scene
      const timeCeiling = t * 0.9
      const target = both ? 1 : timeCeiling
      setProgress((prev) => prev + (target - prev) * 0.18)

      // Release conditions: past the floor, and either everything is ready or
      // we have hit the hard cap.
      const pastFloor = elapsed >= FLOOR_MS
      const capped = elapsed >= CAP_MS
      if (pastFloor && (both || capped)) {
        window.clearInterval(id)
        finish()
      }
    }, 40)

    // Hard safety: if the timer is throttled out entirely, still release the page.
    const failsafe = window.setTimeout(finish, CAP_MS + 1500)

    return () => {
      window.clearInterval(id)
      window.clearTimeout(failsafe)
      if (readyRef.current._onSceneReady) {
        window.removeEventListener('scene-ready', readyRef.current._onSceneReady)
      }
    }
  }, [onDone])

  const pct = Math.min(100, Math.round(progress * 100))

  // Fine paper grain, inlined as an SVG turbulence filter so the curtain is a
  // textured paper field rather than a flat fill. Same palette (black on putty),
  // multiplied at low opacity so it reads as stock rather than noise.
  const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

  return (
    <div
      aria-label="Loading portfolio"
      aria-live="polite"
      className={`fixed inset-0 z-[200] flex flex-col select-none bg-[#c4c3b6] text-black overflow-hidden ${
        leaving ? 'pointer-events-none' : ''
      }`}
      style={{
        // The curtain lifts and fades as one piece.
        transform: leaving ? 'translateY(-100%)' : 'translateY(0)',
        opacity: leaving ? 0 : 1,
        transition: 'transform 900ms cubic-bezier(0.76, 0, 0.24, 1), opacity 700ms ease',
      }}
    >
      {/* BACKGROUND — a paper field with print texture, not blank putty.
          (1) Monumental ghost wordmark, echoing the hero's MAHARDIKA. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span className="font-display-serif font-bold uppercase text-[26vw] sm:text-[22vw] leading-[0.8] tracking-[-0.04em] text-black/[0.045] whitespace-nowrap select-none">
          Mahardika
        </span>
      </div>

      {/* (2) Paper grain over everything at low opacity. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: GRAIN, opacity: 0.55, mixBlendMode: 'multiply' }}
      />

      {/* (3)+(4) Ink band at the foot — the putty meets the dark field the site
          scrolls into, carrying the credits marquee in reverse type. Being a
          flow child (not absolute) it sits neatly below the progress, so nothing
          on putty is swallowed by the ink. */}
      <div className="relative z-10 bg-[#09090e] overflow-hidden">
        <div className="loader-marquee-track flex whitespace-nowrap w-max py-3.5">
          {[0, 1].map((dup) => (
            <span key={dup} className="font-grotesk text-xs tracking-[0.18em] uppercase text-white/55 px-6">
              Software Engineer &nbsp;·&nbsp; Interface Designer &nbsp;·&nbsp; Rekayasa Perangkat Lunak &nbsp;·&nbsp; SMK Plus Pelita Nusantara &nbsp;·&nbsp; Python &nbsp;·&nbsp; React &nbsp;·&nbsp; WebGL &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Ink panel that trails the putty as it lifts, so the reveal moves from
          paper toward the dark field the site scrolls into. */}
      <div
        className="absolute inset-0 bg-[#09090e]"
        style={{
          transform: leaving ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 900ms cubic-bezier(0.76, 0, 0.24, 1)',
        }}
        aria-hidden="true"
      />

      {/* Top meta row — the monogram and the owner's portrait, so the creator is
          present from the first frame. */}
      <div className="relative z-10 flex items-center gap-4 px-6 sm:px-12 pt-10">
        <span className="w-10 h-10 rounded-full border border-black/70 flex items-center justify-center font-classical text-xs tracking-wider shrink-0">
          KM
        </span>
        {photoOk && (
          <span
            aria-hidden="true"
            className="w-10 h-10 rounded-full overflow-hidden bg-[#595855] shrink-0"
          >
            <img
              src="/owner.jpg"
              alt=""
              width="40"
              height="40"
              decoding="async"
              onError={() => setPhotoOk(false)}
              className="w-full h-full object-cover portrait-desat"
            />
          </span>
        )}
      </div>

      {/* Centre: a vertical stroke draws down the page as progress advances —
          the same line language as the scroll journey line it hands off to —
          and the name sets below it with a masked line reveal. */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* The drawing stroke: scales from the top of the center field down to
            the foot of the name as the page prepares. */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-6 bottom-24 w-px bg-black/70 -translate-x-1/2 origin-top"
          style={{ transform: `translateX(-50%) scaleY(${progress})` }}
        />

        <div className="loader-rise">
          <p className="font-grotesk text-sm text-black mb-6">
            The gallery is opening
          </p>
          <div className="loader-line-mask">
            <h1
              className="loader-line-inner font-display-serif font-medium tracking-tight leading-[1.04] text-[13vw] sm:text-[7vw] max-w-5xl"
              style={{ animationDelay: '0.1s' }}
            >
              Kevin Mahardika
            </h1>
          </div>
          <div className="loader-line-mask mt-5">
            <p
              className="loader-line-inner font-editorial-serif italic text-black/75 text-xl"
              style={{ animationDelay: '0.22s' }}
            >
              Software engineer &amp; interface designer
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: progress expressed as filled tone blocks rather than a hairline
          rule (the design system has no dividers) plus a readable counter.
          Sits above the ink band. */}
      <div className="relative z-10 px-6 sm:px-12 pb-14">
        <div className="flex items-end justify-between mb-4">
          <span className="font-grotesk text-sm text-black">Preparing the exhibition</span>
          <span className="font-display-serif text-3xl tabular-nums leading-none">
            {String(pct).padStart(3, '0')}
            <span className="text-black/40 text-lg">%</span>
          </span>
        </div>
        {/* Twelve tone blocks that fill in sequence. Reads as progress, uses a
            fill rather than a line, and stays in the site's stark register. */}
        <div className="flex gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => {
            const filled = progress * 12 > i
            return (
              <span
                key={i}
                className="h-1.5 flex-1 transition-colors duration-200"
                style={{ backgroundColor: filled ? '#000000' : 'rgba(0,0,0,0.13)' }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
