import { StrictMode } from 'react'
console.log('🏁 main.tsx is executing')
window.alert('DEBUG: main.tsx is executing')
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useSyncStore } from './store/syncStore'

// Initialise the BroadcastChannel sync engine on mount
// useSyncStore.getState().init()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
