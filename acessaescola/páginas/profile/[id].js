import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Profile() {
  const router = useRouter()
  const { id } = router.query
  const [student, setStudent] = useState(null)

  useEffect(() => {
    if (!id) return
    const students = JSON.parse(localStorage.getItem('acessa_students') || '[]')
    const s = students.find(x => x.id === id)
    setStudent(s || null)
  }, [id])

  if (!student) return <main className="container"><p>Carregando perfil...</p></main>

  function applyProfile() {
    // Salva nas preferências globais
    const prefs = JSON.parse(localStorage.getItem('acessa_prefs') || '{}')
    Object.assign(prefs, student.prefs || {})
    localStorage.setItem('acessa_prefs', JSON.stringify(prefs))
    // Aplicar imediatamente
    if (prefs.fontSize) document.documentElement.style.setProperty('--font-size-base', prefs.fontSize + 'px')
    if (prefs.highContrast) document.documentElement.classList.toggle('high-contrast', prefs.highContrast)
    if (prefs.dyslexiaFont) document.documentElement.classList.toggle('dyslexia-font', prefs.dyslexiaFont)
    if (prefs.spacing) document.documentElement.classList.toggle('large-spacing', prefs.spacing)
    alert(Preferências de ${student.name} aplicadas.)
  }

  return (
    <main className="container">
      <h1>Perfil: {student.name}</h1>
      <p>Idade: {student.age}</p>

      <section>
        <h2>Preferências</h2>
        <pre>{JSON.stringify(student.prefs, null, 2)}</pre>
      </section>

      <button onClick={applyProfile} aria-label={Aplicar preferências de ${student.name}}>
        Aplicar perfil
      </button>
    </main>
  )
}