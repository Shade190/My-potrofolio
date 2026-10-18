import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Lenis from 'lenis'

function Root() {
  useEffect(() => {
    // Respect the user's motion preference: if they ask for reduced motion we
    // skip the virtual scroll entirely and let the browser scroll natively.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      return undefined
    }

    // Lenis smooth scroll, tuned for a gallery walk rather than a web page.
    // `lerp` (instead of a fixed duration) keeps the motion velocity-continuous,
    // so fast flicks and slow crawls both feel natural and there is no easing
    // seam between them.
    //
    // Gallery tuning: the lerp is deliberately low (0.07, down from 0.09) so the
    // page keeps gliding for longer after the wheel stops — the floor of a
    // museum underfoot — and the wheel multiplier is damped (0.85) so one notch
    // moves less. A section is then something you *arrive at* and stand in,
    // rather than something you fly past.
    const lenis = new Lenis({
      lerp: 0.07,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.25,
      smoothWheel: true,
      syncTouch: true,
      gestureOrientation: 'vertical',
      autoRaf: false,
    })

    // Exposed for jump-to-section and for App to read the smoothed scroll value.
    window.__lenis = lenis

    // The opening curtain sets `window.__scrollLocked` while it is up. Lenis is
    // created here (after App's effects run), so App cannot reliably stop it —
    // instead the lock is a flag the wheel handler checks every frame.
    let rafId
    function raf(time) {
      if (window.__scrollLocked) {
        // Keep the page pinned at the top and drop any accumulated velocity.
        if (window.scrollY !== 0) window.scrollTo(0, 0)
      } else {
        lenis.raf(time)
      }
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
