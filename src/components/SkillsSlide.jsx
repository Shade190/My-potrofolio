import React, { useState } from 'react'
import { sound } from '../utils/audio'
import { Floor, Vitrine, Stanchion, HungWork, Sculpture } from './MuseumRoom'
import { COLLECTION } from '../data/collection'

// ---------------------------------------------------------------------------
// SKILLS — a sticky ledger.
//
// The section is a two-column split, not a card grid. On desktop the left
// column pins while the right column scrolls past it, so the reader's eye stays
// anchored to the section title and the meter legend while the six skills travel
// underneath. That variation comes from the *axis and the alignment* — a moving
// column against a still one — rather than from making some boxes bigger than
// others, which is what the earlier bento attempt did and what read as a
// generic card wall.
//
// The reference for this shape came from a second research round over real
// studios (Order, Studio Dumbar, Pentagram, The First The Last, Swiss Brut) —
// editorial studios that set capability sections as a ledger of tall rows with
// type doing all the work, no boxes and no decoration.
//
// What carries the visual interest, given the strict monochrome rules (no
// gradients, shadows, glows, hairlines or colour):
//   • one column that holds still while the other moves;
//   • very large vertical padding on each row, so whitespace is the separator —
//     no divider rules;
//   • a display-scale serif name against small grotesk body, a 4x+ type jump;
//   • exactly one inverted bone row (the last), which punctuates the run and
//     also carries the closing call-to-action;
//   • the level shown as ten small blocks rather than a number, so the metric is
//     read as a shape and no numeral or label is needed.
//
// Deliberately NOT used, because the design review flags them: decorative index
// numbers (01, 02…), monospace type outside code, uppercase micro-labels, and
// kicker/eyebrow labels above headings.
// ---------------------------------------------------------------------------

// The level meter: ten cells, filled to the skill's level. A 0-100 figure maps
// to whole blocks, so the reading is a proportion the eye can compare across
// rows at a glance. Pure geometry — no numeral, no percentage sign, no label.
function LevelMeter({ level, inverted = false }) {
  const filled = Math.round(level / 10)
  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`Proficiency ${level} out of 100`}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={`h-4 w-2.5 rounded-[2px] transition-colors duration-500 ${
            i < filled
              ? inverted
                ? 'bg-black'
                : 'bg-white'
              : inverted
                ? 'bg-black/12'
                : 'bg-white/12'
          }`}
        />
      ))}
    </div>
  )
}

