import Link from "next/link";
import Button from "./components/Button";

export default function Home() {
  return (
    <main style={{ padding: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <h1>Olá, financeControl</h1>
      <Link href="/login">Entrar</Link>

      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <Button icon="plus">Nova conta</Button>
        <Button variant="secondary">Cancelar</Button>
        <Button variant="ghost" icon="chevron">Ver todas</Button>
        <Button variant="danger" icon="trash">Apagar conta</Button>
        <Button size="sm" icon="check">Salvar</Button>
        <Button disabled>Desabilitado</Button>
      </div>
    </main>
  );
}