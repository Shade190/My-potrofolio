import React, { useEffect, useRef, useState } from 'react'
import { COLLECTION } from '../data/collection'

// Opening curtain. The site is an editorial "gallery" that begins on putty
// paper and descends into space, so the loader opens the same way: the gallery's
// front room — a putty wall hung like a museum, the name set in the display
// serif, a curator's note pinned up. No spinner — the pace is deliberate.
//
// The exit is two moves, in this order:
//   1. THE DRAIN. Everything on the wall spirals gently inward and is drawn
//      down a plughole at the centre — a slow toilet-flush, not a snap. The
//      arc is slow to start and accelerates toward the centre, and the wall
//      stretches toward the drain as it shrinks, so it reads as water finding
//      a plug rather than a card on a turntable.
//   2. THE DOORS. What is left is the gallery entrance: two doors, hinged at
//      the outer edges, which swing open away from the viewer with a little
//      perspective, uncovering the site from the centre seam outward.
// That is why there are three stages (`draining`, `doors`, then `leaving`)
// instead of two.
//
// The room is dressed as a museum: a putty wall with a lit top and a heavier
// foot, hung works either side of the name, a canvas-frame wall label with the
// room's particulars, a numbered exhibition poster, a roped-off plinth with an
// object on it, a wayfinding arrow card, and the curator's note. The pieces
// appear one after another so the room fills up rather than popping in whole.
//
// It still waits on real work instead of a fixed sleep: two true signals gate
// the reveal — the display fonts being ready (`document.fonts`) and the WebGL
// scene having painted its first frame (`window.__sceneReady`). The floor is
// generous (3s) because feedback twice said it released too fast to register. A
// hard cap (~7.5s) still guarantees release.
export default function Loader({ onDone }) {
  // The counter, the tone blocks and the vertical stroke are all gone from the
  // wall, so the numeric progress no longer drives any markup. The state is kept
  // (it is still the honest gate the release logic reads) but it is a ref now,
  // so the 50ms tick cannot force a re-render of a wall that never changes.
  const progressRef = useRef(0.04)
  // Three stages: `draining` runs the suction, `doors` swings the entrance open,
  // `leaving` then fully clears the curtain. Each has to finish before the next,
  // otherwise the site would be uncovered mid-drain or mid-swing.
  const [draining, setDraining] = useState(false)
  const [doors, setDoors] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // The visitor's name — the front room asks who has come in, and hands them a
  // museum ID card on a lanyard before the doors open. Held in a ref as well as
  // state so the release gate can read it without re-subscribing the timer.
  const [visitor, setVisitor] = useState('')
  const [draft, setDraft] = useState('')
  const visitorRef = useRef('')
  // The parent's `onDone`, held in a ref so the release effect can stay mounted
  // for the loader's whole life even though the parent passes a fresh closure.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  // When the name arrived, on the same clock as the release gate (which is
  // measured from `performance.now()` at mount). 0 means "not yet".
  const namedAtRef = useRef(0)
  // The mount time, so the desk and the release gate share one clock.
  const startAtRef = useRef(0)
  // The live gate check, so the desk can poke it on submit.
  const gateRef = useRef(null)

  // Live readiness, read from the animation loop. A ref so the loop never has
  // to be torn down and rebuilt when a signal flips.
  const readyRef = useRef({ fonts: false, scene: false })

  useEffect(() => {
    const start = performance.now()
    startAtRef.current = start
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // The curtain is the opening beat of the site, so it is allowed to take its
    // time. Floor is the minimum dwell — raised twice now: first from 650ms,
    // then from 2400ms after the feedback that it still read as a flicker
    // rather than an opening. Cap is the latest it may ever release.
    const FLOOR_MS = reduce ? 200 : 3000
    const CAP_MS = reduce ? 800 : 7500
    // How much longer the front room waits for a name once it could already
    // have opened. Gentle, but not a trap: ignoring the desk costs this much.
    const DESK_GRACE_MS = reduce ? 0 : 6000
    // Once a name is given, the room holds this long so the visitor sees the
    // pass land. Short — they just typed the name and are looking at the card.
    const CARD_DWELL_MS = reduce ? 0 : 1200
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
      progressRef.current = 1
      // Stage 1 — measure the room, then let the water go. `armFlush` reads every
      // piece's vector to the plughole and its place in the queue BEFORE the
      // class is applied, so the suction is one clean CSS animation.
      armFlush()
      setDraining(true)

      // Stages 2 and 3 run off the WALL CLOCK, not chained `setTimeout`s. A
      // chained timer that gets clamped (background tab, software rendering)
      // adds its late-delivery penalty to every following stage, so the exit
      // could take twice its intended 3.7s. Polling absolute deadlines means a
      // late tick still fires every stage that is already due, in the right
      // order, on the next opportunity.
      const t0 = performance.now()
      const DOORS_AT = 2250
      const LEAVE_AT = 3250
      const DONE_AT = 3700
      let saidDone = false
      const advance = () => {
        const e = performance.now() - t0
        if (e >= DOORS_AT) setDoors(true)
        if (e >= LEAVE_AT) setLeaving(true)
        if (e >= DONE_AT && !saidDone) {
          saidDone = true
          onDoneRef.current && onDoneRef.current()
          return true
        }
        return e >= DONE_AT
      }
      let eraf = window.requestAnimationFrame(function eloop() {
        if (!advance()) eraf = window.requestAnimationFrame(eloop)
      })
      const eid = window.setInterval(() => {
        if (advance()) window.clearInterval(eid)
      }, 120)
    }

    // The release gate. It used to be a bare 50ms interval, but timers get
    // clamped hard when a tab is not focused (headless capture, or a visitor
    // who tabs away), which could add a second of dead time to every stage.
    // Driving it from rAF when the page is visible keeps it responsive; the
    // interval stays as the fallback for throttled/background cases, because
    // rAF can be starved entirely there and the room must still release.
    const tick = () => {
      const elapsed = performance.now() - start
      const t = Math.min(elapsed / FLOOR_MS, 1)

      // Progress tracks the floor *directly* rather than easing toward it, so the
      // last 12% is held back until both real signals are in — the final stretch
      // means "the work is actually done", not a stall. Nothing renders it any
      // more, it only gates the release below.
      const both = readyRef.current.fonts && readyRef.current.scene
      progressRef.current = both ? 1 : t * 0.88

      // Release conditions. The front room waits for the visitor to give a name,
      // but the wait is a GRACE ON TOP OF THE FLOOR, not an extra 11s bolted on
      // after it: `DESK_GRACE_MS` starts once the room could already have
      // opened. A visitor who signs in is released as soon as their card has
      // been on screen for `CARD_DWELL_MS` — they have interacted, so making
      // them wait on the WebGL scene's first frame would be dead time.
      const pastFloor = elapsed >= FLOOR_MS
      const capped = elapsed >= CAP_MS
      const named = visitorRef.current.trim().length > 0
      const cardRead = named && elapsed - namedAtRef.current >= CARD_DWELL_MS
      const graceOver = elapsed >= FLOOR_MS + DESK_GRACE_MS
      if (pastFloor && (cardRead || graceOver) && (both || capped || named)) {
        window.clearInterval(id)
        window.cancelAnimationFrame(raf)
        finish()
        return true
      }
      return false
    }

    const id = window.setInterval(tick, 120)
    let raf = window.requestAnimationFrame(function loop() {
      if (!tick()) raf = window.requestAnimationFrame(loop)
    })
    gateRef.current = tick

    // Hard safety: if both the timer and rAF are throttled out entirely, still
    // release the page.
    const failsafe = window.setTimeout(finish, FLOOR_MS + DESK_GRACE_MS + 4000)

    return () => {
      window.clearInterval(id)
      window.cancelAnimationFrame(raf)
      window.clearTimeout(failsafe)
      if (readyRef.current._onSceneReady) {
        window.removeEventListener('scene-ready', readyRef.current._onSceneReady)
      }
    }
    // Runs exactly once, on mount. `onDoneRef` is read inside `finish`, so the
    // parent handing us a fresh inline callback on its own re-render can never
    // tear this effect down and reset the clock mid-flight.
  }, [])

  // Fine paper grain, inlined as an SVG turbulence filter so the curtain is a
  // textured paper field rather than a flat fill. Same palette (black on putty),
  // multiplied at low opacity so it reads as stock rather than noise.
  const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

  // The flush needs each piece to be pulled toward the SAME plughole, so before
  // the drain starts we measure every element that should be sucked in, work out
  // the vector from its centre to the middle of the screen, and write it back as
  // `--tx`/`--ty` together with its place in the queue (`--d`). Measuring once,
  // up front, keeps the animation itself pure CSS.
  const roomRef = useRef(null)
  const flushRef = useRef([])

  const armFlush = () => {
    const room = roomRef.current
    if (!room) return
    const items = Array.from(room.querySelectorAll('[data-flush]'))
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect()
      const ex = r.left + r.width / 2
      const ey = r.top + r.height / 2
      // Toward the plughole, in the element's own transform space (the parent is
      // the full-screen room, so viewport deltas are the right units here).
      el.style.setProperty('--tx', `${Math.round(cx - ex)}px`)
      el.style.setProperty('--ty', `${Math.round(cy - ey)}px`)
      // Stagger the queue so the pieces go down one after another — this is the
      // difference between a flush and a single collapsing sheet. The centre
      // lock-up (the name and the visitor's pass) is forced to go LAST, so the
      // room empties outward-in. Its delay is kept short: it is the biggest
      // thing on the wall and already dominates the tail of the flush.
      const isCentre = el.hasAttribute('data-flush-last')
      const d = isCentre ? 0.45 : 0.1 + i * 0.06
      el.style.setProperty('--d', `${d.toFixed(3)}s`)
    })
    flushRef.current = items
  }

  // The visitor signs the book. Their name is written onto a museum ID card and
  // the card is clipped to a lanyard — the thing you are handed at the desk of
  // an exhibition. Empty input falls back to "Guest", so the desk never argues.
  const handleSign = (e) => {
    if (e) e.preventDefault()
    const name = draft.trim().slice(0, 40) || 'Guest'
    visitorRef.current = name
    namedAtRef.current = performance.now() - startAtRef.current
    setVisitor(name)
    // Ask the release gate to re-evaluate immediately instead of waiting for
    // its next tick — the visitor has just acted, so the room should respond.
    gateRef.current && gateRef.current()
  }

  // One wall plate: the surface stock hairline plus the two lighting bands. Used
  // three times — on the room that drains, and on each of the two door leaves —
  // so all three read as the same putty wall.
  const wallPlate = (
    <>
      {/* taste-skill-ignore gradient — not a colour gradient: a repeating 1px
          hairline rule at 132px spacing, the surface stock of the wall. No
          stop fades into another, so there is no ramp. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(0,0,0,0.045) 0 1px, transparent 1px 132px)', // taste-skill-ignore gradient
        }}
      />
      {/* Museum lighting, thrown as flat planes only (no gradient, per the house
          style): a heavier fall at the foot, where a lit wall loses the light,
          and a lit top cornice. No hairline rules — the bands do the separating. */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-[#bcbbae]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[#cfcec2]" />
    </>
  )

  return (
    <div
      aria-label="Loading portfolio"
      aria-live="polite"
      className={`fixed inset-0 z-[200] select-none bg-[#c4c3b6] text-black overflow-hidden ${
        leaving ? 'pointer-events-none' : ''
      }`}
      // The curtain only fades at the very end, after the doors have swung. The
      // drain and the swing are their own moves; this is just the final clear.
      style={{
        opacity: leaving ? 0 : 1,
        transition: leaving ? 'opacity 480ms ease 260ms' : 'none',
      }}
    >
      {/* ---- THE ENTRANCE (two doors) ------------------------------------
          Behind the room, the gallery's entrance: an architrave (the static
          frame the doors hang in) with two putty doors meeting at a centre
          seam. While the room is on the wall the doors are hidden behind it;
          once the room has drained, all that is left IS these doors, and they
          swing open away from the viewer to uncover the site from the seam
          outward. Each leaf carries the same wall plate plus an inset panel,
          the way a real door is moulded. Behind them is the dark threshold the
          site scrolls into, so the opening reads as stepping through. */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#09090e]">
        <div className="absolute inset-0" style={{ perspective: '1700px' }}>
          {/* left leaf — hinged on its left edge */}
          <div
            className={`absolute inset-y-0 left-0 w-1/2 bg-[#b6b5a8] origin-left ${
              doors ? 'loader-door' : ''
            }`}
          >
            {wallPlate}
            {/* The doorway itself, drawn as flat planes rather than outlines
                (the design system rules outlines out): a receded panel on the
                leaf, and a band of the reveal's own darker tone at the seam, so
                the two leaves read as a pair of doors and not one flat wall. */}
            <div className="absolute left-10 right-6 top-14 bottom-20 bg-[#a9a89b]" />
            <div className="absolute inset-y-0 right-0 w-2.5 bg-[#8f8e84]" />
            {/* the brass handle, sitting at the seam */}
            <span className="absolute right-6 top-1/2 -translate-y-1/2 h-20 w-2 rounded-full bg-[#4c4b47]" />
          </div>
          {/* right leaf — hinged on its right edge */}
          <div
            className={`absolute inset-y-0 right-0 w-1/2 bg-[#b6b5a8] origin-right ${
              doors ? 'loader-door-right' : ''
            }`}
          >
            {wallPlate}
            <div className="absolute right-10 left-6 top-14 bottom-20 bg-[#a9a89b]" />
            <div className="absolute inset-y-0 left-0 w-2.5 bg-[#8f8e84]" />
            <span className="absolute left-6 top-1/2 -translate-y-1/2 h-20 w-2 rounded-full bg-[#4c4b47]" />
          </div>
        </div>
      </div>

      {/* ---- THE ROOM ----------------------------------------------------
          Everything below is the front room, and everything below drains down
          the plughole together when the reveal starts. Three flat planes build
          the wall (surface stock, lit cornice, lit foot); on top of it hang the
          exhibits, the wayfinding, the poster, the plinth, the wall label and
          the curator's note. */}
      <div
        ref={roomRef}
        className={`absolute inset-0 ${
          draining ? 'loader-flush-wall' : ''
        }`}
      >
        {wallPlate}

        {/* Fine paper grain over the wall, at low opacity. It sinks with the
            wall so nothing stays behind when the room drains. */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: GRAIN, opacity: 0.5, mixBlendMode: 'multiply' }}
        />

        {/* ---- The hang ---- each piece on the wall carries `data-flush`, so the
            flush can pull it down the plughole on its own clock: `armFlush`
            measures the vector to the centre and the queue position, and
            `.loader-flush` (applied once `draining` is true) does the rest. The
            room empties outward-in, and the centre lock-up is forced last. */}
        <div className="relative z-10 h-full w-full flex flex-col">
          {/* Top meta row — the monogram and the room's opening hours, like a
              museum's own letterhead. The owner's portrait used to sit here too;
              it was removed on request, so the front room carries no portrait of
              the maker at all — the visitor's own pass is the only identity on
              this screen. */}
          <div className="flex items-center gap-4 px-6 sm:px-12 pt-10">
            <span
              data-flush
              className={`w-10 h-10 rounded-full border border-black/70 flex items-center justify-center font-classical text-xs tracking-wider shrink-0 ${
                draining ? 'loader-flush' : 'loader-hang'
              }`}
            >
              KM
            </span>
            <span
              data-flush
              className={`font-grotesk text-sm text-black/60 ${
                draining ? 'loader-flush' : 'loader-hang'
              }`}
            >
              Front room, open daily
            </span>
          </div>

          {/* The exhibition poster, pinned high on the left — a numbered
              notice, the way a gallery announces a show. */}
          <div
            aria-hidden="true"
            className={`loader-hang absolute left-[5%] top-[13%] hidden w-40 lg:block ${
              draining ? 'loader-flush' : ''
            }`}
            data-flush
            style={{ animationDelay: '0.5s' }}
          >
            <div className="relative">
              <span className="absolute inset-0 translate-x-1 translate-y-1 bg-black/20" />
              <div className="relative bg-[#efe9d5] px-4 py-5">
                <p className="font-grotesk text-sm text-black/60">
                  Now showing
                </p>
                <p className="font-display-serif text-[19px] leading-tight mt-2">
                  Digital
                  <br />
                  Artifacts
                </p>
                <p className="font-grotesk text-[13px] text-black/60 mt-3 leading-snug">
                  Room I, putty wing
                  <br />
                  Through 2026
                </p>
              </div>
            </div>
          </div>

          {/* The plinth — a roped-off object on a stone block, the one solid
              thing in the room. Museum furniture, flat surfaces only. */}
          <div
            aria-hidden="true"
            className={`loader-hang absolute left-[9%] bottom-[16%] hidden lg:block ${
              draining ? 'loader-flush' : ''
            }`}
            data-flush
            style={{ animationDelay: '0.62s' }}
          >
            <div className="relative w-28">
              {/* the object: a bone block standing on a plinth, sitting in the
                  light — the one solid thing in the room */}
              <div className="absolute -top-[4.5rem] left-1/2 -translate-x-1/2 h-16 w-14 rotate-6 bg-[#c9c8bd]" />
              <div className="absolute -top-[4.5rem] left-1/2 -translate-x-1/2 h-16 w-14 bg-[#e7e5e4]" />
              <div className="h-20 w-28 bg-[#9a998f]" />
              <div className="h-3 w-28 bg-[#595855]" />
            </div>
            {/* the rope: a flat rule across the front, the way a barrier reads */}
            <div className="mt-4 h-1 w-28 bg-[#595855]/70" />
            <p className="font-grotesk text-[13px] text-black/55 mt-2">
              Please do not touch
            </p>
          </div>

          {/* A wayfinding card, slipped under the top-right — museum signage. */}
          <div
            aria-hidden="true"
            className={`loader-label absolute right-[5%] top-[46%] hidden w-44 xl:block ${
              draining ? 'loader-flush' : ''
            }`}
            data-flush
            style={{ animationDelay: '0.74s' }}
          >
            <div className="flex items-center gap-2.5 bg-transparent">
              <span className="font-display-serif text-2xl leading-none">&rarr;</span>
              <span className="font-grotesk text-[13px] text-black/65">
                Galleries I&ndash;VI
              </span>
            </div>
          </div>

          {/* Two small works hung on the wall, one each side of the name — the
              glimpse of other rooms you get standing in a front hall. Each is a
              real plate from the Met's open collection (see
              `src/data/collection.js`), so the front room announces the same
              permanent collection the wings behind it are showing. Kept small
              and quiet, and dropped below lg so the small screens stay a single
              clean lock-up. They drain with the rest. */}
          <div aria-hidden="true" className="pointer-events-none">
            <div
              className={`loader-hang absolute left-[20%] top-[26%] hidden w-24 lg:block ${
                draining ? 'loader-flush' : ''
              }`}
              data-flush
              style={{ animationDelay: '0.86s' }}
            >
              <div className="bg-[#08080b] p-1.5">
                <div className="bg-[#e7e5e4] p-1.5">
                  <img
                    src={COLLECTION.portraitYoungWoman.src}
                    alt=""
                    decoding="async"
                    className="block w-full h-24 object-cover"
                  />
                </div>
              </div>
            </div>
            <div
              className={`loader-hang absolute right-[19%] top-[30%] hidden w-20 lg:block ${
                draining ? 'loader-flush' : ''
              }`}
              data-flush
              style={{ animationDelay: '0.94s' }}
            >
              <div className="bg-[#08080b] p-1.5">
                <div className="bg-[#e7e5e4] p-1.5">
                  <img
                    src={COLLECTION.portico.src}
                    alt=""
                    decoding="async"
                    className="block w-full h-20 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* The curator's note, pinned to the wall. It appears suddenly (see
              .loader-note) rather than fading in, the way a note actually gets
              put up. Handwritten-feeling: the italic editorial face, tilted, on
              a small paper slip with a folded corner. Its line changes with the
              desk: an instruction before the name is given, a welcome after. */}
          <div className="flex justify-end px-6 sm:px-12 mt-2 sm:mt-6">
            <div
              data-flush
              className={`relative w-44 sm:w-52 ${
                draining ? 'loader-flush' : 'loader-note'
              }`}
            >
              {/* The cast — a flat offset panel, not a blur (house style). */}
              <span
                aria-hidden="true"
                className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black/25"
              />
              <div className="relative bg-[#efe9d5] px-5 py-4">
                {/* The pin. */}
                <span
                  aria-hidden="true"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#595855]"
                />
                {/* The folded corner, drawn as a flat triangle of the wall colour. */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 right-0 w-4 h-4 bg-[#c4c3b6]"
                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                />
                <p className="font-editorial-serif italic text-[15px] leading-snug text-black/80">
                  {visitor
                    ? `Welcome, ${visitor}. The galleries are yours — take your time.`
                    : 'The front room is being dusted. Sign in at the desk and I will hang your pass.'}
                </p>
                <p className="font-grotesk text-[13px] text-black/50 mt-2">
                  &mdash; the curator
                </p>
              </div>
            </div>
          </div>

          {/* Centre: the name, set on the bare wall, with the desk beneath it.
              Nothing counts down under it. The room, the name and the desk are
              the whole opening. The negative top margin is lighter on small
              screens so the curator's note above never lands on the kicker. */}
          <div
            data-flush
            data-flush-last
            className={`relative flex-1 flex flex-col items-center justify-center px-6 text-center -mt-6 sm:-mt-16 ${
              draining ? 'loader-flush' : ''
            }`}
          >
            <div
              className={`loader-rise transition-opacity duration-700 ${
                visitor ? 'opacity-45' : 'opacity-100'
              }`}
            >
              <p className="font-grotesk text-sm text-black mb-6">
                {visitor ? 'You are signed in' : 'The gallery is opening'}
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

            {/* The desk. Before a name is given it is a small counter plate
                asking who has come in; once the name is written it becomes the
                visitor's museum ID card, clipped to a lanyard — the pass you
                wear round your neck for the rest of the visit. Both are the same
                flat surface: no gradient, no blur, no rounded tile. */}
            {!visitor ? (
              <form
                onSubmit={handleSign}
                className="loader-hang mt-14 inline-flex flex-col items-start gap-3 bg-[#e7e5e4] px-5 py-4 text-left"
              >
                <label
                  htmlFor="visitor-name"
                  className="font-grotesk text-[13px] text-black/60"
                >
                  Visitor&apos;s name, for the day pass
                </label>
                <div className="flex items-end gap-3">
                  <input
                    id="visitor-name"
                    name="visitor"
                    type="text"
                    autoComplete="name"
                    enterKeyHint="done"
                    maxLength={40}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your name"
                    className="w-56 bg-transparent font-display-serif text-lg leading-tight text-black placeholder:text-black/35 pb-1 border-b border-black/30 focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    className="shrink-0 bg-[#08080b] px-4 py-2 font-grotesk text-[13px] text-[#e7e5e4] hover:bg-[#2b2b30] cursor-pointer"
                  >
                    Enter
                  </button>
                </div>
                <span className="font-grotesk text-[13px] text-black/45">
                  Kevin Mahardika Kumaeni &middot; WebGL, React, three.js &middot; 2026
                </span>
              </form>
            ) : (
              <div className="loader-hang mt-10 flex flex-col items-center">
                {/* The lanyard. The cords are drawn as an absolutely-positioned
                    layer that extends ABOVE the card's own box (negative top),
                    so they read as coming from off-screen and never push the
                    layout. Flat planes only — a cord is a thin surface, not a
                    drawn line. The clip sits at the card's head. */}
                <div aria-hidden="true" className="relative w-44 h-3">
                  <span className="absolute left-[26%] -top-[42vh] h-[42vh] w-[3px] bg-[#3f3e3a]" />
                  <span className="absolute right-[26%] -top-[42vh] h-[42vh] w-[3px] bg-[#3f3e3a]" />
                  <span className="absolute left-1/2 -translate-x-1/2 top-0 w-9 h-3 bg-[#4c4b47]" />
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2.5 h-2.5 rounded-full bg-[#3a3a36]" />
                </div>

                {/* The ID card itself. Bone stock, the visitor's name set large
                    as the one identity on it, and the show's particulars under
                    it. Deliberately carries NO portrait: the maker's face was
                    removed from the front room on request, so the pass belongs
                    to the visitor alone. The "KM" counter-mark stands where a
                    photo would be, keeping the card's shape and rhythm. The cast
                    is a flat offset panel. */}
                <div className="relative w-80">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 translate-x-2 translate-y-2 bg-black/25"
                  />
                  <div className="relative bg-[#e7e5e4]">
                    {/* The card's head band — ink, with the room's wordmark. */}
                    <div className="flex items-center justify-between bg-[#08080b] px-4 py-2">
                      <span className="font-display-serif text-[12px] tracking-[0.18em] text-[#e7e5e4]">
                        MUSEUM PASS
                      </span>
                      <span className="font-grotesk text-[11px] tracking-[0.14em] text-white/55">
                        ROOM I
                      </span>
                    </div>

                    <div className="flex items-start gap-4 px-4 pt-4 pb-3">
                      {/* The counter-mark in place of a portrait — the issuing
                          institution's monogram, the way a real pass carries the
                          museum's mark rather than the visitor's face. */}
                      <span
                        aria-hidden="true"
                        className="w-14 h-16 shrink-0 bg-[#08080b] flex items-center justify-center"
                      >
                        <span className="font-classical text-[#e7e5e4] text-lg tracking-wider">
                          KM
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block font-grotesk text-[12px] text-black/55">
                          Admitted
                        </span>
                        <span className="block font-display-serif text-2xl leading-tight pt-1 truncate">
                          {visitor}
                        </span>
                        <span className="block font-grotesk text-[12px] text-black/55 pt-2">
                          Valid today &middot; one visit
                        </span>
                      </div>
                    </div>

                    {/* The card's foot — the show line, the way a pass carries
                        the exhibition it admits you to. */}
                    <div className="px-4 py-2.5 bg-[#d8d6cf]">
                      <span className="font-grotesk text-[12px] text-black/60">
                        Digital Artifacts &amp; Spatial Code &middot; Collection of
                        Kevin Mahardika Kumaeni
                      </span>
                    </div>
                  </div>
                </div>

                <span className="font-grotesk text-[13px] text-black/50 mt-4">
                  Keep this on while you look around.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
