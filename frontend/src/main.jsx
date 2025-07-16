import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// frontend/src/main.jsx (ou main.js)

// frontend/src/main.jsx (ou main.js)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <-- Esta linha já existe
// REMOVA A LINHA "import './tailwind.css';" se ela existir aqui!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
