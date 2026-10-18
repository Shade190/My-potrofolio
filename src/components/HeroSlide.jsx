import React from 'react'
import { ArrowRight } from 'lucide-react'
import { sound } from '../utils/audio'

export default function HeroSlide({ onNavigate }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between pt-36 pb-12 px-6 sm:px-12 bg-[#c4c3b6] text-black select-none"
    >
      {/* Background plate — an 18th-century Italianate landscape (William
          Gilpin, "Landscape with hills and a lake", ca. 1772 — Met Open Access,
          public domain), reduced to grey so it sits inside the monochrome
          palette. It is a flat image layer behind everything, not a gradient or
          a shadow.
          A uniform putty veil sits over the whole plate (not a hard-edged scrim
          on one side — that drew a visible vertical seam) so the ink type keeps
          its contrast wherever it lands, while the painting still reads as a
          painting rather than a watermark. */}
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden bg-[#c4c3b6]">
        <img
          src="/hero-renaissance.jpg"
          srcSet="/hero-renaissance-sm.jpg 960w, /hero-renaissance.jpg 1920w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-[#c4c3b6]/55" />
      </div>

      {/* Hero Core Content: Left/Center aligned so the 3D sculpture shines on the right */}
      <div className="relative z-20 max-w-7xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 flex flex-col items-start">
          <h1 className="font-display-serif text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight text-black leading-[1.0]">
            Digital Artifacts &amp; Spatial Code.
          </h1>
          {/* The room plaque: the brass plate a gallery mounts below the title
              of the show. Flat surfaces only — a bone plate with the room name
              and what hangs in it. */}
          <p className="inline-flex items-baseline gap-2.5 bg-[#e7e5e4] pl-3.5 pr-4 py-1.5 text-black mt-6">
            <span className="font-display-serif text-base leading-none">Room I</span>
            <span className="font-grotesk text-[13px] text-black/65">Lobby &amp; statement</span>
          </p>

          {/* Subtitle / Lead Paragraph in full rich ink */}
          <p className="mt-8 text-lg sm:text-xl text-black font-grotesk leading-relaxed max-w-2xl">
            Software engineer and interface designer from SMK Plus Pelita Nusantara. Building modern web experiences with Python, React.
          </p>

          {/* Action Button Pills */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                sound.playClick()
                onNavigate('projects')
              }}
              className="btn-pill btn-pill-dark group cursor-pointer text-sm"
            >
              <span>Explore Exhibition</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => {
                sound.playClick()
                onNavigate('about')
              }}
              className="btn-pill btn-pill-outline cursor-pointer text-sm"
            >
              About Me
            </button>
          </div>

          {/* Stat Pairs: font-grotesk so numerals render crisp and clean */}
          <div className="mt-14 w-full max-w-lg grid grid-cols-3 gap-8 font-grotesk text-left">
            <div>
              <span className="block text-4xl sm:text-5xl font-bold text-black tracking-tight">
                10
              </span>
              <span className="block text-sm text-black/80 mt-1.5 font-medium">
                Accreditations
              </span>
            </div>
            <div>
              <span className="block text-4xl sm:text-5xl font-bold text-black tracking-tight">
                3
              </span>
              <span className="block text-sm text-black/80 mt-1.5 font-medium">
                Key projects
              </span>
            </div>
            <div>
              <span className="block text-4xl sm:text-5xl font-bold text-black tracking-tight">
                4+
              </span>
              <span className="block text-sm text-black/80 mt-1.5 font-medium">
                Core stacks
              </span>
            </div>
          </div>
        </div>

        {/* Right side spacer allowing the interactive 3D sculpture full visual presence */}
        <div className="lg:col-span-4 h-48 lg:h-full pointer-events-none" />
      </div>
    </section>
  )
}
