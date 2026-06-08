import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRoot from './AppRoot.jsx'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

console.log('TODAS LAS ENV:', import.meta.env)
console.log('MODO:', import.meta.env.MODE)
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('VITE_CEREBRAS_API_KEY:', import.meta.env.VITE_CEREBRAS_API_KEY)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoot />
    </BrowserRouter>
  </React.StrictMode>,
)
