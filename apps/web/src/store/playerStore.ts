import { create } from 'zustand'

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number // seconds
  cover: string
  audioUrl?: string
  explicit?: boolean
  hifi?: boolean
}

interface PlayerState {
  track: Track | null
  queue: Track[]
  isPlaying: boolean
  progress: number // 0-1
  volume: number  // 0-1
  shuffle: boolean
  repeat: 'off' | 'one' | 'all'
  isMuted: boolean

  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (progress: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleMute: () => void
}

export const DEMO_TRACKS: Track[] = []

const audioEl = new Audio()
audioEl.crossOrigin = 'anonymous'


export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: DEMO_TRACKS,
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  shuffle: false,
  repeat: 'off',
  isMuted: false,

  play: (track, queue) => {
    if (track.audioUrl) {
      audioEl.src = track.audioUrl
      audioEl.play().catch(console.error)
    }
    set({ track, queue: queue ?? get().queue, isPlaying: true, progress: 0 })
  },
  pause:  () => {
    audioEl.pause()
    set({ isPlaying: false })
  },
  resume: () => {
    audioEl.play().catch(console.error)
    set({ isPlaying: true })
  },
  togglePlay: () => {
    const { isPlaying, track, queue } = get()
    if (!track && queue.length > 0) {
      get().play(queue[0], queue)
    } else {
      if (isPlaying) get().pause()
      else get().resume()
    }
  },

  next: () => {
    const { queue, track, shuffle } = get()
    if (!track || queue.length === 0) return
    const idx = queue.findIndex(t => t.id === track.id)
    const next = shuffle
      ? queue[Math.floor(Math.random() * queue.length)]
      : queue[(idx + 1) % queue.length]
    set({ track: next, progress: 0, isPlaying: true })
  },

  prev: () => {
    const { queue, track } = get()
    if (!track || queue.length === 0) return
    const idx = queue.findIndex(t => t.id === track.id)
    const prev = queue[(idx - 1 + queue.length) % queue.length]
    get().play(prev, queue)
  },

  seek: (progress) => {
    if (audioEl.duration) {
      audioEl.currentTime = progress * audioEl.duration
    }
    set({ progress })
  },
  setVolume: (volume) => {
    audioEl.volume = volume
    set({ volume, isMuted: volume === 0 })
  },
  toggleShuffle: ()        => set(s => ({ shuffle: !s.shuffle })),
  toggleRepeat: ()         => set(s => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' })),
  toggleMute:   ()         => set(s => ({ isMuted: !s.isMuted })),
}))

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

audioEl.addEventListener('timeupdate', () => {
  if (audioEl.duration) {
    usePlayerStore.setState({ progress: audioEl.currentTime / audioEl.duration })
  }
})

audioEl.addEventListener('ended', () => {
  usePlayerStore.getState().next()
})
