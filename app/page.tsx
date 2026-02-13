import Link from "next/link";
import { Section } from "@/components/section";

export default function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Projeto Next.js pronto para evoluir</h1>
        <p>
          Use esta base para iniciar qualquer aplicação com arquitetura simples,
          organizada e escalável.
        </p>
        <Link href="/about" className="button">
          Ver página de exemplo
        </Link>
      </section>

      <Section title="Estrutura sugerida">
        <ul>
          <li>
            <code>app/</code> para rotas, layouts e páginas.
          </li>
          <li>
            <code>components/</code> para blocos reutilizáveis de UI.
          </li>
          <li>
            <code>lib/</code> para utilitários e lógica de domínio.
          </li>
          <li>
            <code>public/</code> para assets estáticos.
          </li>
        </ul>
      </Section>
    </main>
  );
}
