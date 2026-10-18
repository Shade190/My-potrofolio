import React, { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { GithubIcon } from './Icons'
import { sound } from '../utils/audio'
import { Floor, Vitrine, Stanchion, HungWork } from './MuseumRoom'
import { COLLECTION } from '../data/collection'

// ---------------------------------------------------------------------------
// PROJECT FRAME — the same idiom as the certificates wall: a work does not sit
// in a UI card, it is HUNG. Each project is framed (dark moulding + contrasting
// liner + bone mat) and labelled on a plate, so the two dark sections read as
// two rooms of one museum rather than a card grid followed by a card grid.
// ---------------------------------------------------------------------------
const FRAME = {
  moulding: 'bg-[#08080b] p-2.5',
  liner: 'bg-[#2b2b30] p-1',
  mat: 'p-4',
  plate: 'bg-[#e7e5e4]',
}

export default function ProjectsSlide({ onSelectProject }) {
  const [filter, setFilter] = useState('all')

  const projects = [
    {
      id: 1,
      title: 'E-commerce Food & Order Platform',
      category: 'web',
      categoryLabel: 'Web Engineering',
      image: '/E commerce.webp',
      description:
        'Platform e-commerce modern untuk pembelian dan pemesanan makanan dengan antarmuka yang intuitif, tata letak responsif, keranjang belanja interaktif, dan alur pemesanan yang cepat.',
      tags: ['Web Engineering', 'HTML5', 'CSS3', 'JavaScript', 'Responsive UI', 'UX Architecture'],
      github: 'https://github.com/Shade190',
    },
    {
      id: 2,
      title: 'Interactive Python Arcade Game',
      category: 'game',
      categoryLabel: 'Game Development',
      image: '/Screenshot 2025-11-28 081028.webp',
      description:
        'Game interaktif berbasis Python yang mengimplementasikan mekanik gameplay dinamis, deteksi tabrakan presisi, loop permainan real-time, dan sistem skor terintegrasi.',
      tags: ['Game Development', 'Python', 'Game Physics', 'Collision Logic', 'Algorithmic State'],
      github: 'https://github.com/Shade190',
    },
    {
      id: 3,
      title: 'Digital Design System & Prototypes',
      category: 'design',
      categoryLabel: 'UI/UX Architecture',
      image: '/Screenshot 2025-11-28 081743.webp',
      description:
        'Sistem desain modular dan prototype interaktif berstandar profesional yang dirancang di Figma dengan hierarki tipografi editorial, token warna konsisten, dan komponen UI siap koding.',
      tags: ['UI/UX Architecture', 'Figma', 'Design Systems', 'Token Hierarchy', 'User Flows'],
      github: 'https://github.com/Shade190',
    },
  ]

  const categories = [
    { id: 'all', label: 'All Works' },
    { id: 'web', label: 'Web' },
    { id: 'game', label: 'Game' },
    { id: 'design', label: 'Design' },
  ]

  const filtered =
    filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  return (
    <section
      id="projects"
      className="relative min-h-screen w-full flex flex-col justify-center py-28 px-6 sm:px-12 bg-[#09090e] text-white select-none"
    >
      {/* ---- The wall ------------------------------------------------------
          Same room-making as the certificates wall: the deck is ink, but a hung
          wall is not a void. This layer lifts the section a few points off the
          page black and draws a broad diagonal banding across it, so the frame
          works below have something to sit against. Flat bands, not a ramp —
          the design system rules gradients out, and an angled rule is the
          honest way to suggest a wall lit from one side. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#1a1a21]">
        {/* taste-skill-ignore gradient — a repeating 2px hairline at 168px, the
            surface stock of the wall. Neither stop ramps into the other, so
            there is no colour gradient here, only a flat rule. */}
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

      {/* ---- The room's furniture ------------------------------------------
          As in the accolades wing: a floor so the hung works stand, the wing's
          name set into the cornice, and a vitrine and rope barrier in the wings.
          Flat planes only. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Floor wall="#1a1a21" deck="#0f0f15" />
        <Vitrine className="left-[2%] bottom-[8%] w-24 hidden lg:block" tone="#d8d6cf" />
        <Vitrine className="right-[3%] bottom-[12%] w-20 hidden xl:block" tone="#c9c7bd" />
        <Stanchion className="right-[15%] bottom-[7%] w-36 hidden xl:block" />
      </div>

      {/* The collection again, so the two dark rooms read as one museum rather
          than two sections: one piece beside the exhibition's head (visible at
          every desktop width) and one out in the wide margin where the gutter
          allows. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <HungWork
          {...COLLECTION.portraitMan}
          className="right-6 top-[13%] hidden lg:block"
          width="w-32 xl:w-40 2xl:w-44"
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden 2xl:block">
        <HungWork {...COLLECTION.portico} className="left-3 top-[20%]" width="w-28" nudge="-translate-y-3" />
        <HungWork {...COLLECTION.portraitWoman} className="left-3 top-[56%]" width="w-24" nudge="translate-y-2" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <h2 className="font-display-serif text-5xl sm:text-7xl font-medium tracking-tight text-white">
              Featured Exhibition
            </h2>
            <p className="inline-flex items-baseline gap-2.5 bg-[#e7e5e4] pl-3.5 pr-4 py-1.5 text-black mt-4">
              <span className="font-display-serif text-base leading-none">Room V</span>
              <span className="font-grotesk text-[13px] text-black/65">Exhibition</span>
            </p>
            <p className="text-lg text-white/80 font-grotesk mt-4 max-w-xl">
              Tiga pilar karya unggulan: arsitektur web modern, rekayasa game Python, dan sistem desain UI/UX.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick()
                  setFilter(cat.id)
                }}
                className={`px-5 py-2 text-sm uppercase tracking-wider rounded-full transition-colors duration-200 cursor-pointer font-medium ${
                  filter === cat.id
                    ? 'bg-white text-black font-semibold'
                    : 'bg-[#181822] text-white/80 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Three works, three frames — #projects-grid is the anchor the scroll
            journey line wraps around (see ScrollPath.jsx). Each project is hung
            like the certificates beside it: moulding, liner, mat, work, plate. */}
        <div id="projects-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-14">
          {filtered.map((proj) => (
            <article
              key={proj.id}
              className="group flex flex-col"
            >
              {/* The hung work. A flat dark cast behind it (a surface, not a
                  blur) reads it as standing proud of the wall. */}
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 bg-[#07070a]"
                />
                <div className={`relative ${FRAME.moulding} rounded-[2px]`}>
                  <div className={`${FRAME.liner} rounded-[1px]`}>
                    <div className={`bg-[#e7e5e4] ${FRAME.mat}`}>
                      <div
                        onClick={() => {
                          sound.playClick()
                          onSelectProject(proj)
                        }}
                        className="relative aspect-[16/10] w-full overflow-hidden bg-black cursor-pointer"
                      >
                        <img
                          src={proj.image}
                          alt={proj.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* The wall label: title on a plate, then the credit line. */}
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <span
                  className={`${FRAME.plate} rounded-[2px] px-2.5 py-1 text-[13px] tracking-wide font-grotesk text-black/70 max-w-full truncate`}
                >
                  {proj.title}
                </span>
                <div className="w-full flex items-center justify-between text-sm text-white/55 font-grotesk px-1">
                  <span className="truncate">{proj.categoryLabel}</span>
                  <span className="shrink-0 pl-3">2026</span>
                </div>
              </div>

              {/* The text panel under the label: description and tags, set as a
                  wall text would be — quiet, on the wall, below the work. */}
              <p className="mt-5 text-base text-white/75 font-grotesk leading-relaxed">
                {proj.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-5">
                {proj.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3.5 py-1.5 rounded-full bg-[#20202c] text-white/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-6 flex items-center justify-between mt-auto gap-4">
                <a
                  href={proj.github}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sound.playClick()}
                  className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors font-medium"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>Repository</span>
                </a>

                <button
                  onClick={() => {
                    sound.playClick()
                    onSelectProject(proj)
                  }}
                  className="btn-pill btn-pill-light text-sm font-semibold cursor-pointer"
                >
                  <span>Inspect</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
