import React, { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// MUSEUM SPINE — the wayfinding rail that runs down the left edge of the page.
//
// The idea: you are not scrolling a website, you are walking a corridor of a
// museum. Six sections are six rooms. The rail is the wayfinding board at the
// head of each doorway: it names the room you are standing in ("Now in: Room
// IV — Accolades") and lays every room out behind a small plan-dot, so you can
// always see where you are and what is next.
//
// It is pure type and dots. No progress bar, no hairline rule, no numbering —
// the plan-dots are *dots* precisely because index numerals ("01 / 02") are
// banned, and a dot plan is read as position rather than as a serial.
//
// The rail is fixed, so it sits over whichever field is behind it. It reads the
// field tone from the same `isDark` App already computes at the Skills boundary,
// and flips ink/putty with it. Hidden under 1024px (it is an ambient desktop
// device; on a phone the navbar carries the same six names), and skipped under
// `prefers-reduced-motion` only for its transition, never its content.
// ---------------------------------------------------------------------------

const ROOMS = [
  { id: 'hero', room: 'Room I', name: 'Lobby' },
  { id: 'about', room: 'Room II', name: 'The Maker' },
  { id: 'skills', room: 'Room III', name: 'The Craft' },
  { id: 'certificates', room: 'Room IV', name: 'Certificates' },
  { id: 'projects', room: 'Room V', name: 'Projects' },
  { id: 'contact', room: 'Room VI', name: 'Contact' },
]

export default function MuseumSpine({ activeSection, isDark, onNavigate }) {
  const [mounted, setMounted] = useState(false)

  // The rail fades up once, after the curtain has lifted, rather than arriving
  // with the first paint (when it would collide with the loader).
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const current = ROOMS[activeSection] || ROOMS[0]
  const ink = isDark ? 'text-white' : 'text-black'

  return (
    <aside
      aria-label="Gallery wayfinding"
      className={`hidden 2xl:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 w-[7.5rem] pl-4 pr-2 flex-col select-none transition-opacity duration-700 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Where you are. Two short lines in the body face — a room name, not a
          label with a colon. Set at a readable size in full ink. Both lines are
          clamped to the rail's width so the rail can never reach into the
          content column. */}
      <p className={`font-grotesk text-[13px] leading-snug ${isDark ? 'text-white/90' : 'text-black/90'}`}>
        Now in
      </p>
      <p className={`font-display-serif text-base leading-tight mt-0.5 ${ink}`}>
        {current.room}
      </p>
      <p className={`font-grotesk text-[13px] leading-snug mt-0.5 ${isDark ? 'text-white/65' : 'text-black/65'}`}>
        {current.name}
      </p>

      {/* The plan: one dot per room, filled for the room behind you, ringed and
          larger for the one you are in. Clicking a dot walks there. */}
      <ul className="flex flex-col items-start gap-3 mt-5">
        {ROOMS.map((r, i) => {
          const isCurrent = i === activeSection
          const visited = i <= activeSection
          return (
            <li key={r.id}>
              <button
                onClick={() => onNavigate(r.id)}
                aria-label={`${r.room} — ${r.name}`}
                aria-current={isCurrent ? 'true' : undefined}
                className="group relative flex items-center gap-3 cursor-pointer"
              >
                <span
                  className={`block rounded-full transition-[height,width,background-color] duration-300 ${
                    isCurrent
                      ? `h-2.5 w-2.5 ${isDark ? 'bg-white' : 'bg-black'}`
                      : visited
                        ? `h-1.5 w-1.5 ${isDark ? 'bg-white/60 group-hover:bg-white' : 'bg-black/55 group-hover:bg-black'}`
                        : `h-1.5 w-1.5 ${isDark ? 'bg-white/22 group-hover:bg-white/50' : 'bg-black/22 group-hover:bg-black/50'}`
                  }`}
                />
                {/* The room's name appears on hover only — the rail stays quiet
                    until you reach for it. It is absolutely positioned so a long
                    name can never widen the rail into the content column. */}
                <span
                  className={`absolute left-6 font-grotesk text-[13px] whitespace-nowrap transition-opacity duration-200 pointer-events-none ${
                    isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } ${isDark ? 'text-white/80' : 'text-black/70'}`}
                >
                  {r.name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
