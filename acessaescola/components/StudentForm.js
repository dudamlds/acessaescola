import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function StudentForm({ students, saveAll, editing, setEditing }) {
  const initial = { id: '', name: '', age: '', prefs: { fontSize: 16, highContrast: false, dyslexiaFont: false, spacing: false } }
  const [data, setData] = useState(initial)

  useEffect(() => {
    if (editing) setData(editing)
    else setData(initial)
  }, [editing])

  function submit(e) {
    e.preventDefault()
    if (!data.name) return alert('Nome é obrigatório')
    let updated
    if (data.id) {
      updated = students.map(s => s.id === data.id ? data : s)
    } else {
      data.id = uuidv4()
      updated = [...students, data]
    }
    saveAll(updated)
    setData(initial)
  }

  return (
    <form onSubmit={submit} aria-label="Formulário de estudante">
      <label>
        Nome
        <input value={data.name} onChange={(e) => setData({...data, name: e.target.value})} />
      </label>

      <label>
        Idade
        <input type="number" value={data.age} onChange={(e) => setData({...data, age: e.target.value})} />
      </label>

      <fieldset>
        <legend>Preferências do estudante</legend>
        <label>
          Tamanho da fonte: {data.prefs.fontSize}px
          <input type="range" min="12" max="28" value={data.prefs.fontSize} onChange={(e) => setData({...data, prefs: {...data.prefs, fontSize: Number(e.target.value)}})} />
        </label>

        <label>
          <input type="checkbox" checked={data.prefs.highContrast} onChange={(e) => setData({...data, prefs: {...data.prefs, highContrast: e.target.checked}})} />
          Alto contraste
        </label>

        <label>
          <input type="checkbox" checked={data.prefs.dyslexiaFont} onChange={(e) => setData({...data, prefs: {...data.prefs, dyslexiaFont: e.target.checked}})} />
          Fonte para dislexia
        </label>

        <label>
          <input type="checkbox" checked={data.prefs.spacing} onChange={(e) => setData({...data, prefs: {...data.prefs, spacing: e.target.checked}})} />
          Espaçamento aumentado
        </label>
      </fieldset>

      <div style={{ marginTop: 8 }}>
        <button type="submit">{data.id ? 'Salvar' : 'Adicionar'}</button>
        {data.id && <button type="button" onClick={() => setEditing(null)}>Cancelar</button>}
      </div>
    </form>
  )
}