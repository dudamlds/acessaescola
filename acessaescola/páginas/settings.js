import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Settings() {
  const [prefs, setPrefs] = useState({
    fontSize: 16,
    highContrast: false,
    dyslexiaFont: false,
    spacing: false
  })

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('acessa_prefs') || '{}')
    setPrefs({ ...prefs, ...saved })
  }, [])

  function save() {
    localStorage.setItem('acessa_prefs', JSON.stringify(prefs))
    // aplicar
    document.documentElement.style.setProperty('--font-size-base', prefs.fontSize + 'px')
    document.documentElement.classList.toggle('high-contrast', prefs.highContrast)
    document.documentElement.classList.toggle('dyslexia-font', prefs.dyslexiaFont)
    document.documentElement.classList.toggle('large-spacing', prefs.spacing)
    alert('Preferências salvas.')
  }

  return (
    <main className="container">
      <h1>Configurações Globais</h1>
      <p><Link href="/">← Voltar</Link></p>

      <label>
        Tamanho da fonte: {prefs.fontSize}px
        <input type="range" min="12" max="28" value={prefs.fontSize} onChange={(e) => setPrefs({...prefs, fontSize: Number(e.target.value)})} />
      </label>

      <label>
        <input type="checkbox" checked={prefs.highContrast} onChange={(e) => setPrefs({...prefs, highContrast: e.target.checked})} />
        Alto contraste
      </label>

      <label>
        <input type="checkbox" checked={prefs.dyslexiaFont} onChange={(e) => setPrefs({...prefs, dyslexiaFont: e.target.checked})} />
        Fonte para dislexia (OpenDyslexic fallback)
      </label>

      <label>
        <input type="checkbox" checked={prefs.spacing} onChange={(e) => setPrefs({...prefs, spacing: e.target.checked})} />
        Espaçamento aumentado
      </label>

      <div style={{ marginTop: 12 }}>
        <button onClick={save}>Salvar</button>
      </div>
    </main>
  )
}