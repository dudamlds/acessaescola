import { useEffect, useState } from 'react'

export default function AccessibilityToolbar() {
  const [prefs, setPrefs] = useState({
    fontSize: 16,
    highContrast: false,
    dyslexiaFont: false,
    spacing: false
  })
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('acessa_prefs') || '{}')
    setPrefs(prev => ({ ...prev, ...saved }))
  }, [])

  useEffect(() => {
    // Apply changes live when prefs change
    document.documentElement.style.setProperty('--font-size-base', prefs.fontSize + 'px')
    document.documentElement.classList.toggle('high-contrast', prefs.highContrast)
    document.documentElement.classList.toggle('dyslexia-font', prefs.dyslexiaFont)
    document.documentElement.classList.toggle('large-spacing', prefs.spacing)
    localStorage.setItem('acessa_prefs', JSON.stringify(prefs))
  }, [prefs])

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      alert('Síntese de voz não disponível neste navegador.')
      return
    }
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'pt-BR'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  return (
    <div className="accessibility-toolbar" role="region" aria-label="Barra de acessibilidade">
      <div className="toolbar-group">
        <button aria-label="Aumentar fonte" onClick={() => setPrefs(p => ({...p, fontSize: Math.min(28, p.fontSize + 2)}))}>A+</button>
        <button aria-label="Diminuir fonte" onClick={() => setPrefs(p => ({...p, fontSize: Math.max(12, p.fontSize - 2)}))}>A−</button>
      </div>

      <div className="toolbar-group">
        <button aria-pressed={prefs.highContrast} onClick={() => setPrefs(p => ({...p, highContrast: !p.highContrast}))}>Contraste</button>
        <button aria-pressed={prefs.dyslexiaFont} onClick={() => setPrefs(p => ({...p, dyslexiaFont: !p.dyslexiaFont}))}>Fonte Disléx.</button>
        <button aria-pressed={prefs.spacing} onClick={() => setPrefs(p => ({...p, spacing: !p.spacing}))}>Espaçamento</button>
      </div>

      <div className="toolbar-group">
        <button onClick={() => speak('Bem-vindo à plataforma AcessaEscola. Use a barra para ajustar a acessibilidade.')}>Ouvir</button>
        <button onClick={() => { localStorage.removeItem('acessa_prefs'); location.reload() }}>Reset</button>
      </div>
    </div>
  )
}