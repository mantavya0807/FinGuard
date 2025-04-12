import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Detect from "./Detect.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Detect />
  </StrictMode>,
)
