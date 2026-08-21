import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EasterEgg from './EasterEgg'
import './easter-egg.css'

createRoot(document.getElementById('easter-egg-root')!).render(
  <StrictMode>
    <EasterEgg />
  </StrictMode>,
)