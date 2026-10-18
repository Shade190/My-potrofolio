import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, Check, Copy } from 'lucide-react'
import { GithubIcon, LinkedinIcon, InstagramIcon } from './Icons'
import confetti from 'canvas-confetti'
import { sound } from '../utils/audio'
import { Floor, Vitrine, HungWork } from './MuseumRoom'
import { COLLECTION } from '../data/collection'

export default function ContactSlide() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    sound.playClick()
    navigator.clipboard.writeText('kevmahardika.2010@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    sound.playClick()
    setStatus('submitting')

    try {
      const response = await fetch('https://formspree.io/f/xljrqozv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', message: '' })
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id="contact"
      className="relative min-h-screen w-full flex flex-col justify-center py-28 px-6 sm:px-12 bg-[#09090e] text-white select-none"
    >
      {/* ---- The room ------------------------------------------------------
          Reception. Same wall as the rest of the building (lifted off page
          black, surface stock, lit cornice, dark foot), a floor plane, a
          bench-height vitrine in the wing, and one of the collection's pictures
          on the right-hand wall, so the room reads as somewhere you wait rather
          than a form on a page. Flat planes only, no blur. */}
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
        <Vitrine className="left-[2.5%] bottom-[10%] w-24 hidden lg:block" tone="#d8d6cf" />
        <HungWork {...COLLECTION.portico} className="right-3 top-[58%]" width="w-24 2xl:w-28" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full">
        {/* Section Header (No eyebrow) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <h2 className="font-display-serif text-5xl sm:text-7xl font-medium tracking-tight text-white">
              Get In Touch
            </h2>
            <p className="inline-flex items-baseline gap-2.5 bg-[#e7e5e4] pl-3.5 pr-4 py-1.5 text-black mt-4">
              <span className="font-display-serif text-base leading-none">Room VI</span>
              <span className="font-grotesk text-[13px] text-black/65">Reception</span>
            </p>
          </div>
          <span className="text-base text-white/80 font-medium">
            Response within 24 hours
          </span>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info & Social Channels (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div>
              <h3 className="font-display-serif text-3xl font-medium text-white mb-4">
                Let's collaborate on your next digital reality.
              </h3>
              <p className="text-base text-white/80 font-grotesk leading-relaxed">
                Tertarik untuk berkolaborasi dalam pengembangan aplikasi web, perancangan antarmuka visual UI/UX yang modern, atau berdiskusi seputar arsitektur pemrograman? Silakan hubungi saya secara langsung.
              </p>
            </div>

            {/* Direct Contact Items */}
            <div className="space-y-4 font-grotesk">
              {/* Email with copy */}
              <div className="p-5 bg-[#14141c] flex items-center justify-between group">
                <a
                  href="mailto:kevmahardika.2010@gmail.com"
                  className="flex items-center gap-4 text-base text-white"
                >
                  <div className="w-10 h-10 rounded-full bg-[#20202c] flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm text-white/70 block font-medium">
                      Direct email
                    </span>
                    <span className="font-medium text-white">kevmahardika.2010@gmail.com</span>
                  </div>
                </a>
                <button
                  onClick={copyEmail}
                  className="p-2.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Copy email to clipboard"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Phone */}
              <a
                href="tel:+6285331622010"
                className="p-5 bg-[#14141c] flex items-center gap-4 text-base text-white group"
              >
                <div className="w-10 h-10 rounded-full bg-[#20202c] flex items-center justify-center text-white">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm text-white/70 block font-medium">
                    Phone &amp; WhatsApp
                  </span>
                  <span className="font-medium text-white">+62 853-3162-2010</span>
                </div>
              </a>

              {/* Location */}
              <div className="p-5 bg-[#14141c] flex items-center gap-4 text-base text-white">
                <div className="w-10 h-10 rounded-full bg-[#20202c] flex items-center justify-center text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm text-white/70 block font-medium">
                    Base location
                  </span>
                  <span className="font-medium text-white">Bogor, West Java, Indonesia</span>
                </div>
              </div>
            </div>

            {/* Social Network Channels */}
            <div className="pt-2">
              <span className="text-sm font-medium text-white/80 block mb-4">
                Digital Presence &amp; Repositories
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/Shade190"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sound.playClick()}
                  className="p-3.5 rounded-full bg-[#14141c] hover:bg-white text-white hover:text-black transition-colors"
                  aria-label="GitHub Profile"
                  title="GitHub: Shade190"
                >
                  <GithubIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/kevin-mahardika-956564405/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sound.playClick()}
                  className="p-3.5 rounded-full bg-[#14141c] hover:bg-white text-white hover:text-black transition-colors"
                  aria-label="LinkedIn Profile"
                  title="LinkedIn: Kevin Mahardika"
                >
                  <LinkedinIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/lexunvox/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sound.playClick()}
                  className="p-3.5 rounded-full bg-[#14141c] hover:bg-white text-white hover:text-black transition-colors"
                  aria-label="Instagram Profile"
                  title="Instagram: @lexunvox"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Transmission Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#14141c] p-8 sm:p-12">
            <h4 className="font-display-serif text-3xl font-medium text-white mb-8">
              Send a Message
            </h4>

            {status === 'success' ? (
              <div className="p-8 bg-emerald-500/10 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6" />
                </div>
                <h5 className="font-display-serif text-2xl font-semibold text-emerald-300">
                  Pesan Berhasil Terkirim!
                </h5>
                <p className="text-base text-white/80 font-grotesk mt-3">
                  Terima kasih telah menghubungi. Saya akan merespons pesan Anda sesegera mungkin.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="btn-pill btn-pill-outline mt-6 text-sm text-white border-white/40 cursor-pointer"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm text-white/90 mb-2 font-medium"
                  >
                    Your name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alexander Vance"
                    className="w-full px-5 py-4 bg-black border-0 text-white text-base focus:outline-none focus:ring-1 focus:ring-white transition-colors duration-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-white/90 mb-2 font-medium"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. alexander@organization.com"
                    className="w-full px-5 py-4 bg-black border-0 text-white text-base focus:outline-none focus:ring-1 focus:ring-white transition-colors duration-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm text-white/90 mb-2 font-medium"
                  >
                    Project details or inquiry
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly describe your vision, collaboration inquiry, or question..."
                    className="w-full px-5 py-4 bg-black border-0 text-white text-base focus:outline-none focus:ring-1 focus:ring-white transition-colors duration-200 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-400">
                    Gagal mengirim pesan melalui Formspree. Silakan hubungi langsung via email di kevmahardika.2010@gmail.com
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-pill btn-pill-light w-full py-4 text-sm font-semibold uppercase tracking-wider group cursor-pointer disabled:opacity-50"
                >
                  <span>{status === 'submitting' ? 'Transmitting...' : 'Dispatch Message'}</span>
                  <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
