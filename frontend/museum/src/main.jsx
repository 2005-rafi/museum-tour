import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppProviders from './app/providers'

// Global styles
import './index.css'
import './styles/colors.css'
import './styles/index.css'
import './styles/header-footer.css'
import './styles/hero.css'
import './styles/home.css'
import './styles/museums.css'
import './styles/museum.css'
import './styles/artifacts.css'
import './styles/about.css'
import './styles/contact.css'
import './styles/auth.css'
import './styles/profile.css'
import './styles/search.css'
import './styles/admin.css'
import './styles/error-boundary.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
