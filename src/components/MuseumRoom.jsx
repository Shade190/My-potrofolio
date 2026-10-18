import React from 'react'

// ---------------------------------------------------------------------------
// MUSEUM ROOM DRESSING
//
// The rooms that hang work (Certificates, Projects) and the room that receives
// visitors (Contact) each need to stop being "a page section with a wall
// colour" and start being a room. This file holds the flat furniture those
// rooms share, so the dressing is consistent instead of three bespoke sets.
//
// Every piece is a FLAT plane — no gradients, no drop effects, no outlines,
// no hairlines-as-dividers. Depth is made the way the rest of the site makes
// it: by stacking flat tones and offsetting a dark cast panel. The house style
// bans blur, so a cast here is always a hard-edged panel behind the object.
//
// What is in here:
//   Cornice     the lit band at the top of a wall, where the ceiling meets it
//   Skirting    the dark fall at the floor, where the wall gives up its light
//   Floor       a real floor plane, so hung work stands rather than floats
//   Vitrine     a roped-off display case, the furniture of an exhibition room
//   Stanchion   the post-and-rope that keeps visitors off the work
// ---------------------------------------------------------------------------

// The lit band at the top of a dark wall. Sits on top of the wall layer, so it
// reads as the ceiling throwing light down rather than as a header strip.
export function Cornice({ tone = '#15151b' }) {
  return <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 bg-[var(--tone)]" style={{ '--tone': tone }} />
}

// The floor fall at the foot of the wall. Heavier than the cornice, because a
// lit wall loses more light at the bottom than at the top.
export function Skirting({ tone = '#0c0c11' }) {
  return <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-56 bg-[var(--tone)]" style={{ '--tone': tone }} />
}

// A floor plane. Not a gradient — a single flat band in a tone a step off the
// wall, with a second band above it that is the wall's own base. Two flat tones
// read as "wall meets floor" without ever drawing a line between them.
export function Floor({ wall = '#1a1a21', deck = '#111117' }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0">
      <div className="h-10 bg-[var(--w)]" style={{ '--w': wall }} />
      <div className="h-28 bg-[var(--d)]" style={{ '--d': deck }} />
    </div>
  )
}

// A vitrine: the glass case an exhibition room stands in a corner. Drawn as
// flat planes only — a bone case body, an ink top and plinth foot, a receded
// panel for the glass, and a dark cast panel offset behind it. No blur.
export function Vitrine({ className = '', tone = '#e7e5e4' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <div className="relative">
        {/* the cast — a flat offset panel in place of a soft drop */}
        <span className="absolute inset-0 translate-x-2 translate-y-2 bg-black/35" />
        <div className="relative">
          {/* the case top */}
          <div className="h-2 bg-[#0c0c11]" />
          {/* the glass body — a receded panel, lighter at the front */}
          <div className="h-24 bg-[var(--tone)]" style={{ '--tone': tone }}>
            <div className="h-full mx-3 my-3 bg-black/15" />
          </div>
          {/* the plinth foot */}
          <div className="h-3 bg-[#0c0c11]" />
        </div>
      </div>
    </div>
  )
}

// The post-and-rope that keeps visitors off the work. Two posts and a sagging
// rope, drawn as a flat band between two small caps. Purely decorative.
export function Stanchion({ className = '', postTone = '#4c4b47', ropeTone = '#6b6a66' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <div className="flex items-end gap-0">
        <span className="w-1.5 h-6 bg-[var(--p)]" style={{ '--p': postTone }} />
        <span className="flex-1 h-2 mb-3 bg-[var(--r)]" style={{ '--r': ropeTone }} />
        <span className="w-1.5 h-6 bg-[var(--p)]" style={{ '--p': postTone }} />
      </div>
    </div>
  )
}

// A hung work: a real picture in the same stepped frame the certificates and
// projects use — a dark cast panel, an ink moulding, a bone mat, then the
// picture — with a wall label under it. This is what makes the wings read as a
// hang rather than a colour field: the collection on the wall is the Met's own
// public-domain plates (paintings and marble), each credited in the footer.
//
// `width` sets the hanging size; `nudge` lifts a piece off the grid line so the
// hang looks placed by hand rather than stamped. The image is square-cornered
// and keeps its own colour, exactly as the certificates do — the wall is
// monochrome, the works on it are not.
export function HungWork({
  src,
  alt,
  title,
  credit,
  year,
  className = '',
  width = 'w-28',
  nudge = '',
}) {
  return (
    <figure className={`pointer-events-none absolute ${className} ${nudge}`}>
      <div className={`relative ${width}`}>
        <span aria-hidden="true" className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-[#07070a]" />
        <div className="relative bg-[#08080b] p-1.5">
          <div className="bg-[#2b2b30] p-0.5">
            <div className="bg-[#e7e5e4] p-1.5">
              <img src={src} alt={alt} decoding="async" className="block w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-2.5">
        <span className="inline-block bg-[#e7e5e4] px-2 py-0.5 text-[13px] text-black/70">{title}</span>
        <div className="flex items-center justify-between mt-1 text-[13px] text-white/50 px-0.5">
          <span>{credit}</span>
          <span>{year}</span>
        </div>
      </figcaption>
    </figure>
  )
}

// A sculpture on a plinth: a real marble photographed in the round, cut out
// against the wall, standing on a flat plinth block with a cast panel behind.
// Used where a room has wall space between hangs and needs one object in the
// round rather than another rectangle.
export function Sculpture({ src, alt, title, credit, className = '', width = 'w-20' }) {
  return (
    <figure className={`pointer-events-none absolute ${className}`}>
      <div className={`relative ${width}`}>
        <span aria-hidden="true" className="absolute inset-0 translate-x-2 translate-y-2 bg-black/40" />
        <img src={src} alt={alt} decoding="async" className="relative block w-full h-auto" />
      </div>
      {/* the plinth the object stands on — two flat tones so it reads solid */}
      <div className="h-2 bg-[#08080b]" />
      <div className="h-4 bg-[#26262c]" />
      <figcaption className="mt-2.5 max-w-[10rem]">
        <span className="inline-block bg-[#e7e5e4] px-2 py-0.5 text-[13px] text-black/70">{title}</span>
        <span className="block mt-1 text-[13px] text-white/50 px-0.5">{credit}</span>
      </figcaption>
    </figure>
  )
}

// A framed work's wall label — the engraved plate hung under a picture. Shared
// so Certificates and Projects credit their works the same way.
export function WallLabel({ title, credit, year, isDark = true }) {
  return (
    <div className={`mt-4 font-grotesk ${isDark ? '' : ''}`}>
      <span
        className={`inline-block px-2.5 py-1 text-[13px] ${
          isDark ? 'bg-[#e7e5e4] text-black/70' : 'bg-[#e7e5e4] text-black/70'
        }`}
      >
        {title}
      </span>
      <div
        className={`flex items-center justify-between mt-2 text-sm px-1 ${
          isDark ? 'text-white/55' : 'text-black/60'
        }`}
      >
        <span>{credit}</span>
        <span>{year}</span>
      </div>
    </div>
  )
}
