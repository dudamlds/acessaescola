import { useEffect, useState } from 'react'
import StudentCard from '../components/StudentCard'
import StudentForm from '../components/StudentForm'
import Link from 'next/link'

export default function Students() {
  const [students, setStudents] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('acessa_students')
    setStudents(raw ? JSON.parse(raw) : [])
  }, [])

  function saveAll(newStudents) {
    localStorage.setItem('acessa_students', JSON.stringify(newStudents))
    setStudents(newStudents)
    setEditing(null)
  }

  function handleDelete(id) {
    const filtered = students.filter(s => s.id !== id)
    saveAll(filtered)
  }

  return (
    <main className="container">
      <h1>Estudantes</h1>
      <p><Link href="/">← Voltar</Link></p>

      <section aria-labelledby="novo-estudante">
        <h2 id="novo-estudante">{editing ? 'Editar Estudante' : 'Adicionar Estudante'}</h2>
        <StudentForm students={students} saveAll={saveAll} editing={editing} setEditing={setEditing} />
      </section>

      <section aria-labelledby="lista-estudantes">
        <h2 id="lista-estudantes">Lista de Estudantes</h2>
        {students.length === 0 && <p>Nenhum estudante cadastrado.</p>}
        <ul className="student-list">
          {students.map(s => (
            <li key={s.id}>
              <StudentCard student={s} onDelete={handleDelete} onEdit={() => setEditing(s)} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}