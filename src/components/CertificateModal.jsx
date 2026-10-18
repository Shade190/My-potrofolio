import React, { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react'

export default function CertificateModal({ item, onClose, onPrev, onNext }) {
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    setZoom(1)
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onPrev) onPrev()
      if (e.key === 'ArrowRight' && onNext) onNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [item, onClose, onPrev, onNext])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 transition-opacity duration-300 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[#111115] text-white rounded-[9px] border border-white/15 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d10]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <div>
              <h3 className="text-sm font-medium tracking-wide text-white/95">
                {item.title || 'Exhibition Artifact'}
              </h3>
              <p className="text-[13px] text-white/50 tracking-wider uppercase font-grotesk">
                {item.issuer || item.category || 'Documentation & Credential'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <a
              href={item.image}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Open full resolution in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors ml-2"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="relative flex-1 min-h-[50vh] max-h-[75vh] flex items-center justify-center p-6 overflow-auto bg-black/40">
          <img
            src={item.image}
            alt={item.title || 'Enlarged View'}
            className="max-h-full max-w-full object-contain rounded transition-transform duration-200 select-none"
            style={{ transform: `scale(${zoom})` }}
          />

          {/* Navigation Arrows */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer info & tags */}
        {item.description && (
          <div className="px-6 py-4 bg-[#0d0d10] flex items-center justify-between text-sm text-white/75">
            <span>{item.description}</span>
            <span className="text-sm text-white/60">Use arrow keys to navigate</span>
          </div>
        )}
      </div>
    </div>
  )
}
