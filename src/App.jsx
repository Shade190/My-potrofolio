import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import HexNav from './components/HexNav'
import HeroSlide from './components/HeroSlide'
import AboutSlide from './components/AboutSlide'
import SkillsSlide from './components/SkillsSlide'
import CertificatesSlide from './components/CertificatesSlide'
import ProjectsSlide from './components/ProjectsSlide'
import ContactSlide from './components/ContactSlide'
import Footer from './components/Footer'
import CertificateModal from './components/CertificateModal'
import CustomCursor from './components/CustomCursor'
import Loader from './components/Loader'
import ScrollPath from './components/ScrollPath'
import MuseumSpine from './components/MuseumSpine'

// The WebGL scene carries three.js — the bulk of the JavaScript on this site.
// Loading it lazily keeps three out of the initial bundle so the curtain, the
// fonts and the first text paint arrive without waiting on ~600 kB of graphics
// code. The scene streams in while the opening curtain is still up, and the
// Loader waits for its first painted frame (window.__sceneReady) before lifting.
const Scene3D = lazy(() => import('./components/Scene3D'))

const SECTION_IDS = ['hero', 'about', 'skills', 'certificates', 'projects', 'contact']

export default function App() {
  const [activeSection, setActiveSection] = useState(0)
  const [modalItem, setModalItem] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // While the curtain is up, hold the page at the top. Lenis is created after
    // this effect runs (it lives in main.jsx), so instead of racing the mount
    // order we raise a flag its frame loop checks — see `window.__scrollLocked`.
    // The wheel/touch blockers cover the reduced-motion case, where Lenis does
    // not exist at all and scrolling is native.
    if (loading) {
      window.__scrollLocked = true
      window.scrollTo(0, 0)
      const block = (e) => e.preventDefault()
      window.addEventListener('wheel', block, { passive: false })
      window.addEventListener('touchmove', block, { passive: false })
      return () => {
        window.__scrollLocked = false
        window.removeEventListener('wheel', block)
        window.removeEventListener('touchmove', block)
      }
    }
  }, [loading])

  // Section offsets are measured on layout/resize instead of being read from
  // `offsetTop` on every scroll frame — reading layout during scroll forces a
  // synchronous reflow each frame, which is the main cause of janky scrolling.
  const offsetsRef = useRef([])

  const measureSections = useCallback(() => {
    offsetsRef.current = SECTION_IDS.map((id) => {
      const el = document.getElementById(id)
      return el ? el.offsetTop : 0
    })
  }, [])

  useEffect(() => {
    measureSections()
    // Re-measure once fonts/images have settled, and on resize.
    const t1 = setTimeout(measureSections, 400)
    const t2 = setTimeout(measureSections, 1500)

    // Drive everything from Lenis' own smoothed scroll value when available:
    // it is already frame-synced and interpolated, so we do not fight it with
    // a second rAF loop. Falls back to native scroll events otherwise.
    const lenis = window.__lenis

    const update = (scrollY) => {
      // NOTE: no per-frame React state here. The normalised scroll position is
      // consumed by the WebGL scene directly from Lenis inside its own loop, so
      // mirroring it into state only re-rendered the whole tree (scene, nav,
      // hex rail, all six slides) on every scroll frame — the main thing making
      // the page feel heavy. Only the two *discrete* values that genuinely need
      // a re-render are tracked, and both are guarded so they settle.
      const offsets = offsetsRef.current
      let current = 0
      const probe = scrollY + window.innerHeight * 0.35
      for (let i = offsets.length - 1; i >= 0; i--) {
        if (probe >= offsets[i]) {
          current = i
          break
        }
      }
      setActiveSection((prev) => (prev === current ? prev : current))
      // The field flips to ink as soon as the first dark slide (Skills) enters
      // the viewport from the bottom, so its white heading and pills never sit
      // on the putty band mid-scroll. Guarded by -2px to avoid tearing at the
      // exact boundary. The change is a hard cut, per the design system.
      const darkStart = offsets[2] ?? Infinity
      setIsDark((prev) => {
        const next = scrollY + window.innerHeight >= darkStart - 2
        return prev === next ? prev : next
      })
    }

    const handleScroll = () => update(window.scrollY)

    if (lenis) {
      // Lenis passes { scroll } on every frame it advances.
      lenis.on('scroll', ({ scroll }) => update(scroll))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', measureSections)

    handleScroll()

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', measureSections)
      if (lenis && lenis.off) lenis.off('scroll')
    }
  }, [measureSections])

  const navigateTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      if (window.__lenis) {
        // A longer glide than the default, matching the slower scroll feel, and
        // a generous linear easing so a jump to a section reads as walking there.
        window.__lenis.scrollTo(el, {
          offset: 0,
          duration: 1.6,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        })
      } else {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const navigateToIndex = (idx) => {
    if (idx >= 0 && idx < SECTION_IDS.length) {
      navigateTo(SECTION_IDS[idx])
    }
  }

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#09090e]' : 'bg-[#c4c3b6]'}`}>
      {/* Opening curtain — sits above everything until the scene has painted. */}
      {loading && <Loader onDone={() => setLoading(false)} />}

      {/* Subtle Custom Cursor */}
      <CustomCursor />

      {/* Choreographed 3D WebGL Scene (scroll-driven, mounts once). Wrapped in
          Suspense with no fallback: the canvas is `fixed inset-0 -z` behind the
          slides, so while its chunk streams in the putty page simply shows
          through — nothing to flash or placeholder. */}
      <Suspense fallback={null}>
        <Scene3D isDark={isDark} />
      </Suspense>

      {/* Scroll journey line — draws down the page, wraps around the Projects
          grid, then continues to the foot (see ScrollPath.jsx). */}
      <ScrollPath isDark={isDark} />

      {/* Minimal Luxury Navigation */}
      <Navbar activeSection={activeSection} isDark={isDark} />

      {/* Gallery wayfinding rail — the room you are in, and the plan of the
          other five. Desktop only; the navbar carries the same names on a phone. */}
      <MuseumSpine
        activeSection={activeSection}
        isDark={isDark}
        onNavigate={navigateTo}
      />

      {/* Floating Hexagonal Slide Indicator */}
      <HexNav
        activeSection={activeSection}
        totalSections={SECTION_IDS.length}
        onSelect={navigateToIndex}
        isDark={isDark}
      />

      {/* Main Content Slides with Spatial Motion. No z-index here: the sections
          must stay in the root stacking context so their -z-10 field layers sit
          behind the fixed 3D canvas while their z-10 content stays on top. */}
      <main className="relative flex flex-col">
        <HeroSlide onNavigate={navigateTo} />
        <AboutSlide onNavigate={navigateTo} />
        <SkillsSlide />
        <CertificatesSlide onSelectCertificate={(cert) => setModalItem(cert)} />
        <ProjectsSlide onSelectProject={(proj) => setModalItem(proj)} />
        <ContactSlide />
      </main>

      {/* Editorial Footer */}
      <Footer onScrollTop={() => navigateToIndex(0)} />

      {/* Fullscreen Interactive Lightbox Modal */}
      <CertificateModal item={modalItem} onClose={() => setModalItem(null)} />
    </div>
  )
}
