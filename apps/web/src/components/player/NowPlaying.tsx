import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore, formatTime, getArtistName, getCoverUrl } from '../../store/playerStore'
import { useSyncStore } from '../../store/syncStore'
import DeviceSync from '../ui/DeviceSync'
import './NowPlaying.css'

/**
 * Robust HTMLAudioElement manager
 */
function AudioEngine() {
  const { track, isPlaying, volume, isMuted, progress, setProgress, next } = usePlayerStore()
  const audioRef = useRef<HTMLAudioElement>(null)

  // Handle Event Subscriptions
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      const dur = audio.duration || 0
      const curr = audio.currentTime || 0
      const p = dur > 0 ? curr / dur : 0
      if (!isNaN(p)) setProgress(p)
    }

    const onEnded = () => next()

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [setProgress, next])

  // Handle Play/Pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && track?.audioUrl) {
      audio.play().catch(err => {
        console.warn('[AudioEngine] Playback prevented:', err.message)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, track?.id, track?.audioUrl])

  // Handle Internal Sync (Seek)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audio.duration || isNaN(audio.duration)) return
    
    const targetTime = (progress || 0) * audio.duration
    if (Math.abs(audio.currentTime - targetTime) > 2) {
      audio.currentTime = targetTime
    }
  }, [progress])

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : (volume || 0.8)
    }
  }, [volume, isMuted])

  return (
    <audio 
      ref={audioRef} 
      src={track?.audioUrl || ''} 
      crossOrigin="anonymous" 
      style={{ display: 'none' }} 
    />
  )
}

export default function NowPlayingBar() {
  const {
    track, isPlaying, progress, volume, shuffle, repeat, isMuted,
    togglePlay, next, prev, seek, setVolume, toggleShuffle, toggleRepeat, toggleMute,
  } = usePlayerStore()
  const { connectedDevices } = useSyncStore()
  const navigate = useNavigate()
  const [showDeviceSync, setShowDeviceSync] = useState(false)

  const deviceCount = 1 + (connectedDevices?.length || 0)

  if (!track) return <div className="now-playing-bar glass-heavy" />

  const elapsed   = Math.floor((progress || 0) * (track.duration || 0))
  const volumeVal = isMuted ? 0 : (volume || 0.8)

  return (
    <>
      <AudioEngine />

      <div className="now-playing-bar glass-heavy">
        {/* Left: Track info */}
        <div className="now-playing-left" onClick={() => navigate('/now-playing')}>
          <img src={getCoverUrl(track)} alt={track.title} className="now-playing-cover" />
          <div className="now-playing-info">
            <span className="now-playing-title truncate">{track.title}</span>
            <span className="now-playing-artist truncate">{getArtistName(track)}</span>
          </div>
          <button className="btn-icon now-playing-heart" onClick={e => e.stopPropagation()}>♡</button>
        </div>

        {/* Center: Controls + Seek */}
        <div className="now-playing-center">
          <div className="now-playing-controls">
            <button
              className={`btn-icon${shuffle ? ' active-ctrl' : ''}`}
              onClick={toggleShuffle}
              title="Shuffle"
            >⇄</button>
            <button className="btn-icon" onClick={prev} title="Previous">⏮</button>
            <button className="btn-play-large" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="btn-icon" onClick={next} title="Next">⏭</button>
            <button
              className={`btn-icon${repeat !== 'off' ? ' active-ctrl' : ''}`}
              onClick={toggleRepeat}
              title="Repeat"
            >{repeat === 'one' ? '🔂' : '⇆'}</button>
          </div>

          <div className="now-playing-seek">
            <span className="now-playing-time">{formatTime(elapsed)}</span>
            <div className="seek-bar-container">
              <input
                type="range"
                className="seek-bar-input"
                min="0"
                max="1"
                step="0.001"
                value={progress || 0}
                onChange={(e) => seek(parseFloat(e.target.value))}
              />
              <div className="seek-bar-track">
                <div className="seek-bar-fill" style={{ width: `${(progress || 0) * 100}%` }} />
              </div>
            </div>
            <span className="now-playing-time">{formatTime(track.duration)}</span>
          </div>
        </div>

        {/* Right: Volume + Devices + Full screen */}
        <div className="now-playing-right">
          <div className="volume-control">
            <button className="btn-icon" onClick={toggleMute} title="Volume">
              {volumeVal === 0 ? '🔇' : volumeVal < 0.5 ? '🔉' : '🔊'}
            </button>
            <div className="volume-bar-container">
              <input
                type="range"
                className="seek-bar-input volume-input"
                min="0"
                max="1"
                step="0.01"
                value={volumeVal}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
              <div className="seek-bar-track">
                <div className="seek-bar-fill" style={{ width: `${volumeVal * 100}%` }} />
              </div>
            </div>
          </div>

          <button
            className={`btn-icon device-sync-btn${deviceCount > 1 ? ' has-devices' : ''}`}
            onClick={() => setShowDeviceSync(true)}
            title={`${deviceCount} devices connected`}
          >
            <span>📱</span>
            {deviceCount > 1 && <span className="device-count-badge">{deviceCount}</span>}
          </button>

          <button className="btn-icon" onClick={() => navigate('/now-playing')} title="Full screen">⛶</button>
        </div>
      </div>

      {showDeviceSync && <DeviceSync onClose={() => setShowDeviceSync(false)} />}
    </>
  )
}
