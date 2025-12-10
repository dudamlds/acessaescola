import '../styles/globals.css'
import { useEffect } from 'react'
import AccessibilityToolbar from '../components/AccessibilityToolbar'

function MyApp({ Component, pageProps }) {
  // Aplica preferências salvas ao carregar
  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem('acessa_prefs') || '{}')
    if (prefs) {
      if (prefs.fontSize) document.documentElement.style.setProperty('--font-size-base', prefs.fontSize + 'px')
      if (prefs.highContrast) document.documentElement.classList.add('high-contrast')
      if (prefs.dyslexiaFont) document.documentElement.classList.add('dyslexia-font')
      if (prefs.spacing) document.documentElement.classList.add('large-spacing')
    }
  }, [])

  return (
    <>
      <AccessibilityToolbar />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp