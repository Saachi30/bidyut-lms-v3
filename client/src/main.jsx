// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { BrowserRouter as Router } from 'react-router-dom'

// createRoot(document.getElementById('root')).render(
//   // <StrictMode>
//   <Router>
//     <App />
//     </Router>
//   // </StrictMode>,
// )


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
// import ScreenProtection from './utils/screenProtection.js'
import { SocketProvider } from './utils/SocketContext.jsx'

// Initialize screen protection after the app loads
// document.addEventListener('DOMContentLoaded', () => {
//   // Allow a small delay for all content to render
//   setTimeout(() => {
//     ScreenProtection.init();
//   }, 500);
// });

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Router>
  <SocketProvider>
    <App />
  </SocketProvider>
  </Router>
  // </StrictMode>
)