import React, { useState, useRef, useCallback, useEffect } from 'react'
import { PaintBucket, Contrast } from 'lucide-react'
import { sound } from '../utils/audio'

// Owner portrait — reference style: a flat photo card (bone frame, no shadow,
// no notch) with the portrait filling the plate, a caption over its foot, and
// an ID line beneath, mirroring the reference the user shared. The photo ships
// desaturated so the portrait sits naturally on the putty field.
//
// The frame carries a small bucket mark. Press it and the picture is poured
// over with colour — a splash sheet sweeps down the frame and the photograph
// itself comes up in full colour. Press again and it pours back to monochrome.
// That is the one place on the site where colour is allowed, and it is the
// visitor's choice to open it.
function OwnerPortrait() {
  const [failed, setFailed] = useState(false)
  const [painted, setPainted] = useState(false)
  const [pouring, setPouring] = useState(false)
  const pourTimer = useRef(null)

  // The pour animation is a fixed 1.1s; the class is cleared on a timer rather
  // than on `animationend` so a mid-flight re-press cannot leave the layer
  // stuck on screen (animationend would fire for the cancelled run).
  useEffect(() => () => window.clearTimeout(pourTimer.current), [])

  const togglePaint = useCallback(() => {
    if (sound) sound.playClick()
    const next = !painted
    setPainted(next)
    // Restart the splash even if one is already running, so a rapid double
    // press reads as two pours rather than one long one.
    setPouring(false)
    window.clearTimeout(pourTimer.current)
    window.requestAnimationFrame(() => {
      setPouring(true)
      pourTimer.current = window.setTimeout(() => setPouring(false), 1150)
    })
  }, [painted])

  return (
    <figure data-push className="w-full max-w-sm mx-auto lg:mx-0">
      {/* The portrait is HUNG, like every other work in the building: a flat dark
          cast behind it (a surface, not a blur), a stepped moulding, a bone mat,
          then the photograph. It used to be a single rounded white card, which
          read as a UI tile; the stepped frame matches the certificates wall so
          the site reads as one collection. */}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 translate-x-2.5 translate-y-2.5 bg-[#07070a]"
        />
        <div className="relative bg-[#08080b] p-2.5">
          <div className="bg-[#2b2b30] p-1">
            <div className="bg-[#e7e5e4] p-3">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#595855]">
                {!failed ? (
                  <>
                    <img
                      src="/owner.jpg"
                      alt="Kevin Mahardika Kumaeni, software engineer and interface designer"
                      width="480"
                      height="600"
                      loading="lazy"
                      decoding="async"
                      onError={() => setFailed(true)}
                      className={`portrait-photo w-full h-full object-cover ${
                        painted ? 'is-painted' : 'portrait-desat'
                      }`}
                    />
                    {/* The pour sheet. Flat colour fields with a wet, uneven
                        leading edge, tipped down the frame. Decorative only. */}
                    {pouring && (
                      <span
                        aria-hidden="true"
                        className="portrait-pour is-running"
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500' preserveAspectRatio='none'%3E%3Cdefs%3E%3C/defs%3E%3Crect width='400' height='500' fill='%2306d6a0'/%3E%3Cpath d='M0 0 L400 0 L400 210 C 350 250 300 180 250 225 C 200 270 150 195 100 240 C 60 275 25 215 0 250 Z' fill='%234d7fff'/%3E%3Cpath d='M0 0 L400 0 L400 140 C 340 180 285 110 230 155 C 175 200 120 125 70 170 C 40 197 18 150 0 175 Z' fill='%23ffd166'/%3E%3Cpath d='M0 0 L400 0 L400 80 C 330 120 270 55 210 95 C 150 135 95 65 45 105 C 25 122 10 90 0 105 Z' fill='%23e4572e'/%3E%3Cpath d='M0 0 L400 0 L400 34 C 320 66 250 18 180 46 C 120 70 60 26 0 50 Z' fill='%23c04df0'/%3E%3Ccircle cx='90' cy='300' r='22' fill='%23ffffff' opacity='0.55'/%3E%3Ccircle cx='310' cy='380' r='30' fill='%23ffffff' opacity='0.42'/%3E%3Ccircle cx='210' cy='440' r='15' fill='%23ffffff' opacity='0.5'/%3E%3C/svg%3E\")",
                          backgroundSize: '100% 100%',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}
                  </>
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center font-classical text-white/65 text-7xl tracking-wider select-none"
                  >
                    KM
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* The paint mark, hung at the frame's right side like a small gallery
              stamp. Press = pour colour over the picture (and keep it); press
              again = pour it back to monochrome. Sits outside the frame's right
              edge, clear of the caption line below. */}
          <button
            type="button"
            onClick={togglePaint}
            aria-pressed={painted}
            aria-label={
              painted
                ? 'Drain the colour from the portrait'
                : 'Pour colour over the portrait'
            }
            title={painted ? 'Back to monochrome' : 'Pour colour'}
            className="portrait-paint-btn absolute top-1/2 -right-4 -translate-y-1/2 w-11 h-11 z-30 flex items-center justify-center bg-[#08080b] text-[#e7e5e4] hover:bg-[#2b2b30] cursor-pointer"
          >
            {painted ? <Contrast size={18} /> : <PaintBucket size={18} />}
          </button>
        </div>
      </div>

      {/* The wall label, the same idiom as the certificates: the title, then the
          credit line — hung under the frame, not printed on the photo. */}
      <figcaption className="mt-4 font-grotesk">
        <span className="inline-block bg-[#e7e5e4] px-2.5 py-1 text-[13px] text-black/70">
          Kevin Mahardika Kumaeni
        </span>
        <div className="flex items-center justify-between mt-2 text-sm text-black/60 px-1">
          <span>Rekayasa Perangkat Lunak</span>
          <span>SMK Plus Pelita Nusantara</span>
        </div>
      </figcaption>
    </figure>
  )
}

export default function AboutSlide({ onNavigate }) {
  const specializations = [
    {
      title: 'Full-Stack Engineering',
      desc: 'Architecting responsive applications with modern JavaScript, React, Python, and scalable backend logic.',
    },
    {
      title: 'Spatial & UI/UX Design',
      desc: 'Crafting intentional digital environments with tactile feedback, precision typography, and WebGL depth.',
    },
    {
      title: 'Cybersecurity Fundamentals',
      desc: 'Exploring system vulnerability assessment, defensive programming principles, and secure computational logic.',
    },
    {
      title: 'Vocation & Continuous Learning',
      desc: 'Active student developer at SMK Plus Pelita Nusantara, constantly testing and deploying software systems.',
    },
  ]

  return (
    <section
      id="about"
      className="relative min-h-screen w-full flex flex-col justify-center py-24 px-6 sm:px-12 bg-[#c4c3b6] text-black select-none"
    >
      {/* Background plate — a second museum landscape, so the painted run that
          opens on the hero continues through the About slide instead of
          stopping after one section. This one is an actual OIL painting
          (Richard Wilson, "Lake Nemi and Genzano from the Terrace of the
          Capuchin Monastery", 1756–57 — The Met, public domain), reduced to
          grey so it sits inside the monochrome palette.
          The plate belongs to the LIGHT half of the page only. Below this
          section the deck turns to ink, and the paintings stop there: the run
          covers putty slides (Hero, About) and never bleeds into a dark one. */}
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden bg-[#c4c3b6]">
        <img
          src="/about-renaissance.jpg"
          srcSet="/about-renaissance-sm.jpg 960w, /about-renaissance.jpg 1920w"
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-left"
        />
        {/* Veil slightly lighter than the hero's, so the oil painting's hillside
            and tree actually read at the edges — the text blocks sit in the
            clear middle column, and the painting stays a painting rather than
            a wash. */}
        <div className="absolute inset-0 bg-[#c4c3b6]/72" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full">
        {/* Section Header. The room plaque sits directly beneath the heading,
            hung on the wall under the room name the way a gallery mounts the
            plate below the title of the show. */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <h2 className="font-display-serif text-5xl sm:text-7xl font-medium tracking-tight text-black">
              About The Creator
            </h2>
            <p className="inline-flex items-baseline gap-2.5 bg-[#e7e5e4] pl-3.5 pr-4 py-1.5 text-black mt-4">
              <span className="font-display-serif text-base leading-none">Room II</span>
              <span className="font-grotesk text-[13px] text-black/65">The Maker</span>
            </p>
          </div>
          <span className="text-base text-black font-medium">
            Kevin Mahardika Kumaeni &mdash; SMK Plus Pelita Nusantara
          </span>
        </div>

        {/* Balanced spread: portrait (5) + narrative (7). The portrait is
            centred against the narrative column rather than pinned to the top,
            so the card sits in the middle of the room instead of hanging off
            the header. `items-center` on the grid does that; on small screens
            the stack keeps its natural top-to-bottom order. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Portrait card — on small screens the narrative leads and the
              portrait follows, so the wall label under the frame can never be
              read as a label sitting above the quote. `order` does that; the
              grid's own order puts the portrait first on desktop as before. */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start lg:self-center order-2 lg:order-1">
            <OwnerPortrait />
          </div>

          {/* Narrative — set as MUSEUM WALL TEXT, not a card.
              A gallery does not put its label in a box with rounded corners; it
              mounts a plate on the wall and sets the text directly on the
              surface. So the quote becomes a large wall quote on bare putty, the
              biography follows as wall text at reading size, and the tags are
              engraved lines on a bone plate rather than pills. The whole column
              sits on the putty field with no container, which is what makes it
              read as a wall rather than a UI card. */}
          <div className="lg:col-span-7 flex flex-col gap-10 order-1 lg:order-2">
            <div>
              {/* The wall quote: the single largest line in the room, set on the
                  bare wall with an ink bar marking it as a quotation, the way a
                  gallery sets a pull-quote above the body text. */}
              <blockquote className="relative pl-6 font-display-serif text-2xl sm:text-3xl font-medium text-black leading-snug">
                <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-1.5 bg-black" />
                &ldquo;Programming is the architecture of thought made visible and interactive.&rdquo;
              </blockquote>

              {/* Wall text: the biography, at reading size, on the wall. */}
              <div className="mt-8 space-y-5 text-black font-grotesk text-base leading-relaxed max-w-2xl">
                <p>
                  Halo, perkenalkan! Saya adalah <strong className="font-semibold">Kevin Mahardika Kumaeni</strong>, seorang programmer dan desainer antarmuka dari <span className="font-medium">SMK Plus Pelita Nusantara</span>.
                </p>
                <p>
                  Saya mendedikasikan waktu saya untuk mendalami bahasa pemrograman berbasis <strong className="font-semibold">Python</strong>, <strong className="font-semibold">PHP</strong>, <strong className="font-semibold">JavaScript</strong>, dan <strong className="font-semibold">HTML/CSS</strong>. Ketertarikan mendalam saya pada rekayasa perangkat lunak mendorong saya untuk terus membangun karya digital yang tidak hanya berfungsi secara teknis, tetapi juga memiliki rasa seni yang kuat dan visual yang berkarakter.
                </p>
                <p>
                  Fokus hobi dan riset saya berpusat pada eksplorasi komputasi modern, terutama dalam pengembangan aplikasi web interaktif, visualisasi 3D spasial, dan fondasi keamanan siber.
                </p>
              </div>

              {/* The engraved plate: the disciplines, listed on a bone plate the
                  way a museum lists the media of a work. Flat, no pills. */}
              <div className="mt-9 inline-flex flex-col gap-2.5 bg-[#e7e5e4] px-6 py-5">
                <span className="font-grotesk text-[13px] text-black/60">Practice &amp; media</span>
                <span className="font-display-serif text-lg leading-snug text-black">
                  {[
                    'Web Development',
                    'UI/UX Design',
                    'Python Programming',
                    'Cybersecurity',
                    'Figma Prototyping',
                    'Three.js Graphics',
                  ].join(' · ')}
                </span>
              </div>
            </div>

            {/* Quick Callout Plaque — the acquisitions line: a flat ink plate
                naming the honours, with the door through to that room. Square,
                no radius, no shadow: a plaque, not a card. */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-black text-white gap-6">
              <div>
                <span className="font-display-serif text-2xl font-medium text-white block">
                  LDBI &amp; Programming Awards
                </span>
                <span className="text-base text-white/80 block mt-2">
                  10 verified certifications across competitions, tech academies, and vocational honors.
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playClick()
                  onNavigate('certificates')
                }}
                className="btn-pill btn-pill-light text-sm font-semibold whitespace-nowrap self-start sm:self-auto cursor-pointer"
              >
                View Accolades
              </button>
            </div>
          </div>
        </div>

        {/* Capabilities — a ROW OF DISPLAY CASES beneath the wall text.
            The old version was four identical rounded cards, the exact
            "rows of identical boxed cards" the house style bans. A museum
            instead lines up vitrines: each capability is a labelled exhibit
            standing on a plinth foot, numbered by room-position only (the
            heading carries the count), with the plate under it. Square corners,
            flat surfaces, and a foot band so each reads as standing on the
            floor rather than floating. */}
        <div className="mt-20">
          <div className="flex items-end justify-between mb-3">
            <h3 className="font-display-serif text-3xl sm:text-4xl font-medium text-black">
              Core Capabilities
            </h3>
            <span className="hidden sm:block font-grotesk text-sm text-black/60">
              Four disciplines on display
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {specializations.map((spec) => (
              <div key={spec.title} className="flex flex-col">
                {/* The vitrine: an ink body with the title set inside, standing
                    on a bone mat foot — the way a case sits on a plinth top. */}
                <div className="flex-1 bg-black text-white px-6 pt-7 pb-6">
                  <h4 className="font-display-serif text-2xl font-semibold text-white leading-tight">
                    {spec.title}
                  </h4>
                </div>
                {/* The plinth foot: a bone band, so the case has a base. */}
                <div className="h-2.5 bg-[#e7e5e4]" />
                {/* The label under the case, set on the wall. */}
                <p className="mt-4 text-base text-black/85 font-grotesk leading-relaxed">
                  {spec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
