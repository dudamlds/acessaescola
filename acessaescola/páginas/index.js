import Link from 'next/link'

export default function Home() {
  return (
    <main className="container">
      <header>
        <h1>AcessaEscola — Sistema de Acessibilidade</h1>
        <p>Configure ajustes de acessibilidade para estudantes com necessidades específicas.</p>
      </header>

      <section>
        <h2>Funcionalidades</h2>
        <ul>
          <li>Perfis personalizados para cada estudante</li>
          <li>Barra de acessibilidade com TTS, alto contraste, fonte para dislexia, etc.</li>
          <li>Salvamento no navegador (localStorage) — pronto para integrar com backend</li>
        </ul>
      </section>

      <nav aria-label="Navegação principal">
        <ul>
          <li><Link href="/students">Gerenciar Estudantes</Link></li>
          <li><Link href="/settings">Configurações</Link></li>
        </ul>
      </nav>

      <footer>
        <p>Feito para escolas — acessibilidade em primeiro lugar.</p>
      </footer>
    </main>
  )
}