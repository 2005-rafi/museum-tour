import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Import all styles
import './index.css'
import './styles/navbar.css'
import './styles/header-footer.css'
import './styles/hero.css'
import './styles/exhibits.css'
import './styles/about.css'
import './styles/blog-post.css'
import './styles/contact.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
