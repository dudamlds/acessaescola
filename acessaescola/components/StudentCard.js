import Link from 'next/link'

export default function StudentCard({ student, onDelete, onEdit }) {
  return (
    <article className="student-card" aria-labelledby={`student-${student.id}`}>
      <h3 id={`student-${student.id}`}>{student.name}</h3>
      <p>Idade: {student.age}</p>

      <div className="card-actions">
        <Link href={`/profile/${student.id}`}><a>Ver perfil</a></Link>
        <button onClick={() => onEdit(student)} aria-label={`Editar ${student.name}`}>Editar</button>
        <button onClick={() => onDelete(student.id)} aria-label={`Excluir ${student.name}`}>Excluir</button>
      </div>
    </article>
  )
}