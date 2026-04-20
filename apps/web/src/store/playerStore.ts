/**
 * Shared Player Store
 * -------------------
 * Manages playback state, queue, and tracks.
 */

import { create } from 'zustand'
import { Track } from '../../../../packages/shared/src/types/track'

interface PlayerState {
  track: Track | null
  queue: Track[]
  isPlaying: boolean
  progress: number
  volume: number
  isMuted: boolean
  shuffle: boolean
  repeat: 'off' | 'all' | 'one'

  // Actions
  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  togglePlay: () => void
  setVolume: (v: number) => void
  setMuted: (v: boolean) => void
  toggleMute: () => void
  seek: (progress: number) => void
  setProgress: (progress: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  setQueue: (queue: Track[]) => void
}

// Helper to normalize track data from different API types
export const normalizeTrack = (raw: any): Track => {
  const id = raw.id || raw.trackId
  return {
    ...raw,
    id,
    artistName: raw.artistName || (typeof raw.artist === 'object' ? raw.artist?.name : raw.artist) || 'Unknown Artist',
    albumTitle: raw.albumTitle || raw.album?.title || 'Unknown Album',
    duration: raw.duration || raw.duration_ms / 1000 || 0,
    audioUrl: raw.audioUrl || `/api/music/${id}/stream`,
    cover: raw.cover || raw.coverUrl || raw.album?.coverArt || `https://api.dicebear.com/7.x/shapes/svg?seed=${id}`
  }
}

export const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const getArtistName = (track: Track | null) => {
  return track?.artistName || 'Unknown Artist'
}

export const getCoverUrl = (track: Track | null) => {
  return track?.cover || `https://api.dicebear.com/7.x/shapes/svg?seed=${track?.id}`
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: [],
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: 'off',

  play: (rawTrack, rawQueue) => {
    const track = normalizeTrack(rawTrack)
    const queue = rawQueue ? rawQueue.map(normalizeTrack) : get().queue

    set({ track, queue, isPlaying: true, progress: 0 })
    
    // Publish to Sync
    import('./syncStore').then(({ useSyncStore }) => {
      useSyncStore.getState().publish({
        type: 'TRACK_CHANGE',
        payload: {
          trackId: track.id,
          trackTitle: track.title,
          trackArtist: track.artistName,
          trackCover: track.cover,
          duration: track.duration,
          progress: 0
        }
      })
    })
  },

  pause: () => {
    set({ isPlaying: false })
    import('./syncStore').then(({ useSyncStore }) => {
      useSyncStore.getState().publish({ type: 'PAUSE', payload: {} })
    })
  },

  resume: () => {
    set({ isPlaying: true })
    const track = get().track
    if (track) {
      import('./syncStore').then(({ useSyncStore }) => {
        useSyncStore.getState().publish({
          type: 'PLAY',
          payload: {
            trackId: track.id,
            trackTitle: track.title,
            trackArtist: track.artistName,
            trackCover: track.cover,
            duration: track.duration,
            progress: get().progress
          }
        })
      })
    }
  },

  togglePlay: () => {
    if (get().isPlaying) get().pause()
    else if (get().track) get().resume()
  },

  next: () => {
    const { track, queue, shuffle, repeat } = get()
    if (!track || queue.length === 0) return

    if (repeat === 'one') {
      get().play(track)
      return
    }

    const currentIndex = queue.findIndex(t => t.id === track.id)
    let nextIndex = currentIndex + 1

    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else if (nextIndex >= queue.length) {
      if (repeat === 'all') nextIndex = 0
      else {
        set({ isPlaying: false, progress: 0 })
        return
      }
    }

    get().play(queue[nextIndex])
  },

  prev: () => {
    const { track, queue, progress } = get()
    if (!track || queue.length === 0) return

    if (progress > 0.05) {
      get().play(track)
      return
    }

    const currentIndex = queue.findIndex(t => t.id === track.id)
    let prevIndex = currentIndex - 1
    if (prevIndex < 0) prevIndex = queue.length - 1

    get().play(queue[prevIndex])
  },

  setVolume: (volume) => {
    set({ volume, isMuted: volume === 0 })
  },

  setMuted: (isMuted) => {
    set({ isMuted })
  },

  toggleMute: () => {
    set(state => ({ isMuted: !state.isMuted }))
  },

  seek: (progress) => {
    set({ progress })
    import('./syncStore').then(({ useSyncStore }) => {
      useSyncStore.getState().publish({
        type: 'SEEK',
        payload: { progress }
      })
    })
  },

  setProgress: (progress) => {
    set({ progress })
  },

  toggleShuffle: () => {
    set(state => ({ shuffle: !state.shuffle }))
  },

  toggleRepeat: () => {
    set(state => {
      const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one']
      const currentIdx = modes.indexOf(state.repeat)
      const nextIdx = (currentIdx + 1) % modes.length
      return { repeat: modes[nextIdx] }
    })
  },

  setQueue: (queue) => {
    set({ queue: queue.map(normalizeTrack) })
  }
}))
