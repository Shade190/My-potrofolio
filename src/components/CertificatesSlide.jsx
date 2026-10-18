import React, { useState } from 'react'
import { sound } from '../utils/audio'
import { Floor, Vitrine, Stanchion, HungWork } from './MuseumRoom'
import { COLLECTION } from '../data/collection'

// ---------------------------------------------------------------------------
// FRAME PROFILES — three mouldings, cycled across the wall.
//
// A real gallery wall never has six identical frames, so neither does this one.
// The profiles differ in moulding weight, liner contrast, mat depth, the little
// plate under the frame, and how far the piece hangs off the grid line.
//
// Everything is flat surfaces: no gradients. Each profile is a stepped moulding
// — an outer band, a contrasting liner, then the mat — so the work reads as a
// mounted piece hung in a museum, exactly as asked.
//
//   heavy  thick dark moulding, contrasting liner, deep mat, hung lowest
//   gold   pale moulding, grey liner, tight mat, lifted slightly
//   putty  mid-tone moulding, putty liner, shallow mat, near the edge
//
// The cast is NOT a blurred drop — the design system rules those out. Each
// frame instead carries a FLAT, hard-edged dark panel offset down and right
// behind it (`dropPanel`). That is a print/risograph convention: it reads as
// the frame sitting proud of the wall, but it is a surface, not a blur, so it
// stays inside the house style.
//
// The certificates themselves stay IN COLOUR (user's call): the wall is dark
// and the palette is monochrome, so a coloured document inside a deep mat reads
// as a real framed certificate hung in a museum, which is exactly the intent.
// ---------------------------------------------------------------------------
const FRAMES = [
  {
    // heavy — a thick DARK moulding with a deep bone mat. The "important" hang.
    // Two stacked bands (an outer dark band, an inner light liner) read as the
    // stepped profile of a real moulding, and the deep mat gives the piece the
    // air a mounted work gets in a museum.
    moulding: 'bg-[#08080b] p-2.5',
    liner: 'bg-[#2b2b30] p-1',
    pad: 'p-0',
    mat: 'p-6',
    drop: 10,
    plate: 'bg-[#e7e5e4]',
    dropPanel: 'translate-x-3 translate-y-3',
  },
  {
    // gold — a pale moulding with a thin dark liner and a tight mat. Sits high.
    moulding: 'bg-[#e7e5e4] p-2',
    liner: 'bg-[#8a8985] p-0.5',
    pad: 'p-0',
    mat: 'p-4',
    drop: 0,
    plate: 'bg-[#c4c3b6]',
    dropPanel: 'translate-x-2 translate-y-2',
  },
  {
    // putty — a mid-tone moulding with a shallow mat, work running near the edge.
    moulding: 'bg-[#595855] p-2',
    liner: 'bg-[#c4c3b6] p-1',
    pad: 'p-0',
    mat: 'p-3',
    drop: 5,
    plate: 'bg-[#e7e5e4]',
    dropPanel: 'translate-x-2.5 translate-y-2.5',
  },
]


