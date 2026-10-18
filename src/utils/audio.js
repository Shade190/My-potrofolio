// Web Audio API subtle tactile feedback - zero external files
class SoundEngine {
  constructor() {
    this.ctx = null
    this.enabled = false
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.ctx = new AudioContext()
      }
    }
  }

  toggle() {
    this.init()
    this.enabled = !this.enabled
    if (this.enabled && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.enabled
  }

  playClick() {
    if (!this.enabled || !this.ctx) return
    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(620, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.04)
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch {
      // Audio context might be restricted
    }
  }

  playSwoosh() {
    if (!this.enabled || !this.ctx) return
    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.08)
    } catch {
      // Audio context might be restricted
    }
  }
}

export const sound = new SoundEngine()
