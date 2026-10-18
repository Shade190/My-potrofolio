import React from 'react'

export default function HexNav({ activeSection, totalSections = 6, onSelect, isDark }) {
  const sections = [
    { label: 'Index' },
    { label: 'About' },
    { label: 'Skills' },
    { label: 'Certificates' },
    { label: 'Projects' },
    { label: 'Contact' },
  ]

  const isLight = !isDark && activeSection < 2

  return (
    <aside
      className="fixed right-6 sm:right-12 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-6 pointer-events-auto"
      aria-label="Slide Indicator"
    >
      <div className="flex flex-col items-center gap-5">
        {sections.map((sec, idx) => {
          const isActive = activeSection === idx
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className="group relative flex items-center justify-center p-1 cursor-pointer focus:outline-none"
              title={sec.label}
              aria-label={`Jump to slide ${sec.label}`}
            >
              {/* Tooltip label on hover */}
              <span
                className={`absolute right-8 px-3 py-1.5 text-sm uppercase tracking-wider rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0 font-medium ${
                  isLight
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                }`}
              >
                {sec.label}
              </span>

              {/* Hexagonal indicator */}
              <div
                className={`w-3.5 h-3.5 hexagon transition-[background-color,transform,border-color] duration-300 ${
                  isActive
                    ? isLight
                      ? 'bg-black scale-125'
                      : 'bg-white scale-125'
                    : isLight
                    ? 'border border-black/50 hover:border-black hover:scale-110 bg-transparent'
                    : 'border border-white/50 hover:border-white hover:scale-110 bg-transparent'
                }`}
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
            </button>
          )
        })}
      </div>
    </aside>
  )
}