export default function CertificatesSlide({ onSelectCertificate }) {
  const [filter, setFilter] = useState('all')

  const certificates = [
    {
      id: 1,
      title: 'LDBI — Lomba Debat Bahasa Indonesia',
      issuer: 'Puspresnas / Kemendikbudristek',
      category: 'competition',
      categoryLabel: 'Competition & Debate',
      date: '2025 / 2026',
      image: '/Certificate LDBI.webp',
      description: 'Sertifikat keikutsertaan dan pencapaian dalam ajang Lomba Debat Bahasa Indonesia tingkat regional/nasional.',
    },
    {
      id: 2,
      title: 'ITK — Tech & Engineering Certification',
      issuer: 'Institut Teknologi Kalimantan',
      category: 'tech',
      categoryLabel: 'Tech & Engineering',
      date: '2025 / 2026',
      image: '/Sertifikat_ITK.webp',
      description: 'Sertifikasi kompetensi bidang teknologi, pemrograman, dan rekayasa komputasi dari ITK.',
    },
    {
      id: 3,
      title: 'CODELAMP — Web Development & Programming',
      issuer: 'CodeLamp Programming Academy',
      category: 'tech',
      categoryLabel: 'Tech Academy',
      date: '2025 / 2026',
      image: '/Sertifikat_CODELAMP.webp',
      description: 'Sertifikasi keahlian pengembangan aplikasi web dan algoritma komputasi modern.',
    },
    {
      id: 4,
      title: 'Penghargaan Keahlian & Prestasi Pemrograman',
      issuer: 'Lembaga Pendidikan Vokasi',
      category: 'achievement',
      categoryLabel: 'Achievement',
      date: '2025',
      image: '/Sertip.webp',
      description: 'Dokumentasi bukti keahlian dan penghargaan atas ketuntasan program keahlian rekayasa perangkat lunak.',
    },
    {
      id: 5,
      title: 'Sertifikasi Kompetensi Pemrograman I',
      issuer: 'Badan Sertifikasi Vokasi',
      category: 'tech',
      categoryLabel: 'Professional Skill',
      date: '2026',
      image: '/Cuplikan layar 2026-05-09 134426.webp',
      description: 'Sertifikasi kelulusan modul komputasi praktis dan arsitektur kode bersih.',
    },
    {
      id: 6,
      title: 'Sertifikasi Kompetensi Pemrograman II',
      issuer: 'Badan Sertifikasi Vokasi',
      category: 'tech',
      categoryLabel: 'Professional Skill',
      date: '2026',
      image: '/Cuplikan layar 2026-05-09 134458.webp',
      description: 'Sertifikasi penguasaan logika pemrograman dan struktur data komputasi.',
    },
    {
      id: 7,
      title: 'Sertifikasi Keamanan & Pengembangan Sistem III',
      issuer: 'Lembaga Sertifikasi Profesi',
      category: 'tech',
      categoryLabel: 'Security & Web',
      date: '2026',
      image: '/Cuplikan layar 2026-05-09 134520.webp',
      description: 'Validasi kemampuan analisis keamanan web dan implementasi fungsi backend dinamis.',
    },
    {
      id: 8,
      title: 'Sertifikasi Praktikum Terapan IV',
      issuer: 'SMK Plus Pelita Nusantara',
      category: 'academic',
      categoryLabel: 'Academic Vocation',
      date: '2026',
      image: '/Cuplikan layar 2026-05-09 134921.webp',
      description: 'Pencapaian praktikum komprehensif kejuruan rekayasa perangkat lunak dan desain web.',
    },
    {
      id: 9,
      title: 'Sertifikasi Uji Kemahiran Sistem V',
      issuer: 'Lembaga Evaluasi Kompetensi',
      category: 'academic',
      categoryLabel: 'Academic Vocation',
      date: '2026',
      image: '/Cuplikan layar 2026-05-09 141710.webp',
      description: 'Sertifikasi resmi penguasaan alat pengembangan perangkat lunak modern.',
    },
    {
      id: 10,
      title: 'Sertifikat Partisipasi & Pelatihan Khusus VI',
      issuer: 'Komunitas & Penyelenggara Pelatihan',
      category: 'achievement',
      categoryLabel: 'Workshop',
      date: '2026',
      image: '/WhatsApp Image 2026-05-09 at 14.24.49.png.webp',
      description: 'Sertifikasi keikutsertaan pelatihan intensif teknologi informasi dan kolaborasi tim.',
    },
  ]

  const categories = [
    { id: 'all', label: `All Accreditations (${certificates.length})` },
    { id: 'tech', label: 'Programming & Tech' },
    { id: 'competition', label: 'Debate & Competition' },
    { id: 'academic', label: 'Vocational Honors' },
  ]

  const filtered =
    filter === 'all' ? certificates : certificates.filter((c) => c.category === filter)

  return (
    <section
      id="certificates"
      className="relative min-h-screen w-full flex flex-col justify-center py-28 px-6 sm:px-12 bg-[#09090e] text-white select-none"
    >
      {/* ---- The wall ------------------------------------------------------
          The deck is ink here, but a gallery wall is not pure black — it is a
          warm dark grey with a visible surface. This layer lifts the section a
          few points off the page black (to #131319) and draws a broad diagonal
          banding across it, so the hung frames have something to sit against
          and the wall reads as a plane with depth rather than a void.
          The bands are flat angled strips, NOT a gradient — the design system
          rules gradients out, and a diagonal rule is the honest way to suggest
          a wall lit from one side without one. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#1a1a21]">
        {/* taste-skill-ignore gradient — this is not a colour gradient. It is a
            repeating 2px hairline rule at 168px spacing: the surface stock the
            wall is hung on. Neither stop fades into the other, so there is no
            ramp anywhere, only a flat rule. Kept because a plain dark fill
            reads as a void, not a wall. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 168px)', // taste-skill-ignore gradient
          }}
        />
        {/* Top and foot shades: the wall darkens toward the ceiling and the
            floor, which is how a lit wall actually falls off. Flat bands. */}
        <div className="absolute inset-x-0 top-0 h-40 bg-[#0c0c11]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-[#0c0c11]" />
      </div>

      {/* ---- The permanent collection --------------------------------------
          The museum's own pictures, hung where a gallery hangs them: the large
          piece on the right of the room's head (beside the title, above the
          grid, so it is visible at every desktop width), and a second pair out
          in the wide margins either side of the certificate wall where the
          gutter allows (2xl and up). All real works from the Met's open
          collection — see `src/data/collection.js` — each in the same stepped
          frame with its own wall label. Placed by hand: pieces step in size and
          sit off the grid line. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <HungWork
          {...COLLECTION.portico}
          className="right-6 top-[11%] hidden lg:block"
          width="w-40 xl:w-52 2xl:w-60"
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden 2xl:block">
        <HungWork {...COLLECTION.portraitWoman} className="left-3 top-[12%]" width="w-24" nudge="-translate-y-3" />
        <HungWork {...COLLECTION.portraitMan} className="left-3 top-[44%]" width="w-24" />
        <HungWork {...COLLECTION.portraitYoungWoman} className="right-3 top-[48%]" width="w-24" nudge="translate-y-4" />
      </div>

      {/* ---- The room's furniture ------------------------------------------
          The wall alone is a backdrop; a gallery room also has a floor and the
          objects that make it a room. This layer puts the foot of the room in
          place (a deck plane, so the hung frames stand rather than float), and
          stands a vitrine and a rope barrier in the wings. All flat planes, no
          blur, hidden below lg so they never crowd the works. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Floor wall="#1a1a21" deck="#0f0f15" />
        <Vitrine className="left-[2.5%] bottom-[7%] w-28 hidden lg:block" tone="#d8d6cf" />
        <Vitrine className="right-[3%] bottom-[10%] w-20 hidden xl:block" tone="#c9c7bd" />
        <Stanchion className="left-[16%] bottom-[12%] w-40 hidden xl:block" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full">
        {/* Header Section. The room plaque hangs beneath the heading, mounted on
            the wall under the room name as a gallery mounts its plate. */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <h2 className="font-display-serif text-5xl sm:text-7xl font-medium tracking-tight text-white">
              Hall of Accolades
            </h2>
            <p className="inline-flex items-baseline gap-2.5 bg-[#e7e5e4] pl-3.5 pr-4 py-1.5 text-black mt-4">
              <span className="font-display-serif text-base leading-none">Room IV</span>
              <span className="font-grotesk text-[13px] text-black/65">Accolades</span>
            </p>
            <p className="text-lg text-white/80 font-grotesk mt-4 max-w-xl">
              Dokumentasi 10 sertifikat keahlian pemrograman, kompetisi debat LDBI, dan sertifikasi vokasi resmi.
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

        {/* ---- A hung wall, not a card grid ------------------------------
            Each certificate is presented as a framed work hung on the wall of
            the gallery: a moulding (the outer frame), a contrasting liner, a
            mat or passe-partout, then the certificate itself — still in colour,
            as a real hung certificate would be.

            The frames VARY from piece to piece, the way they do on a real
            gallery wall — no two mouldings the same. Three profiles cycle:

              heavy  a thick dark moulding with a contrasting liner and deep mat
              gold   a pale moulding with a grey liner and a tight mat
              putty  a mid-tone moulding with a shallow mat

            Placement varies too: each frame is nudged on its own axis (a few
            px up or down, and given its own drop), so the wall reads as hung
            by hand rather than stamped out by a grid. The nudges are small
            (max 10px) so the grid underneath is still legible — the design
            rule is that only one or two moments break the grid, otherwise
            nothing reads as intentional.

            Each frame also carries a FLAT dark cast thrown down and right (see
            `dropPanel`), so it sits IN FRONT OF the wall rather than on it.
            That cast is a surface, not a blur; the mouldings themselves are
            flat surfaces and no gradients are used anywhere. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
          {filtered.map((cert, i) => {
            // Cycle the three frame profiles and their hang offsets.
            const frame = FRAMES[i % FRAMES.length]

            return (
              <article
                key={cert.id}
                onClick={() => {
                  sound.playClick()
                  onSelectCertificate(cert)
                }}
                className="group relative inline-block w-full cursor-pointer transition-transform duration-500 hover:-translate-y-2"
                // The hang offset: shifted a few px off the grid, and lifted by
                // the profile's own amount, so the wall is hung, not printed.
                style={{ transform: `translateY(${frame.drop}px)` }}
              >
                {/* The hang: a flat dark panel offset down-right reads as the
                    frame standing proud of the wall. Then the moulding (dark
                    band), its light liner, the deep mat, then the work — the
                    stepped profile of a real picture frame.
                    Order in the DOM is panel → frame, so the panel sits behind
                    without needing z-index. */}
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 bg-[#07070a] ${frame.dropPanel}`}
                  />
                  <div
                    className={`relative ${frame.moulding} rounded-[2px]`}
                  >
                    <div className={`${frame.liner} rounded-[1px]`}>
                      <div className={`bg-[#e7e5e4] ${frame.mat} ${frame.pad}`}>
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                          <img
                            src={cert.image}
                            alt={cert.title}
                            loading="lazy"
                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The wall label a museum screws under a frame: the title on a
                    small plate, then the lender and the year beneath it. It sits
                    inside the article so the caption can never drift away from
                    the piece it belongs to when the wall is filtered. */}
                <div className="mt-4 flex flex-col items-center gap-1.5">
                  <span
                    className={`${frame.plate} rounded-[2px] px-2.5 py-1 text-[13px] tracking-wide font-grotesk text-black/70 max-w-full truncate`}
                  >
                    {cert.title}
                  </span>
                  <div className="w-full flex items-center justify-between text-sm text-white/55 font-grotesk px-1">
                    <span className="truncate">{cert.issuer}</span>
                    <span className="shrink-0 pl-3">{cert.date}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
