import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX, Menu, X } from 'lucide-react'
import { sound } from '../utils/audio'

export default function Navbar({ activeSection, isDark }) {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [avatarOk, setAvatarOk] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleSound = () => {
    const state = sound.toggle()
    setAudioEnabled(state)
    if (state) sound.playClick()
  }

  const scrollTo = (id) => {
    sound.playClick()
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      if (window.__lenis) {
        window.__lenis.scrollTo(el, {
          offset: 0,
          duration: 1.6,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        })
      } else {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const navLinks = [
    { id: 'hero', label: 'Index' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
  ]

  const isLight = !isDark && activeSection < 2

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,padding] duration-300 ${
        scrolled
          ? isLight
            ? 'bg-[#c4c3b6]/95 py-4'
            : 'bg-[#000000]/95 py-4'
          : 'bg-transparent py-7'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
        {/* Circled Logo Mark as prescribed by DESIGN.md */}
        <button
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-3.5 group text-left cursor-pointer"
          aria-label="Kevin Mahardika — Return to Hero"
        >
          <div
            className={`w-9 h-9 rounded-full border overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
              isLight
                ? 'border-black text-black'
                : 'border-white text-white'
            }`}
          >
            {avatarOk ? (
              <img
                src="/owner-square.jpg"
                alt=""
                width="36"
                height="36"
                decoding="async"
                onError={() => setAvatarOk(false)}
                className="w-full h-full object-cover portrait-desat"
              />
            ) : (
              <span className="font-display-serif text-sm font-bold tracking-tighter">KM</span>
            )}
          </div>
          <div>
            <span
              className={`text-sm font-semibold tracking-wide block ${
                isLight ? 'text-black' : 'text-white'
              }`}
            >
              Kevin Mahardika
            </span>
          </div>
        </button>

        {/* Ghost Text Links (as specified in DESIGN.md) */}
        <nav className="hidden md:flex items-center gap-9 text-sm font-grotesk">
          {navLinks.map((link, idx) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`transition-colors duration-200 cursor-pointer ${
                activeSection === idx
                  ? isLight
                    ? 'text-black font-semibold underline underline-offset-8 decoration-2'
                    : 'text-white font-semibold underline underline-offset-8 decoration-2'
                  : isLight
                  ? 'text-black/70 hover:text-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right CTA cluster */}
        <div className="flex items-center gap-3">
          {/* Subtle Audio Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isLight
                ? 'border-black/30 text-black hover:bg-black/10'
                : 'border-white/30 text-white hover:bg-white/10'
            }`}
            title={audioEnabled ? 'Mute Audio Clicks' : 'Enable Tactile Audio'}
            aria-label="Toggle tactile audio"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
          </button>

          {/* Pill Action Button CTA */}
          <button
            onClick={() => scrollTo('contact')}
            className={`hidden sm:inline-flex btn-pill cursor-pointer ${
              isLight ? 'btn-pill-dark' : 'btn-pill-light'
            }`}
          >
            Get In Touch
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded md:hidden cursor-pointer ${isLight ? 'text-black' : 'text-white'}`}
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-6 py-6 transition-colors ${
            isLight
              ? 'bg-[#c4c3b6] text-black'
              : 'bg-black text-white'
          }`}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left text-lg py-2 font-medium"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo('contact')}
              className={`btn-pill w-full mt-4 ${isLight ? 'btn-pill-dark' : 'btn-pill-light'}`}
            >
              Get In Touch
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
