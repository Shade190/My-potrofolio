import React from 'react'
import { ArrowUp } from 'lucide-react'
import { sound } from '../utils/audio'

export default function Footer({ onScrollTop }) {
  return (
    <footer className="w-full bg-[#07070a] text-white py-16 px-6 sm:px-12 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand & Monogram */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center font-display-serif font-bold text-base text-white">
            KM
          </div>
          <div>
            <h4 className="font-display-serif text-lg font-semibold tracking-wide text-white">
              Kevin Mahardika Kumaeni
            </h4>
            <p className="text-sm text-white/70 font-grotesk mt-0.5">
              SMK Plus Pelita Nusantara &mdash; Web Developer &amp; UI/UX Designer
            </p>
          </div>
        </div>

        {/* Center Editorial Statement */}
        <div className="text-sm text-white/70 font-grotesk tracking-wide">
          <span>&copy; {new Date().getFullYear()} Kevin Mahardika. Built with React, Tailwind.</span>
        </div>

        {/* Back to top Pill Action Button (High Contrast!) */}
        <button
          onClick={() => {
            sound.playClick()
            onScrollTop()
          }}
          className="btn-pill bg-white text-black hover:bg-[#e7e5e4] text-sm font-semibold uppercase tracking-wider group cursor-pointer"
        >
          <span>Return To Top</span>
          <ArrowUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      </div>

      {/* ---- The collection credit -----------------------------------------
          The pictures and marbles hung in the exhibition wings are real works
          from the Metropolitan Museum of Art's open-access collection, released
          under CC0. They are shown to give the wings a permanent collection, not
          as the artist's own work, so they are credited here, plainly, the way a
          gallery credits loans. Set apart by space and a tone step, not a rule. */}
      <div className="max-w-7xl mx-auto mt-16 bg-white/[0.04] px-6 py-6">
        <p className="text-sm text-white/55 font-grotesk leading-relaxed max-w-3xl">
          Works hung in the exhibition wings are from The Metropolitan Museum of Art
          Open Access collection, released under CC0: <em>Marble statue of Aphrodite</em>,
          <em> Marble statue of Herakles</em>, <em>Portrait of a Man</em>,
          <em> Portrait of a Woman</em>, <em>Portrait of a Young Woman</em> and
          <em> A Renaissance Portico with Elegant Figures</em>.
        </p>
      </div>
    </footer>
  )
}
