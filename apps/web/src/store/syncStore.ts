import { create } from 'zustand'
import type { SyncEvent, ConnectedDevice } from '../../../packages/shared/src/types/sync'

// ── Device Identity ───────────────────────────────────────────────────────
const DEVICE_ID_KEY = 'lm-device-id'
const DEVICE_NAME_KEY = 'lm-device-name'
const CHANNEL_NAME = 'lm-sync-v1'

function generateDeviceId(): string {
  return `web-${Math.random().toString(36).slice(2, 10)}`
}

function getDeviceName(): string {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return `Chrome Tab`
  if (ua.includes('Firefox')) return `Firefox Tab`
  if (ua.includes('Safari')) return `Safari Tab`
  return 'Browser Tab'
}

function getOrCreateDeviceId(): string {
  let id = sessionStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = generateDeviceId()
    sessionStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export const MY_DEVICE_ID = getOrCreateDeviceId()
export const MY_DEVICE_NAME = localStorage.getItem(DEVICE_NAME_KEY) ?? getDeviceName()

// ── Store ─────────────────────────────────────────────────────────────────
interface SyncState {
  connectedDevices: ConnectedDevice[]
  isSyncEnabled: boolean
  channel: BroadcastChannel | null

  init: () => void
  destroy: () => void
  publish: (event: Omit<SyncEvent, 'deviceId' | 'deviceName' | 'platform' | 'timestamp'>) => void
  transferTo: (deviceId: string) => void
  toggleSync: () => void
  setDeviceName: (name: string) => void
}

// Stale device threshold — 15 seconds without heartbeat = gone
const STALE_MS = 15_000

export const useSyncStore = create<SyncState>((set, get) => ({
  connectedDevices: [],
  isSyncEnabled: true,
  channel: null,

  init: () => {
    if (get().channel) return // already initialised
    const ch = new BroadcastChannel(CHANNEL_NAME)

    ch.onmessage = (e: MessageEvent<SyncEvent>) => {
      const event = e.data
      if (event.deviceId === MY_DEVICE_ID) return // ignore own messages

      set(state => {
        const existing = state.connectedDevices.find(d => d.deviceId === event.deviceId)

        // Handle disconnect
        if (event.type === 'DISCONNECT') {
          return { connectedDevices: state.connectedDevices.filter(d => d.deviceId !== event.deviceId) }
        }

        const updated: ConnectedDevice = {
          deviceId: event.deviceId,
          deviceName: event.deviceName,
          platform: event.platform,
          lastSeen: event.timestamp,
          currentTrack: existing?.currentTrack,
        }

        // Update track state from relevant events
        if (['PLAY', 'TRACK_CHANGE'].includes(event.type) && event.payload.trackId) {
          updated.currentTrack = {
            id: event.payload.trackId,
            title: event.payload.trackTitle ?? '',
            artist: event.payload.trackArtist ?? '',
            cover: event.payload.trackCover ?? '',
            progress: event.payload.progress ?? 0,
            isPlaying: event.type === 'PLAY' || event.type === 'TRACK_CHANGE',
          }
        }
        if (event.type === 'PAUSE' && updated.currentTrack) {
          updated.currentTrack = { ...updated.currentTrack, isPlaying: false }
        }
        if (event.type === 'SEEK' && updated.currentTrack) {
          updated.currentTrack = { ...updated.currentTrack, progress: event.payload.progress ?? 0 }
        }

        if (existing) {
          return {
            connectedDevices: state.connectedDevices.map(d =>
              d.deviceId === event.deviceId ? updated : d
            ),
          }
        } else {
          return { connectedDevices: [...state.connectedDevices, updated] }
        }
      })
    }

    set({ channel: ch })

    // Heartbeat — announce presence every 10s
    const heartbeatInterval = setInterval(() => {
      if (!get().isSyncEnabled) return
      get().publish({ type: 'HEARTBEAT', payload: {} })

      // Prune stale devices
      const now = Date.now()
      set(state => ({
        connectedDevices: state.connectedDevices.filter(d => now - d.lastSeen < STALE_MS),
      }))
    }, 10_000)

    // Announce on load
    get().publish({ type: 'HEARTBEAT', payload: {} })

    // Cleanup on tab close
    window.addEventListener('beforeunload', () => {
      get().publish({ type: 'DISCONNECT', payload: {} })
      clearInterval(heartbeatInterval)
      ch.close()
    })
  },

  destroy: () => {
    get().publish({ type: 'DISCONNECT', payload: {} })
    get().channel?.close()
    set({ channel: null, connectedDevices: [] })
  },

  publish: (partial) => {
    const { channel, isSyncEnabled } = get()
    if (!channel || !isSyncEnabled) return

    const event: SyncEvent = {
      ...partial,
      deviceId: MY_DEVICE_ID,
      deviceName: MY_DEVICE_NAME,
      platform: 'web',
      timestamp: Date.now(),
    }
    channel.postMessage(event)
  },

  transferTo: (deviceId) => {
    // Signal that this device is handing off playback
    // The receiving device should start playing the current track
    // (In future, the backend WebSocket will relay this cross-network)
    const { connectedDevices } = get()
    const target = connectedDevices.find(d => d.deviceId === deviceId)
    if (!target) return

    // Pause this device by triggering a player event
    // (playerStore listens for TRANSFER events — future)
    console.log(`[Sync] Transferring playback to ${target.deviceName}`)
  },

  toggleSync: () => set(s => ({ isSyncEnabled: !s.isSyncEnabled })),

  setDeviceName: (name) => {
    localStorage.setItem(DEVICE_NAME_KEY, name)
    // Force re-announce with new name
    get().publish({ type: 'HEARTBEAT', payload: {} })
  },
}))