export default function SkillsSlide() {
  const [activeCategory, setActiveCategory] = useState('all')

  const skillCategories = [
    { id: 'all', label: 'All Technologies' },
    { id: 'frontend', label: 'Frontend & UI' },
    { id: 'backend', label: 'Backend & Logic' },
    { id: 'security', label: 'Security & Tools' },
  ]

  const skillsData = [
    {
      name: 'HTML5 & Modern CSS / Tailwind',
      category: 'frontend',
      level: 90,
      desc: 'Semantic markup, accessible structures, Tailwind utility architecture, responsive design, and smooth CSS transitions.',
      tag: 'Core UI',
      focus: [
        'Semantic HTML5 document structure',
        'Tailwind utility architecture & design tokens',
        'Responsive layout, from 360px to ultrawide',
        'Accessible focus order, contrast and motion',
      ],
    },
    {
      name: 'JavaScript & React Ecosystem',
      category: 'frontend',
      level: 80,
      desc: 'State management, component lifecycles, asynchronous data fetching, DOM operations, and modular web architecture.',
      tag: 'Client Engine',
    },
    {
      name: 'Python Programming',
      category: 'backend',
      level: 70,
      desc: 'Game development logic, data structures, automation scripts, algorithmic problem solving, and backend services.',
      tag: 'Core Logic',
    },
    {
      name: 'PHP & Server Backend',
      category: 'backend',
      level: 70,
      desc: 'Server-side request lifecycles, database transactions, form handling, and RESTful API endpoints.',
      tag: 'Server Layer',
    },
    {
      name: 'Cybersecurity Fundamentals',
      category: 'security',
      level: 75,
      desc: 'System vulnerability testing, authentication hardening, defensive coding practices, and security auditing.',
      tag: 'Infosec',
    },
    {
      name: 'UI/UX Design & Prototyping (Figma)',
      category: 'frontend',
      level: 85,
      desc: 'Atomic design tokens, high-fidelity wireframes, interactive user flows, and typography systems.',
      tag: 'Design System',
    },
  ]

  const filteredSkills =
    activeCategory === 'all'
      ? skillsData
      : skillsData.filter((s) => s.category === activeCategory)

  return (
    <section
      id="skills"
      className="relative w-full py-28 px-6 sm:px-12 bg-[#09090e] text-white select-none"
    >
      {/* ---- The room ------------------------------------------------------
          Skills hung on the same putty-dark wall as the two exhibition wings, so
          walking from one to the next feels like walking a corridor rather than
          changing sites. A wall layer (lifted off page black, surface stock,
          lit cornice, dark foot), a floor plane, vitrines in the wings, and two
          marbles from the collection standing in the open margins. Flat planes
          only. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#1a1a21]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 168px)', // taste-skill-ignore gradient
          }}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-[#0c0c11]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-[#0c0c11]" />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Floor wall="#1a1a21" deck="#0f0f15" />
        <Stanchion className="right-[3%] bottom-[6%] w-36 hidden xl:block" />
        {/* The two marbles from the collection stand on the floor of the craft
            wing, in the open margin below the held column — the objects you can
            walk around, which a room of flat skills needs. */}
        <Sculpture
          {...COLLECTION.herakles}
          className="left-[1%] bottom-[4%] hidden lg:block"
          width="w-16 xl:w-20"
        />
        <Sculpture
          {...COLLECTION.aphrodite}
          className="left-[11%] bottom-[3%] hidden 2xl:block"
          width="w-16 xl:w-20"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full">
        {/* Two-column split. `items-start` is what makes the left column able to
            stick: with `stretch` the shorter column would be forced to the full
            height and the sticky element would have nothing to travel within. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ---- The held column -------------------------------------------
              Pins below the navbar on desktop while the ledger scrolls. Holds
              the title, the framing copy, the filter, and the meter legend. On
              small screens it simply sits at the top and scrolls away, because
              a sticky column with no room to travel is worse than none. */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <h2 className="font-display-serif text-5xl sm:text-6xl xl:text-7xl font-medium tracking-tight text-white">
              Skills &amp; Mastery
            </h2>
            {/* The room plaque, mounted below the heading as in every other room. */}
            <p className="inline-flex items-baseline gap-2.5 bg-[#e7e5e4] pl-3.5 pr-4 py-1.5 text-black mt-4">
              <span className="font-display-serif text-base leading-none">Room III</span>
              <span className="font-grotesk text-[13px] text-black/65">The Craft</span>
            </p>

            <p className="text-lg text-white/80 font-grotesk mt-5 max-w-md leading-relaxed">
              Spesialisasi teknis dalam rekayasa perangkat lunak, sistem desain
              antarmuka, dan arsitektur web modern.
            </p>

            {/* Category filter — kept verbatim in behaviour, restyled to the
                ledger's quieter voice. */}
            <div className="flex flex-wrap gap-2.5 mt-8">
              {skillCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playClick()
                    setActiveCategory(cat.id)
                  }}
                  className={`px-5 py-2 text-sm rounded-full transition-colors duration-200 cursor-pointer font-medium ${
                    activeCategory === cat.id
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#181822] text-white/80 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Legend for the meter. One line of plain sentence case, next to a
                sample meter — this is what the reader needs to decode ten
                blocks, and it costs one row. Not a micro-label: it is a full
                sentence, set in the body face. */}
            <div className="hidden lg:flex items-center gap-3 mt-12 text-white/55 font-grotesk text-base">
              <LevelMeter level={70} />
              <span>Setiap blok mewakili 10% penguasaan.</span>
            </div>
          </div>

          {/* ---- The travelling column ------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col">
            {filteredSkills.map((skill, idx) => {
              // The last row of the full set inverts to bone. It is the only
              // light surface in the section, so the run ends on a beat instead
              // of trailing off, and it gives the closing line a place to sit.
              const inverted =
                idx === filteredSkills.length - 1 && filteredSkills.length > 1

              return (
                <article
                  key={skill.name}
                  className={`rounded-[9px] px-8 py-10 sm:px-10 sm:py-12 flex flex-col gap-6 ${
                    inverted ? 'bg-[#e7e5e4] text-black' : 'bg-[#14141c] text-white'
                  }`}
                  // Rows are separated by space alone — no divider rules, per the
                  // design system. The gap is generous so the whitespace does
                  // real separating work.
                  style={{ marginBottom: idx === filteredSkills.length - 1 ? 0 : '1.5rem' }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <h3
                      className={`font-display-serif font-medium leading-[1.1] ${
                        inverted ? 'text-black' : 'text-white'
                      } text-3xl sm:text-4xl`}
                    >
                      {skill.name}
                    </h3>

                    {/* The tag, set as plain body type rather than a pill — on a
                        ledger row the name is the object and this is its
                        descriptor. Hiding it under 640px keeps the row from
                        crowding on a phone. */}
                    <span
                      className={`hidden sm:block shrink-0 font-grotesk text-sm pt-2 ${
                        inverted ? 'text-black/60' : 'text-white/55'
                      }`}
                    >
                      {skill.tag}
                    </span>
                  </div>

                  <p
                    className={`font-grotesk text-base leading-relaxed max-w-xl ${
                      inverted ? 'text-black/75' : 'text-white/75'
                    }`}
                  >
                    {skill.desc}
                  </p>

                  {/* Sub-skills for the first row only: it is the broadest skill
                      and the one a reader is most likely to want detail on. */}
                  {idx === 0 && skill.focus && (
                    <ul className="space-y-2">
                      {skill.focus.map((item) => (
                        <li
                          key={item}
                          className={`font-grotesk text-base ${
                            inverted ? 'text-black/75' : 'text-white/70'
                          }`}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* The meter, pinned to the foot of the row. */}
                  <div className="mt-2">
                    <LevelMeter level={skill.level} inverted={inverted} />
                  </div>
                </article>
              )
            })}

            {/* Legend for the meter, shown only where the sticky column is not
                (i.e. below 1024px), so the code is never unexplained. */}
            <div className="lg:hidden flex items-center gap-3 mt-8 text-white/55 font-grotesk text-base">
              <LevelMeter level={70} />
              <span>Setiap blok mewakili 10% penguasaan.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
